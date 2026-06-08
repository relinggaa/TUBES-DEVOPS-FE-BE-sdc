import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardMekanik() {
    const { auth, flash, keruskaanAcc: kerusakanAcc = [], bills = [] } = usePage().props;
    const user = auth?.user;
    const [showModal, setShowModal] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Handle flash messages
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
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #3b82f640',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px #3b82f630'
                },
                progressStyle: {
                    background: 'linear-gradient(to right, #3b82f6, #06b6d4)'
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
                    backgroundColor: '#1e293b',
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
    }, [flash?.success, flash?.error]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('gambar', selectedFile);

        router.post('/mekanik/update-gambar', formData, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setShowModal(false);
                setSelectedFile(null);
                setPreviewUrl(null);
            },
            onError: (errors) => {
                console.error('Error uploading image:', errors);
                toast.error('Gagal mengupload gambar. Pastikan file adalah gambar dan ukurannya tidak lebih dari 2MB.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: {
                        backgroundColor: '#1e293b',
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
        });
    };

    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            router.post('/mekanik/logout');
        }
    };

    const handleMarkAsFull = () => {
        if (confirm('Apakah Anda yakin ingin menandai status sebagai Full? Anda tidak akan muncul di daftar mekanik yang tersedia.')) {
            router.post('/mekanik/mark-as-full', {}, {
                preserveScroll: true,
                onSuccess: () => {

                },
                onError: (errors) => {
                    toast.error('Terjadi kesalahan saat mengubah status. Silakan coba lagi.', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        style: {
                            backgroundColor: '#1e293b',
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
            });
        }
    };

    const handleMarkAsAvailable = () => {
        if (confirm('Apakah Anda yakin ingin menandai status sebagai Available? Anda akan muncul di daftar mekanik yang tersedia.')) {
            router.post('/mekanik/mark-as-available', {}, {
                preserveScroll: true,
                onSuccess: () => {

                },
                onError: (errors) => {
                    toast.error('Terjadi kesalahan saat mengubah status. Silakan coba lagi.', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        style: {
                            backgroundColor: '#1e293b',
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
            });
        }
    };

    const profileImageUrl = user?.gambar && !user.gambar.startsWith('http') ? `/storage/${user.gambar}` : user?.gambar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_qydwbyfzBseOkXvF2to4jax9f5yN6unb5g&s';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 relative overflow-hidden pb-20">
            <ToastContainer />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md mx-auto relative z-10">
                {/* Header with Logout Button */}
                <div className="flex items-center justify-between mb-6 gap-4">
                    <h1 className="text-white text-xl md:text-2xl font-bold animate-fade-in whitespace-nowrap">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={() => setShowBillModal(true)}
                            className="group/btn relative bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold p-2.5 md:px-4 md:py-2 rounded-full hover:bg-white/15 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                            title="Bill"
                        >
                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="hidden md:inline">Bill</span>
                        </button>
                        <Link
                            href="/mekanik/tanya-ai"
                            className="group/btn relative bg-gradient-to-r from-blue-500 to-cyan-500 backdrop-blur-md border border-white/20 text-white text-sm font-semibold p-2.5 md:px-4 md:py-2 rounded-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                            title="Tanya AI"
                        >
                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span className="hidden md:inline">Tanya AI</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="group/btn relative bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold p-2.5 md:px-4 md:py-2 rounded-full hover:bg-white/15 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                            title="Logout"
                        >
                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 mb-6 shadow-2xl border border-white/10 animate-fade-in hover:scale-[1.02] hover:border-white/20 hover:shadow-cyan-500/30 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">

                        <div className="w-16 h-16 flex-shrink-0">
                            <div
                                onClick={() => setShowModal(true)}
                                className="w-full h-full rounded-full overflow-hidden border-2 border-white/20 shadow-lg cursor-pointer hover:border-white/30 transition-all"
                            >
                                <img
                                    src={profileImageUrl}
                                    alt="Profile picture"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Name */}
                            <h2 className="text-white text-lg font-bold truncate">
                                {user?.username || 'Mekanik'}
                            </h2>
                            {/* Role */}
                            <p className="text-blue-200 text-xs flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Mekanik
                            </p>
                        </div>
                    </div>

                    {/* Edit Profile Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold py-2.5 rounded-full hover:bg-white/15 transition-all mb-3 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                    </button>

                    {user?.status === 'full' ? (
                        <button
                            onClick={handleMarkAsAvailable}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            Mark As Available
                        </button>
                    ) : (
                        <button
                            onClick={handleMarkAsFull}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            Mark As Full
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-white text-xl font-bold">
                        List Kendaraan
                    </h2>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-blue-400/30 to-transparent"></div>
                </div>

                {/* Vehicle Card*/}
                <div className="space-y-4">
                    {kerusakanAcc.length > 0 ? (
                        kerusakanAcc.map((keruskaan, index) => {
                            const carImage = keruskaan.kendaraan.gambar && !keruskaan.kendaraan.gambar.startsWith('http')
                                ? `/storage/${keruskaan.kendaraan.gambar}`
                                : keruskaan.kendaraan.gambar || "https://blog.gaadikey.com/wp-content/uploads/2017/01/Nissan-Terrano-2017-Edition.jpg";

                            return (
                                <div
                                    key={keruskaan.id}
                                    className="bg-white/10 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-2xl border border-white/10 hover:bg-white/15 transition-all duration-300 animate-slide-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Vehicle Image */}
                                    <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-900">
                                        <img
                                            src={carImage}
                                            alt={keruskaan.kendaraan.merek}
                                            className="w-full h-full object-cover"
                                        />

                                        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Vehicle Info */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold text-lg mb-1">
                                                    {keruskaan.kendaraan.merek}
                                                </h3>
                                                <p className="text-white/60 text-sm font-medium mb-2">
                                                    {keruskaan.kendaraan.plat_nomor}
                                                </p>
                                                <p className="text-blue-200 text-xs flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Jadwal: {new Date(keruskaan.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
                                                {keruskaan.kendaraan.status}
                                            </div>
                                        </div>

                                        {/* Kerusakan Section */}
                                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 mb-4 border border-white/10">
                                            <p className="text-blue-100 text-xs flex items-start gap-2">
                                                <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                {keruskaan.kerusakan.catatan || "Tidak ada catatan"}
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <Link
                                            href={`/mekanik/detailkerusakan/${keruskaan.id}`}
                                            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
                                        >
                                            See Detail
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-white/60">Tidak ada kendaraan yang sedang dalam perbaikan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Profile Photo Upload */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[28px] p-8 max-w-md w-full border border-white/20 shadow-2xl animate-slide-up">
                        <button
                            onClick={() => {
                                setShowModal(false);
                                setSelectedFile(null);
                                setPreviewUrl(null);
                            }}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-white text-2xl font-bold mb-6">Ganti Foto Profil</h3>

                        <div className="flex justify-center mb-6">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/40 shadow-xl">
                                <img
                                    src={previewUrl || profileImageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block w-full">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="profile-upload-mekanik"
                                />
                                <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center cursor-pointer hover:bg-white/15 transition-all">
                                    <svg className="w-8 h-8 text-blue-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-blue-200 text-sm">
                                        {selectedFile ? selectedFile.name : "Pilih foto dari perangkat"}
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold py-3 rounded-full hover:bg-white/15 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Bill History */}
            {showBillModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[28px] p-8 max-w-2xl w-full border border-white/20 shadow-2xl animate-slide-up max-h-[80vh] overflow-y-auto">
                        <button
                            onClick={() => setShowBillModal(false)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-white text-2xl font-bold mb-6">Riwayat Bill</h3>

                        <div className="space-y-4">
                            {bills.length > 0 ? (
                                bills.map((bill) => (
                                    <div key={bill.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-white font-bold text-lg">
                                                    {bill.keruskaan_acc?.kendaraan?.merek || 'Kendaraan'}
                                                </h4>
                                                <p className="text-blue-200 text-xs font-medium">
                                                    {bill.keruskaan_acc?.kendaraan?.plat_nomor}
                                                </p>
                                            </div>
                                            <span className="text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                                Rp {Number(bill.total_biaya).toLocaleString('id-ID')}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            {bill.detail_biaya && Array.isArray(bill.detail_biaya) && bill.detail_biaya.map((detail, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                    <div className="flex flex-col">
                                                        <span className="text-white/80">{detail.text}</span>
                                                        <span className="text-white/40 text-xs">Sparepart: {detail.sparepart}</span>
                                                    </div>
                                                    <span className="text-white/90 font-medium">
                                                        Rp {Number(detail.nominal).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <span className="text-xs text-white/40">
                                                {new Date(bill.created_at).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10">
                                    <svg className="w-12 h-12 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-white/60">Belum ada riwayat bils.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
        </div>
    );
}
