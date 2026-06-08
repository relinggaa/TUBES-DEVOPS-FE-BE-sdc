import React, { useState, useEffect, useRef } from 'react';
import LayoutAdmin from '../../layout/LayoutAdmin';
import { useTheme } from '../../contexts/ThemeContext';
import { router, usePage } from '@inertiajs/react';
import PageHeader from '../../components/admin/PageHeader';
export default function LaporanBiaya({ bills, filters = {} }) {
    const { currentTheme } = useTheme();
    const [expandedItems, setExpandedItems] = useState({});
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const searchTimeoutRef = useRef(null);

    const toggleExpand = (id) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    useEffect(() => {
        if (filters.search !== undefined) {
            setSearchQuery(filters.search);
        }
    }, [filters]);

    
    const applyFilters = (search, page = 1) => {
        const params = {};
        if (search && search.trim() !== '') {
            params.search = search.trim();
        }
        params.page = page;

        router.get('/admin/laporan-biaya', params, {
            preserveState: true,
            preserveScroll: true,
            only: ['bills', 'filters'],
            replace: true
        });
    };


    const handleSearchChange = (value) => {
        setSearchQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            applyFilters(value, 1);
        }, 500);
    };


    const handlePaginationClick = (url, e) => {
        if (!url) return;

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            only: ['bills', 'filters'],
            replace: true
        });
    };

    return (
        <LayoutAdmin>
            <div className="space-y-6">
             
                <PageHeader
                    currentTheme={currentTheme}
                    title="Laporan Biaya"
                    subtitle="Lihat dan kelola laporan biaya operasional"
                    />

               
                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari laporan (merek, plat nomor, driver, mekanik, total biaya)..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
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
                                    applyFilters('', 1);
                                }}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Results */}
                {!bills || (bills.data && bills.data.length === 0) ? (
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
                            {searchQuery ? 'Tidak ada laporan yang sesuai dengan pencarian' : 'Belum ada laporan biaya'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4">
                            {(bills.data || bills).map((bill, index) => {
                            const buktiBillUrl = bill.bukti_bill 
                                ? `/storage/${bill.bukti_bill}` 
                                : null;

                            return (
                                <div
                                    key={bill.id}
                                    className="backdrop-blur-sm rounded-xl p-6 border shadow-xl transition-all duration-300 hover:scale-[1.01]"
                                    style={{
                                        background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}10, ${currentTheme.hex.secondary}10)`,
                                        borderColor: `${currentTheme.hex.primary}30`,
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-white font-bold text-xl">
                                                {bill.keruskaan_acc?.kendaraan?.merek || 'N/A'}
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                {bill.keruskaan_acc?.kendaraan?.plat_nomor || 'N/A'}
                                            </p>

                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <svg className="w-4 h-4" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="text-sm">Driver: {bill.keruskaan_acc?.kendaraan?.driver?.username || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <svg className="w-4 h-4" style={{ color: currentTheme.hex.secondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-sm">Mekanik: <span className="font-semibold text-white">{bill.keruskaan_acc?.mekanik?.username || 'N/A'}</span></span>
                                                </div>
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
                                                {formatCurrency(bill.total_biaya)}
                                            </span>

                                            <button
                                                onClick={() => toggleExpand(bill.id)}
                                                className="text-sm font-medium hover:underline flex items-center gap-1 transition-colors"
                                                style={{ color: currentTheme.hex.primary }}
                                            >
                                                {expandedItems[bill.id] ? 'Sembunyikan' : 'Lihat Detail'}
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${expandedItems[bill.id] ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {expandedItems[bill.id] && (
                                        <div className="mt-6 pt-6 border-t animate-in fade-in slide-in-from-top-2 duration-300" style={{ borderColor: `${currentTheme.hex.primary}20` }}>
                                            <div className="space-y-4 mb-6">
                                                {/* Detail Biaya */}
                                                {bill.detail_biaya && Array.isArray(bill.detail_biaya) && bill.detail_biaya.length > 0 && (
                                                    <div
                                                        className="rounded-lg p-4 border"
                                                        style={{
                                                            backgroundColor: `${currentTheme.hex.primary}05`,
                                                            borderColor: `${currentTheme.hex.primary}20`,
                                                        }}
                                                    >
                                                        <p className="text-sm font-semibold mb-3" style={{ color: currentTheme.hex.primary }}>
                                                            Detail Biaya ({bill.detail_biaya.length}):
                                                        </p>
                                                        <div className="space-y-3">
                                                            {bill.detail_biaya.map((detail, idx) => (
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
                                                                        <p className="text-white text-sm font-semibold mb-1">{detail.text}</p>
                                                                        <p className="text-gray-400 text-xs mb-1">Sparepart: {detail.sparepart || 'N/A'}</p>
                                                                        <p className="text-white/80 text-sm font-medium">
                                                                            {formatCurrency(detail.nominal)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Bukti Bill */}
                                                {buktiBillUrl && (
                                                    <div
                                                        className="rounded-lg p-4 border"
                                                        style={{
                                                            backgroundColor: `${currentTheme.hex.primary}05`,
                                                            borderColor: `${currentTheme.hex.primary}20`,
                                                        }}
                                                    >
                                                        <p className="text-sm font-semibold mb-3" style={{ color: currentTheme.hex.primary }}>
                                                            Bukti Bill:
                                                        </p>
                                                        <div className="rounded-lg overflow-hidden">
                                                            <img
                                                                src={buktiBillUrl}
                                                                alt="Bukti Bill"
                                                                className="w-full h-auto max-h-96 object-contain"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tanggal */}
                                                <div className="flex justify-end pt-2">
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(bill.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                        </div>
                                        );
                                        })}
                                    </div>

                        {/* Pagination Controls */}
                        {bills.links && bills.links.length > 3 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                                <div className="text-sm text-gray-400">
                                    Menampilkan {bills.from || 0}-{bills.to || 0} dari {bills.total || 0} laporan
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Previous Button */}
                                    {bills.links[0].url && (
                                        <button
                                            onClick={(e) => handlePaginationClick(bills.links[0].url, e)}
                                            className="px-4 py-2 rounded-lg border text-white font-medium transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                borderColor: `${currentTheme.hex.primary}40`,
                                            }}
                                            disabled={!bills.links[0].url}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {bills.links.slice(1, -1).map((link, index) => {
                                            const page = link.label;
                                            const isActive = link.active;
                                            
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={(e) => handlePaginationClick(link.url, e)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                        isActive
                                                            ? 'text-white'
                                                            : 'text-gray-400 hover:text-white'
                                                    }`}
                                                    style={{
                                                        backgroundColor: isActive ? `${currentTheme.hex.primary}30` : 'transparent',
                                                        border: isActive ? `1px solid ${currentTheme.hex.primary}40` : '1px solid transparent',
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: page }}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Next Button */}
                                    {bills.links[bills.links.length - 1].url && (
                                        <button
                                            onClick={(e) => handlePaginationClick(bills.links[bills.links.length - 1].url, e)}
                                            className="px-4 py-2 rounded-lg border text-white font-medium transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                borderColor: `${currentTheme.hex.primary}40`,
                                            }}
                                            disabled={!bills.links[bills.links.length - 1].url}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </LayoutAdmin>
    );
}