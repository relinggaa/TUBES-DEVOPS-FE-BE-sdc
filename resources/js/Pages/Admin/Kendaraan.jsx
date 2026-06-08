import React, { useState, useEffect, useRef } from 'react';
import LayoutAdmin from '../../layout/LayoutAdmin';
import { useTheme } from '../../contexts/ThemeContext';
import { usePage, router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/admin/PageHeader';
import DeleteModal from '../../components/admin/DeleteModal';

export default function Kendaraan({ kendaraans = { data: [], links: [], current_page: 1, last_page: 1, total: 0 }, drivers = [], filters = { search: '' } }) {
    const { currentTheme } = useTheme();
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingKendaraan, setEditingKendaraan] = useState(null);
    const [deletingKendaraanId, setDeletingKendaraanId] = useState(null);
    const [formData, setFormData] = useState({
        merek: '',
        plat_nomor: '',
        driver_id: '',
        gambar: null
    });
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const searchTimeoutRef = useRef(null);


    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: `1px solid ${currentTheme.hex.primary}40`,
                    borderRadius: '12px',
                    boxShadow: `0 4px 12px ${currentTheme.hex.primary}30`
                },
                progressStyle: {
                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`
                }
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: '1px solid #ef444440',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px #ef444430'
                },
                progressStyle: {
                    background: 'linear-gradient(to right, #ef4444, #dc2626)'
                }
            });
        }
    }, [flash?.success, flash?.error, currentTheme]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, gambar: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const formDataToSend = new FormData();
        formDataToSend.append('merek', formData.merek);
        formDataToSend.append('plat_nomor', formData.plat_nomor);
        if (formData.driver_id) {
            formDataToSend.append('driver_id', formData.driver_id);
        }
        if (formData.gambar) {
            formDataToSend.append('gambar', formData.gambar);
        }

        router.post('/admin/kendaraan', formDataToSend, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setIsModalOpen(false);
                setFormData({ merek: '', plat_nomor: '', driver_id: '', gambar: null });
                setPreviewImage(null);
            },
            onError: (errors) => {
                setErrors(errors);

                if (errors.plat_nomor) {
                    toast.error(errors.plat_nomor, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        style: {
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            border: '1px solid #ef444440',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px #ef444430'
                        },
                        progressStyle: {
                            background: 'linear-gradient(to right, #ef4444, #dc2626)'
                        }
                    });
                }

                if (errors.driver_id) {
                    toast.error(errors.driver_id, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        style: {
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            border: '1px solid #ef444440',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px #ef444430'
                        },
                        progressStyle: {
                            background: 'linear-gradient(to right, #ef4444, #dc2626)'
                        }
                    });
                }
            }
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        if (!editingKendaraan) return;

        const formDataToSend = new FormData();
        formDataToSend.append('_method', 'PUT');
        formDataToSend.append('merek', formData.merek);
        formDataToSend.append('plat_nomor', formData.plat_nomor);
        if (formData.driver_id) {
            formDataToSend.append('driver_id', formData.driver_id);
        } else {
            formDataToSend.append('driver_id', '');
        }
        if (formData.gambar) {
            formDataToSend.append('gambar', formData.gambar);
        }

        router.post(`/admin/kendaraan/${editingKendaraan.id}`, formDataToSend, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setIsUpdateModalOpen(false);
                setEditingKendaraan(null);
                setFormData({ merek: '', plat_nomor: '', driver_id: '', gambar: null });
                setPreviewImage(null);
            },
            onError: (errors) => {
                setErrors(errors);
                
                if (errors.plat_nomor) {
                    toast.error(errors.plat_nomor, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        style: {
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            border: '1px solid #ef444440',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px #ef444430'
                        },
                        progressStyle: {
                            background: 'linear-gradient(to right, #ef4444, #dc2626)'
                        }
                    });
                }

                if (errors.driver_id) {
                    toast.error(errors.driver_id, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        style: {
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            border: '1px solid #ef444440',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px #ef444430'
                        },
                        progressStyle: {
                            background: 'linear-gradient(to right, #ef4444, #dc2626)'
                        }
                    });
                }
            }
        });
    };

    const handleOpenUpdateModal = (kendaraan) => {
        setEditingKendaraan(kendaraan);
        setFormData({
            merek: kendaraan.merek || '',
            plat_nomor: kendaraan.plat_nomor || '',
            driver_id: kendaraan.driver_id || '',
            gambar: null
        });
        if (kendaraan.gambar) {
            setPreviewImage(`/storage/${kendaraan.gambar}`);
        } else {
            setPreviewImage(null);
        }
        setIsUpdateModalOpen(true);
        setErrors({});
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ merek: '', plat_nomor: '', driver_id: '', gambar: null });
        setPreviewImage(null);
        setErrors({});
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setEditingKendaraan(null);
        setFormData({ merek: '', plat_nomor: '', driver_id: '', gambar: null });
        setPreviewImage(null);
        setErrors({});
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

        router.get('/admin/kendaraan', params, {
            preserveState: true,
            preserveScroll: true,
            only: ['kendaraans', 'filters'],
            replace: true
        });
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            applyFilters(value);
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
            only: ['kendaraans', 'filters'],
            replace: true
        });
    };

    const handleDelete = (id) => {
        setDeletingKendaraanId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingKendaraanId) {
            router.delete(`/admin/kendaraan/${deletingKendaraanId}`, {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setDeletingKendaraanId(null);
                }
            });
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setDeletingKendaraanId(null);
    };

    return (
        <LayoutAdmin>
            <div className="space-y-8">
                {/* Header Card */}
                <PageHeader
                    currentTheme={currentTheme}
                    title="Kendaraan"
                    subtitle="Kelola semua kendaraan yang ada di sistem"
                    buttonText="Tambah Kendaraan"
                    onButtonClick={() => setIsModalOpen(true)}
                    badgeText="Active"
                    showBadge={true}
                />

                {/* Search Bar */}
                <div 
                    className="relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/60 backdrop-blur-2xl rounded-2xl border shadow-xl p-6 transition-all duration-500"
                    style={{
                        borderColor: `${currentTheme.hex.primary}20`
                    }}
                >
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Cari kendaraan (merek, plat nomor, atau driver)..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                                style={{
                                    borderColor: `${currentTheme.hex.primary}40`,
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                    e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = `${currentTheme.hex.primary}40`;
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    applyFilters('');
                                }}
                                className="px-4 py-3 rounded-xl font-medium transition-all duration-300 border"
                                style={{
                                    color: currentTheme.hex.secondary,
                                    borderColor: `${currentTheme.hex.primary}40`,
                                    backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}20`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Kendaraan Cards Grid */}
                {(!kendaraans.data || kendaraans.data.length === 0) ? (
                    <div 
                        className="relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/60 backdrop-blur-2xl rounded-3xl border shadow-2xl p-12 text-center transition-all duration-500"
                        style={{
                            borderColor: `${currentTheme.hex.primary}20`
                        }}
                    >
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center"
                                style={{
                                    backgroundColor: `${currentTheme.hex.primary}20`
                                }}
                            >
                                <svg className="w-10 h-10" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <p className="text-gray-400 text-lg">Belum ada kendaraan</p>
                            <p className="text-gray-500 text-sm">Klik tombol "Tambah Kendaraan" untuk menambahkan kendaraan pertama</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {kendaraans.data.map((kendaraan) => (
                                <div
                                    key={kendaraan.id}
                                    className="group relative"
                                >
                                    <div
                                        className="absolute -inset-0.5 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10"
                                        style={{
                                            background: `linear-gradient(to right, ${currentTheme.hex.primary}40, ${currentTheme.hex.secondary}40)`
                                        }}
                                    ></div>

                                    <div 
                                        className="relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/60 backdrop-blur-2xl rounded-2xl border shadow-xl transition-all duration-500 overflow-hidden"
                                        style={{
                                            borderColor: `${currentTheme.hex.primary}20`,
                                            boxShadow: `0 10px 25px -5px ${currentTheme.hex.primary}10`
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = `${currentTheme.hex.primary}40`;
                                            e.currentTarget.style.boxShadow = `0 10px 25px -5px ${currentTheme.hex.primary}20`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = `${currentTheme.hex.primary}20`;
                                            e.currentTarget.style.boxShadow = `0 10px 25px -5px ${currentTheme.hex.primary}10`;
                                        }}
                                    >
                                        {/* Image Section */}
                                        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                                            {kendaraan.gambar ? (
                                                <img
                                                    src={`/storage/${kendaraan.gambar}`}
                                                    alt={kendaraan.merek}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-20 h-20 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"
                                            ></div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="text-xl font-bold text-white">{kendaraan.merek}</h3>
                                                        {/* Status Badge */}
                                                        <span
                                                            className="px-3 py-1 rounded-full text-xs font-semibold"
                                                            style={{
                                                                backgroundColor: 
                                                                    kendaraan.status === 'Normal' 
                                                                        ? `${currentTheme.hex.primary}20`
                                                                        : kendaraan.status === 'Pengajuan Perbaikan'
                                                                        ? '#f59e0b20'
                                                                        : kendaraan.status === 'Pending'
                                                                        ? '#6366f120'
                                                                        : '#ef444420',
                                                                color: 
                                                                    kendaraan.status === 'Normal'
                                                                        ? currentTheme.hex.primary
                                                                        : kendaraan.status === 'Pengajuan Perbaikan'
                                                                        ? '#f59e0b'
                                                                        : kendaraan.status === 'Pending'
                                                                        ? '#6366f1'
                                                                        : '#ef4444',
                                                                border: `1px solid ${
                                                                    kendaraan.status === 'Normal'
                                                                        ? `${currentTheme.hex.primary}40`
                                                                        : kendaraan.status === 'Pengajuan Perbaikan'
                                                                        ? '#f59e0b40'
                                                                        : kendaraan.status === 'Pending'
                                                                        ? '#6366f140'
                                                                        : '#ef444440'
                                                                }`
                                                            }}
                                                        >
                                                            {kendaraan.status || 'Normal'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">Plat: {kendaraan.plat_nomor}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleOpenUpdateModal(kendaraan)}
                                                        className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                                                        style={{
                                                            backgroundColor: `${currentTheme.hex.primary}20`,
                                                            color: currentTheme.hex.primary
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}30`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}20`;
                                                        }}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(kendaraan.id)}
                                                        className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                                                        style={{
                                                            backgroundColor: `#ef444420`,
                                                            color: '#ef4444'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = `#ef444430`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = `#ef444420`;
                                                        }}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {kendaraan.driver && (
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                        style={{
                                                            background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`
                                                        }}
                                                    >
                                                        {kendaraan.driver.username?.charAt(0).toUpperCase() || 'D'}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{kendaraan.driver.username}</p>
                                                        <p className="text-gray-400 text-xs">Driver</p>
                                                    </div>
                                                </div>
                                            )}

                                            {!kendaraan.driver && (
                                                <div className="mb-4">
                                                    <span className="text-gray-500 text-sm">Belum ada driver</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {kendaraans.last_page > 1 && (
                            <div 
                                className="mt-8 flex items-center justify-center space-x-2 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/60 backdrop-blur-2xl rounded-2xl border shadow-xl p-6 transition-all duration-500"
                                style={{
                                    borderColor: `${currentTheme.hex.primary}20`
                                }}
                            >
                                {/* Previous Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (kendaraans.links && kendaraans.links[0]?.url) {
                                            handlePaginationClick(kendaraans.links[0].url, e);
                                        }
                                    }}
                                    disabled={!kendaraans.links || !kendaraans.links[0]?.url}
                                    className="px-4 py-2 rounded-lg font-medium transition-all duration-300 border disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        color: (!kendaraans.links || !kendaraans.links[0]?.url) ? '#6b7280' : currentTheme.hex.secondary,
                                        borderColor: `${currentTheme.hex.primary}40`,
                                        backgroundColor: 'transparent',
                                        pointerEvents: (!kendaraans.links || !kendaraans.links[0]?.url) ? 'none' : 'auto',
                                        cursor: (!kendaraans.links || !kendaraans.links[0]?.url) ? 'not-allowed' : 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (kendaraans.links && kendaraans.links[0]?.url) {
                                            e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}20`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (kendaraans.links && kendaraans.links[0]?.url) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center space-x-2">
                                    {kendaraans.links && kendaraans.links.slice(1, -1).map((link, index) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 text-gray-500"
                                                >
                                                    {link.label.replace('&laquo;', '').replace('&raquo;', '').trim()}
                                                </span>
                                            );
                                        }
                                        const isActive = link.active;
                                        return (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handlePaginationClick(link.url, e);
                                                }}
                                                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 border"
                                                style={{
                                                    color: isActive ? '#ffffff' : currentTheme.hex.secondary,
                                                    borderColor: isActive ? currentTheme.hex.primary : `${currentTheme.hex.primary}40`,
                                                    backgroundColor: isActive ? `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})` : 'transparent',
                                                    background: isActive ? `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})` : 'transparent',
                                                    boxShadow: isActive ? `0 4px 12px ${currentTheme.hex.primary}30` : 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}20`;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                {link.label.replace('&laquo;', '').replace('&raquo;', '').trim()}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const lastLink = kendaraans.links && kendaraans.links[kendaraans.links.length - 1];
                                        if (lastLink?.url) {
                                            handlePaginationClick(lastLink.url, e);
                                        }
                                    }}
                                    disabled={!kendaraans.links || !kendaraans.links[kendaraans.links.length - 1]?.url}
                                    className="px-4 py-2 rounded-lg font-medium transition-all duration-300 border disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        color: (!kendaraans.links || !kendaraans.links[kendaraans.links.length - 1]?.url) ? '#6b7280' : currentTheme.hex.secondary,
                                        borderColor: `${currentTheme.hex.primary}40`,
                                        backgroundColor: 'transparent',
                                        pointerEvents: (!kendaraans.links || !kendaraans.links[kendaraans.links.length - 1]?.url) ? 'none' : 'auto',
                                        cursor: (!kendaraans.links || !kendaraans.links[kendaraans.links.length - 1]?.url) ? 'not-allowed' : 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (kendaraans.links && kendaraans.links[kendaraans.links.length - 1]?.url) {
                                            e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}20`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (kendaraans.links && kendaraans.links[kendaraans.links.length - 1]?.url) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Modal Form Tambah Kendaraan */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}>
                        <div
                            className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 backdrop-blur-2xl rounded-3xl border shadow-2xl overflow-hidden"
                            style={{
                                borderColor: `${currentTheme.hex.primary}40`,
                                boxShadow: `0 25px 50px -12px ${currentTheme.hex.primary}30`
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b" style={{ borderColor: `${currentTheme.hex.primary}20` }}>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">Tambah Kendaraan</h2>
                                    <button
                                        onClick={handleCloseModal}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Merek */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Merek</label>
                                    <input
                                        type="text"
                                        value={formData.merek}
                                        onChange={(e) => setFormData({ ...formData, merek: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                                        style={{
                                            borderColor: errors.merek ? '#ef4444' : `${currentTheme.hex.primary}40`,
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = errors.merek ? '#ef4444' : `${currentTheme.hex.primary}40`;
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        placeholder="Contoh: Toyota Avanza"
                                    />
                                    {errors.merek && (
                                        <p className="mt-1 text-sm text-red-400">{errors.merek}</p>
                                    )}
                                </div>

                                {/* Plat Nomor */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Plat Nomor</label>
                                    <input
                                        type="text"
                                        value={formData.plat_nomor}
                                        onChange={(e) => setFormData({ ...formData, plat_nomor: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                                        style={{
                                            borderColor: errors.plat_nomor ? '#ef4444' : `${currentTheme.hex.primary}40`,
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = errors.plat_nomor ? '#ef4444' : `${currentTheme.hex.primary}40`;
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        placeholder="Contoh: B 1234 XYZ"
                                    />
                                    {errors.plat_nomor && (
                                        <p className="mt-1 text-sm text-red-400">{errors.plat_nomor}</p>
                                    )}
                                </div>

                                {/* Driver Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Driver</label>
                                    <select
                                        value={formData.driver_id}
                                        onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none transition-all duration-300"
                                        style={{
                                            borderColor: errors.driver_id ? '#ef4444' : `${currentTheme.hex.primary}40`,
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = errors.driver_id ? '#ef4444' : `${currentTheme.hex.primary}40`;
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="">Pilih Driver (Opsional)</option>
                                        {drivers.map((driver) => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.username}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.driver_id && (
                                        <p className="mt-1 text-sm text-red-400">{errors.driver_id}</p>
                                    )}
                                </div>

                                {/* Gambar */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Gambar</label>
                                    <div className="space-y-4">
                                        {previewImage && (
                                            <div className="relative w-full h-48 rounded-xl overflow-hidden border" style={{ borderColor: `${currentTheme.hex.primary}40` }}>
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-solid"
                                            style={{
                                                borderColor: previewImage ? `${currentTheme.hex.primary}40` : `${currentTheme.hex.primary}60`,
                                                backgroundColor: `${currentTheme.hex.primary}05`
                                            }}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-10 h-10 mb-3" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="mb-2 text-sm text-gray-400">
                                                    <span className="font-semibold" style={{ color: currentTheme.hex.primary }}>Klik untuk upload</span> atau drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 2MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>
                                    {errors.gambar && (
                                        <p className="mt-1 text-sm text-red-400">{errors.gambar}</p>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 border"
                                        style={{
                                            color: currentTheme.hex.secondary,
                                            borderColor: `${currentTheme.hex.primary}40`,
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg"
                                        style={{
                                            background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                            boxShadow: `0 10px 25px -5px ${currentTheme.hex.primary}40`
                                        }}
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Form Update Kendaraan */}
                {isUpdateModalOpen && editingKendaraan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleCloseUpdateModal}>
                        <div
                            className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 backdrop-blur-2xl rounded-3xl border shadow-2xl overflow-hidden"
                            style={{
                                borderColor: `${currentTheme.hex.primary}40`,
                                boxShadow: `0 25px 50px -12px ${currentTheme.hex.primary}30`
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b" style={{ borderColor: `${currentTheme.hex.primary}20` }}>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">Update Kendaraan</h2>
                                    <button
                                        onClick={handleCloseUpdateModal}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-6">
                                {/* Merek */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Merek</label>
                                    <input
                                        type="text"
                                        value={formData.merek}
                                        onChange={(e) => setFormData({ ...formData, merek: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                                        style={{
                                            borderColor: errors.merek ? '#ef4444' : `${currentTheme.hex.primary}40`,
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = errors.merek ? '#ef4444' : `${currentTheme.hex.primary}40`;
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        placeholder="Contoh: Toyota Avanza"
                                    />
                                    {errors.merek && (
                                        <p className="mt-1 text-sm text-red-400">{errors.merek}</p>
                                    )}
                                </div>

                                {/* Plat Nomor */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Plat Nomor</label>
                                    <input
                                        type="text"
                                        value={formData.plat_nomor}
                                        onChange={(e) => setFormData({ ...formData, plat_nomor: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                                        style={{
                                            borderColor: errors.plat_nomor ? '#ef4444' : `${currentTheme.hex.primary}40`,
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = errors.plat_nomor ? '#ef4444' : `${currentTheme.hex.primary}40`;
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        placeholder="Contoh: B 1234 XYZ"
                                    />
                                    {errors.plat_nomor && (
                                        <p className="mt-1 text-sm text-red-400">{errors.plat_nomor}</p>
                                    )}
                                </div>

                                {/* Driver Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Driver</label>
                                    <select
                                        value={formData.driver_id}
                                        onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none transition-all duration-300"
                                        style={{
                                            borderColor: errors.driver_id ? '#ef4444' : `${currentTheme.hex.primary}40`,
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = errors.driver_id ? '#ef4444' : `${currentTheme.hex.primary}40`;
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="">Pilih Driver (Opsional)</option>
                                        {drivers.map((driver) => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.username}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.driver_id && (
                                        <p className="mt-1 text-sm text-red-400">{errors.driver_id}</p>
                                    )}
                                </div>

                                {/* Gambar */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Gambar</label>
                                    <div className="space-y-4">
                                        {previewImage && (
                                            <div className="relative w-full h-48 rounded-xl overflow-hidden border" style={{ borderColor: `${currentTheme.hex.primary}40` }}>
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-solid"
                                            style={{
                                                borderColor: previewImage ? `${currentTheme.hex.primary}40` : `${currentTheme.hex.primary}60`,
                                                backgroundColor: `${currentTheme.hex.primary}05`
                                            }}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-10 h-10 mb-3" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="mb-2 text-sm text-gray-400">
                                                    <span className="font-semibold" style={{ color: currentTheme.hex.primary }}>Klik untuk upload</span> atau drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 2MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>
                                    {errors.gambar && (
                                        <p className="mt-1 text-sm text-red-400">{errors.gambar}</p>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseUpdateModal}
                                        className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 border"
                                        style={{
                                            color: currentTheme.hex.secondary,
                                            borderColor: `${currentTheme.hex.primary}40`,
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg"
                                        style={{
                                            background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                            boxShadow: `0 10px 25px -5px ${currentTheme.hex.primary}40`
                                        }}
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    currentTheme={currentTheme}
                    title="Hapus Kendaraan"
                    message="Apakah Anda yakin ingin menghapus kendaraan ini?"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            </div>
        </LayoutAdmin>
    );
}
