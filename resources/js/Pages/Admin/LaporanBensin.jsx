import React, { useState, useEffect, useRef } from 'react';
import LayoutAdmin from '../../layout/LayoutAdmin';
import { useTheme } from '../../contexts/ThemeContext';
import { router, usePage } from '@inertiajs/react';
import PageHeader from '../../components/admin/PageHeader';

export default function LaporanBensin({ struks, filters = {} }) {
    const { currentTheme } = useTheme();
    const { props } = usePage();
    const flash = props?.flash || {};

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const searchTimeoutRef = useRef(null);

    // Modal reimburse state
    const [reimburseModal, setReimburseModal] = useState(false);
    const [selectedStruk, setSelectedStruk] = useState(null);
    const [buktiFile, setBuktiFile] = useState(null);
    const [buktiPreview, setBuktiPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal lihat gambar
    const [imageModal, setImageModal] = useState(false);
    const [imageModalSrc, setImageModalSrc] = useState('');
    const [imageModalTitle, setImageModalTitle] = useState('');

    // Flash notification
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (flash.success) {
            setNotification({ type: 'success', message: flash.success });
            const t = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(t);
        }
        if (flash.error) {
            setNotification({ type: 'error', message: flash.error });
            const t = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    useEffect(() => {
        if (filters.search !== undefined) {
            setSearchQuery(filters.search || '');
        }
    }, [filters]);

    const applyFilters = (search, page = 1) => {
        const params = {};
        if (search && search.trim() !== '') {
            params.search = search.trim();
        }
        params.page = page;
        router.get('/admin/laporan-bensin', params, {
            preserveState: true,
            preserveScroll: true,
            only: ['struks', 'filters'],
            replace: true,
        });
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => applyFilters(value, 1), 500);
    };

    const handlePaginationClick = (url, e) => {
        if (!url) return;
        if (e) { e.preventDefault(); e.stopPropagation(); }
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            only: ['struks', 'filters'],
            replace: true,
        });
    };

    const openReimburseModal = (struk) => {
        setSelectedStruk(struk);
        setBuktiFile(null);
        setBuktiPreview(null);
        setReimburseModal(true);
    };

    const closeReimburseModal = () => {
        setReimburseModal(false);
        setSelectedStruk(null);
        setBuktiFile(null);
        setBuktiPreview(null);
        setIsSubmitting(false);
    };

    const openImageModal = (src, title) => {
        setImageModalSrc(src);
        setImageModalTitle(title);
        setImageModal(true);
    };

    const closeImageModal = () => {
        setImageModal(false);
        setImageModalSrc('');
        setImageModalTitle('');
    };

    const handleBuktiChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBuktiFile(file);
            setBuktiPreview(URL.createObjectURL(file));
        }
    };

    const handleReimburseSubmit = () => {
        if (!buktiFile || !selectedStruk) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('struk_bensin_id', selectedStruk.id);
        formData.append('bukti_reimburse', buktiFile);

        router.post('/admin/laporan-bensin/reimburse', formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                closeReimburseModal();
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    const getStatusBadge = (struk) => {
        if (struk.is_reimburse) {
            return { label: 'Selesai', color: '#10b981', bg: '#10b98120' };
        }
        if (struk.is_accept === true) {
            return { label: 'Diterima', color: '#3b82f6', bg: '#3b82f620' };
        }
        if (struk.is_accept === false) {
            return { label: 'Ditolak', color: '#ef4444', bg: '#ef444420' };
        }
        return { label: 'Menunggu', color: '#f59e0b', bg: '#f59e0b20' };
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
        });

    const data = struks?.data || struks || [];

    return (
        <LayoutAdmin>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    currentTheme={currentTheme}
                    title="Laporan Biaya Bensin"
                    subtitle="Kelola dan pantau pengajuan reimburse bensin driver"
                />

                {/* Notification */}
                {notification && (
                    <div
                        className="px-5 py-3 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-300"
                        style={{
                            background: notification.type === 'success' ? '#10b98120' : '#ef444420',
                            borderColor: notification.type === 'success' ? '#10b98150' : '#ef444450',
                            color: notification.type === 'success' ? '#10b981' : '#ef4444',
                        }}
                    >
                        {notification.message}
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama driver, bank, atau nomor rekening..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full rounded-xl border bg-white/10 backdrop-blur-sm py-3 px-4 pl-12 text-white placeholder-gray-400 outline-none focus:ring-2 transition-all"
                        style={{
                            borderColor: `${currentTheme.hex.primary}40`,
                            '--tw-ring-color': currentTheme.hex.primary,
                        }}
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(''); applyFilters('', 1); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Table / Empty State */}
                {data.length === 0 ? (
                    <div
                        className="backdrop-blur-sm rounded-xl p-12 border shadow-xl text-center"
                        style={{
                            background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}10, ${currentTheme.hex.secondary}10)`,
                            borderColor: `${currentTheme.hex.primary}30`,
                        }}
                    >
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-400 text-lg">
                            {searchQuery ? 'Tidak ada data yang sesuai pencarian' : 'Belum ada pengajuan bensin'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Cards */}
                        <div className="grid gap-4">
                            {data.map((struk, index) => {
                                const status = getStatusBadge(struk);
                                // Tampilkan tombol Reimburse selama belum selesai dan tidak ditolak
                                const canReimburse = struk.is_accept !== false && !struk.is_reimburse;
                                return (
                                    <div
                                        key={struk.id}
                                        className="backdrop-blur-sm rounded-xl p-5 border shadow-xl transition-all duration-300 hover:scale-[1.005]"
                                        style={{
                                            background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}10, ${currentTheme.hex.secondary}10)`,
                                            borderColor: `${currentTheme.hex.primary}30`,
                                            animationDelay: `${index * 60}ms`,
                                        }}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            {/* Gambar struk - klik untuk lihat */}
                                            <div className="flex-shrink-0">
                                                <button
                                                    onClick={() => openImageModal(`/storage/${struk.gambar}`, 'Struk Bensin')}
                                                    className="w-16 h-16 rounded-xl overflow-hidden border block transition-all hover:scale-105 hover:ring-2 focus:outline-none"
                                                    style={{
                                                        borderColor: `${currentTheme.hex.primary}40`,
                                                        '--tw-ring-color': currentTheme.hex.primary,
                                                    }}
                                                    title="Klik untuk melihat gambar"
                                                >
                                                    <img
                                                        src={`/storage/${struk.gambar}`}
                                                        alt="Struk Bensin"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-white font-bold text-base truncate">
                                                        {struk.user?.username || struk.user?.name || 'Driver'}
                                                    </p>
                                                    <span
                                                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                                        style={{ background: status.bg, color: status.color }}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-300">
                                                    <span className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                        {struk.bank}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4" style={{ color: currentTheme.hex.secondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                        </svg>
                                                        {struk.no_rekening}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">
                                                        {formatDate(struk.created_at)}
                                                    </span>
                                                </div>

                                                {/* Bukti reimburse */}
                                                {struk.bukti_reimburse && (
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Bukti reimburse telah diupload
                                                        <a
                                                            href={`/storage/${struk.bukti_reimburse}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline hover:text-white transition-colors"
                                                            style={{ color: currentTheme.hex.primary }}
                                                        >
                                                            Lihat
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                                {/* Tombol Lihat Bill */}
                                                <button
                                                    onClick={() => openImageModal(`/storage/${struk.gambar}`, `Struk Bensin - ${struk.user?.username || 'Driver'}`)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-white/10"
                                                    style={{
                                                        borderColor: `${currentTheme.hex.primary}50`,
                                                        color: currentTheme.hex.primary,
                                                    }}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Lihat Bill
                                                </button>

                                                {/* Tombol Reimburse / Badge Selesai */}
                                                {canReimburse ? (
                                                    <button
                                                        onClick={() => openReimburseModal(struk)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                                                        style={{
                                                            background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                                            boxShadow: `0 4px 15px ${currentTheme.hex.primary}40`,
                                                        }}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Reimburse
                                                    </button>
                                                ) : struk.is_reimburse ? (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#10b98120', color: '#10b981' }}>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Selesai
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {struks?.total > 0 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                                <div className="text-sm text-gray-400">
                                    Menampilkan {struks.from || 0}–{struks.to || 0} dari {struks.total || 0} data
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => handlePaginationClick(struks.links[0].url, e)}
                                        disabled={!struks.links[0].url}
                                        className="px-4 py-2 rounded-lg border text-white font-medium transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {struks.links.slice(1, -1).map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => handlePaginationClick(link.url, e)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                    link.active ? 'text-white' : 'text-gray-400 hover:text-white'
                                                }`}
                                                style={{
                                                    backgroundColor: link.active ? `${currentTheme.hex.primary}30` : 'transparent',
                                                    border: link.active ? `1px solid ${currentTheme.hex.primary}40` : '1px solid transparent',
                                                }}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={(e) => handlePaginationClick(struks.links[struks.links.length - 1].url, e)}
                                        disabled={!struks.links[struks.links.length - 1].url}
                                        className="px-4 py-2 rounded-lg border text-white font-medium transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                        style={{ borderColor: `${currentTheme.hex.primary}40` }}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Reimburse */}
            {reimburseModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={closeReimburseModal}
                >
                    <div
                        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                        style={{
                            borderColor: `${currentTheme.hex.primary}40`,
                            boxShadow: `0 25px 50px -12px ${currentTheme.hex.primary}30`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={closeReimburseModal}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Title */}
                        <h3 className="text-white text-xl font-bold mb-1">Upload Bukti Reimburse</h3>
                        {selectedStruk && (
                            <p className="text-gray-400 text-sm mb-5">
                                Driver: <span className="text-white font-medium">{selectedStruk.user?.username || selectedStruk.user?.name}</span>
                                &nbsp;·&nbsp; {selectedStruk.bank} – {selectedStruk.no_rekening}
                            </p>
                        )}

                        {/* Upload Area */}
                        <label className="block w-full cursor-pointer mb-5">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBuktiChange}
                                className="hidden"
                            />
                            <div
                                className="w-full border-2 border-dashed rounded-2xl p-5 text-center hover:bg-white/5 transition-all"
                                style={{ borderColor: buktiPreview ? `${currentTheme.hex.primary}80` : `${currentTheme.hex.primary}40` }}
                            >
                                {buktiPreview ? (
                                    <div className="space-y-2">
                                        <img
                                            src={buktiPreview}
                                            alt="Preview"
                                            className="max-h-44 mx-auto rounded-xl object-contain"
                                        />
                                        <p className="text-sm text-gray-400 truncate">{buktiFile?.name}</p>
                                        <p className="text-xs" style={{ color: currentTheme.hex.primary }}>Klik untuk ganti gambar</p>
                                    </div>
                                ) : (
                                    <div>
                                        <svg className="w-10 h-10 mx-auto mb-2 opacity-50" style={{ color: currentTheme.hex.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-white font-medium mb-1">Pilih foto bukti reimburse</p>
                                        <p className="text-gray-400 text-sm">JPG, PNG, GIF maks. 2MB</p>
                                    </div>
                                )}
                            </div>
                        </label>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={closeReimburseModal}
                                className="flex-1 bg-white/10 border text-white font-semibold py-3 rounded-xl hover:bg-white/15 transition-all"
                                style={{ borderColor: `${currentTheme.hex.primary}40` }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReimburseSubmit}
                                disabled={!buktiFile || isSubmitting}
                                className="flex-1 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                    boxShadow: `0 10px 25px -5px ${currentTheme.hex.primary}40`,
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Selesai
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Lihat Gambar */}
            {imageModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={closeImageModal}
                >
                    <div
                        className="relative max-w-2xl w-full animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-semibold text-lg">{imageModalTitle}</h3>
                            <button
                                onClick={closeImageModal}
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                            >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Image */}
                        <div
                            className="rounded-2xl overflow-hidden border shadow-2xl"
                            style={{
                                borderColor: `${currentTheme.hex.primary}40`,
                                boxShadow: `0 25px 50px -12px ${currentTheme.hex.primary}30`,
                            }}
                        >
                            <img
                                src={imageModalSrc}
                                alt={imageModalTitle}
                                className="w-full max-h-[70vh] object-contain bg-black/50"
                            />
                        </div>

                        {/* Open in new tab */}
                        <div className="mt-3 flex justify-center">
                            <a
                                href={imageModalSrc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Buka di tab baru
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdmin>
    );
}
