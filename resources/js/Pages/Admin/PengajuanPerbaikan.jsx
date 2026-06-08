import React, { useState, useEffect } from 'react';
import LayoutAdmin from '../../layout/LayoutAdmin';
import { useTheme } from '../../contexts/ThemeContext';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';

export default function PengajuanPerbaikan({ kerusakans = [], mekaniks = [], perbaikans = [] }) {
    const { currentTheme } = useTheme();
    const { flash } = usePage().props;

    const [showModal, setShowModal] = useState(false);
    const [selectedKerusakan, setSelectedKerusakan] = useState(null);
    const [selectedMekanik, setSelectedMekanik] = useState('');
    const [expandedItems, setExpandedItems] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;


    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                    color: '#ffffff'
                }
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    }, [flash?.success, flash?.error]);

    const toggleExpand = (id) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleOpenModal = (kerusakan) => {
        setSelectedKerusakan(kerusakan);
        setSelectedMekanik('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedKerusakan(null);
        setSelectedMekanik('');
    };

    const handleApprove = () => {
        if (!selectedMekanik) {
            toast.error('Pilih mekanik terlebih dahulu!', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        router.post('/admin/kerusakan/approve', {
            kerusakan_id: selectedKerusakan.id,
            mekanik_id: selectedMekanik,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                handleCloseModal();
            },
            onError: (errors) => {
                console.error('Error:', errors);
            }
        });
    };

    return (
        <LayoutAdmin>
            <div className="space-y-12">

                <div className="space-y-6">

                    <PageHeader
                        currentTheme={currentTheme}
                        title="Pengajuan Perbaikan"
                        subtitle="Kelola semua pengajuan perbaikan yang masuk"
                    />
                    {kerusakans.length === 0 ? (
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
                            <p className="text-gray-400 text-lg">Belum ada pengajuan perbaikan</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {kerusakans.map((kerusakan, index) => (
                                <div
                                    key={kerusakan.id}
                                    className="backdrop-blur-sm rounded-xl p-6 border shadow-xl transition-all duration-300 hover:scale-[1.01]"
                                    style={{
                                        background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}10, ${currentTheme.hex.secondary}10)`,
                                        borderColor: `${currentTheme.hex.primary}30`,
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-white font-bold text-xl">{kerusakan.kendaraan?.merek || 'N/A'}</h3>
                                            <p className="text-gray-400 text-sm">{kerusakan.kendaraan?.plat_nomor || 'N/A'}</p>

                                            <div className="flex items-center gap-2 text-gray-300 pt-1">
                                                <svg className="w-4 h-4" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="text-sm">Driver: {kerusakan.kendaraan?.driver?.username || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            <span
                                                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                                                style={{
                                                    backgroundColor: `${currentTheme.hex.secondary}20`,
                                                    color: currentTheme.hex.secondary,
                                                }}
                                            >
                                                Pengajuan Perbaikan
                                            </span>

                                            <button
                                                onClick={() => toggleExpand(kerusakan.id)}
                                                className="text-sm font-medium hover:underline flex items-center gap-1 transition-colors"
                                                style={{ color: currentTheme.hex.primary }}
                                            >
                                                {expandedItems[kerusakan.id] ? 'Sembunyikan' : 'Lihat Detail'}
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${expandedItems[kerusakan.id] ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {expandedItems[kerusakan.id] && (
                                        <div className="mt-6 pt-6 border-t animate-in fade-in slide-in-from-top-2 duration-300" style={{ borderColor: `${currentTheme.hex.primary}20` }}>
                                            <div className="space-y-4 mb-6">
                                                {kerusakan.catatan && (
                                                    <div
                                                        className="rounded-lg p-4 border"
                                                        style={{
                                                            backgroundColor: `${currentTheme.hex.primary}05`,
                                                            borderColor: `${currentTheme.hex.primary}20`,
                                                        }}
                                                    >
                                                        <p className="text-sm font-semibold mb-2" style={{ color: currentTheme.hex.primary }}>Catatan:</p>
                                                        <p className="text-gray-300 text-sm leading-relaxed">{kerusakan.catatan}</p>
                                                    </div>
                                                )}

                                                {kerusakan.kendala && kerusakan.kendala.length > 0 && (
                                                    <div
                                                        className="rounded-lg p-4 border"
                                                        style={{
                                                            backgroundColor: `${currentTheme.hex.primary}05`,
                                                            borderColor: `${currentTheme.hex.primary}20`,
                                                        }}
                                                    >
                                                        <p className="text-sm font-semibold mb-3" style={{ color: currentTheme.hex.primary }}>
                                                            Daftar Kendala ({kerusakan.kendala.length}):
                                                        </p>
                                                        <div className="space-y-3">
                                                            {kerusakan.kendala.map((item, idx) => (
                                                                <div key={idx} className="flex gap-3 bg-black/20 rounded-lg p-3">
                                                                    <span
                                                                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                                                                        style={{
                                                                            backgroundColor: `${currentTheme.hex.secondary}30`,
                                                                            color: currentTheme.hex.secondary,
                                                                        }}
                                                                    >
                                                                        {idx + 1}
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <p className="text-white text-sm font-semibold mb-1">{item.name}</p>
                                                                        <p className="text-gray-400 text-xs">{item.description}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleOpenModal(kerusakan)}
                                                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                                                style={{
                                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                                    boxShadow: `0 10px 25px -5px ${currentTheme.hex.primary}40`
                                                }}
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Atur Mekanik
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Sedang Diperbaiki</h2>
                            <p className="text-gray-400">Daftar kendaraan yang sedang dalam proses perbaikan</p>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari kendaraan (merek, plat nomor, driver, mekanik)..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            className="w-full rounded-xl border bg-white/10 backdrop-blur-sm py-3 px-4 pl-12 text-white placeholder-gray-400 outline-none focus:ring-2 transition-all"
                            style={{
                                borderColor: `${currentTheme.hex.primary}40`,
                                '--tw-ring-color': currentTheme.hex.primary,
                            }}
                        />
                        <svg 
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setCurrentPage(1);
                                }}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filtered and Paginated Results */}
                    {(() => {
                        // Filter perbaikans based on search query
                        const filteredPerbaikans = perbaikans.filter((perbaikan) => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase();
                            return (
                                perbaikan.kendaraan?.merek?.toLowerCase().includes(query) ||
                                perbaikan.kendaraan?.plat_nomor?.toLowerCase().includes(query) ||
                                perbaikan.kendaraan?.driver?.username?.toLowerCase().includes(query) ||
                                perbaikan.mekanik?.username?.toLowerCase().includes(query)
                            );
                        });

                        // Calculate pagination
                        const totalPages = Math.ceil(filteredPerbaikans.length / itemsPerPage);
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedPerbaikans = filteredPerbaikans.slice(startIndex, endIndex);

                        return (
                            <>
                                {filteredPerbaikans.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                                        <p>{searchQuery ? 'Tidak ada kendaraan yang sesuai dengan pencarian' : 'Tidak ada kendaraan yang sedang diperbaiki'}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-4">
                                            {paginatedPerbaikans.map((perbaikan, index) => (
                                                <div
                                                    key={perbaikan.id}
                                    className="backdrop-blur-sm rounded-xl p-6 border shadow-xl transition-all duration-300 hover:scale-[1.01]"
                                    style={{
                                        background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}05, ${currentTheme.hex.secondary}05)`,
                                        borderColor: `${currentTheme.hex.primary}20`,
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-white font-bold text-xl">{perbaikan.kendaraan?.merek || 'N/A'}</h3>
                                            <p className="text-gray-400 text-sm">{perbaikan.kendaraan?.plat_nomor || 'N/A'}</p>

                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <svg className="w-4 h-4" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="text-sm">Driver: {perbaikan.kendaraan?.driver?.username || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <svg className="w-4 h-4" style={{ color: currentTheme.hex.secondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-sm">Mekanik: <span className="font-semibold text-white">{perbaikan.mekanik?.username || 'N/A'}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            <span
                                                className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                                                    perbaikan.kendaraan?.status === 'Perbaikan' 
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : perbaikan.kendaraan?.status === 'Pending'
                                                        ? 'bg-orange-500/20 text-orange-400'
                                                        : perbaikan.kendaraan?.status === 'Normal'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : perbaikan.kendaraan?.status === 'Pengajuan Perbaikan'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}
                                            >
                                                {perbaikan.kendaraan?.status || 'N/A'}
                                            </span>

                                            <button
                                                onClick={() => toggleExpand(`perbaikan-${perbaikan.id}`)}
                                                className="text-sm font-medium hover:underline flex items-center gap-1 transition-colors"
                                                style={{ color: currentTheme.hex.primary }}
                                            >
                                                {expandedItems[`perbaikan-${perbaikan.id}`] ? 'Sembunyikan' : 'Lihat Detail'}
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${expandedItems[`perbaikan-${perbaikan.id}`] ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {expandedItems[`perbaikan-${perbaikan.id}`] && (
                                        <div className="mt-6 pt-6 border-t animate-in fade-in slide-in-from-top-2 duration-300" style={{ borderColor: `${currentTheme.hex.primary}20` }}>
                                            <div className="space-y-4">
                                                {perbaikan.kerusakan?.catatan && (
                                                    <div className="rounded-lg p-4 border border-white/10 bg-white/5">
                                                        <p className="text-sm font-semibold mb-2 text-gray-400">Catatan Awal:</p>
                                                        <p className="text-gray-300 text-sm leading-relaxed">{perbaikan.kerusakan.catatan}</p>
                                                    </div>
                                                )}

                                                {perbaikan.kerusakan?.kendala && perbaikan.kerusakan.kendala.length > 0 && (
                                                    <div className="rounded-lg p-4 border border-white/10 bg-white/5">
                                                        <p className="text-sm font-semibold mb-3 text-gray-400">
                                                            Daftar Kendala ({perbaikan.kerusakan.kendala.length}):
                                                        </p>
                                                        <div className="space-y-3">
                                                            {perbaikan.kerusakan.kendala.map((item, idx) => (
                                                                <div key={idx} className="flex gap-3 bg-black/20 rounded-lg p-3">
                                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 bg-white/10 text-white">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <p className="text-white text-sm font-semibold mb-1">{item.name}</p>
                                                                        <p className="text-gray-400 text-xs">{item.description}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                            ))}

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                                                    <div className="text-sm text-gray-400">
                                                        Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredPerbaikans.length)} dari {filteredPerbaikans.length} kendaraan
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                            disabled={currentPage === 1}
                                                            className="px-4 py-2 rounded-lg border text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                                                            style={{
                                                                borderColor: `${currentTheme.hex.primary}40`,
                                                            }}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                        </button>
                                                        
                                                        <div className="flex items-center gap-1">
                                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                                        currentPage === page
                                                                            ? 'text-white'
                                                                            : 'text-gray-400 hover:text-white'
                                                                    }`}
                                                                    style={{
                                                                        backgroundColor: currentPage === page ? `${currentTheme.hex.primary}30` : 'transparent',
                                                                        border: currentPage === page ? `1px solid ${currentTheme.hex.primary}40` : '1px solid transparent',
                                                                    }}
                                                                >
                                                                    {page}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                            disabled={currentPage === totalPages}
                                                            className="px-4 py-2 rounded-lg border text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                                                            style={{
                                                                borderColor: `${currentTheme.hex.primary}40`,
                                                            }}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                        )}
                                        </div>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Modal Assign Mekanik */}
            {showModal && selectedKerusakan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div
                        className="relative rounded-3xl p-8 max-w-md w-full border shadow-2xl"
                        style={{
                            background: `linear-gradient(to bottom right, #1E1730, ${currentTheme.hex.primary}20)`,
                            borderColor: `${currentTheme.hex.primary}40`,
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-white text-2xl font-bold mb-6">Atur Mekanik</h3>

                        <div className="mb-6">
                            <p className="text-gray-300 mb-2">Kendaraan: <span className="font-semibold text-white">{selectedKerusakan.kendaraan?.merek} - {selectedKerusakan.kendaraan?.plat_nomor}</span></p>
                            <p className="text-gray-300">Driver: <span className="font-semibold text-white">{selectedKerusakan.kendaraan?.driver?.username}</span></p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.hex.primary }}>
                                Pilih Mekanik
                            </label>
                            <select
                                value={selectedMekanik}
                                onChange={(e) => setSelectedMekanik(e.target.value)}
                                className="w-full rounded-xl border bg-white/10 backdrop-blur-sm py-3 px-4 text-white outline-none focus:ring-2 transition-all"
                                style={{
                                    borderColor: `${currentTheme.hex.primary}40`,
                                    '--tw-ring-color': currentTheme.hex.primary,
                                }}
                            >
                                <option value="" className="bg-gray-800">Pilih mekanik...</option>
                                {mekaniks.map((mekanik) => (
                                    <option key={mekanik.id} value={mekanik.id} className="bg-gray-800">
                                        {mekanik.username || mekanik.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 bg-white/10 backdrop-blur-md border text-white font-semibold py-3 rounded-full hover:bg-white/15 transition-all"
                                style={{ borderColor: `${currentTheme.hex.primary}40` }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={!selectedMekanik}
                                className="flex-1 text-white font-bold py-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                    boxShadow: `0 10px 25px -5px ${currentTheme.hex.primary}40`
                                }}
                            >
                                Setujui
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdmin>
    );
}