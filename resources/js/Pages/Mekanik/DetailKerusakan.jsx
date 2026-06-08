import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DetailKerusakan({ assignment }) {
    const { kendaraan, kerusakan } = assignment || {};
    const { flash } = usePage().props;

    const initialKendalaList = Array.isArray(kerusakan?.kendala)
        ? kerusakan.kendala.map((k, index) => ({
            id: index,
            text: `${k.name || ''} - ${k.description || ''}`,
            checked: true
        }))
        : [];

    const [kendalaList, setKendalaList] = useState(initialKendalaList);
    const [buktiBill, setBuktiBill] = useState(null);
    const [previewBuktiBill, setPreviewBuktiBill] = useState(null);

 
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

    const handleInputChange = (id, field, value) => {
        setKendalaList(
            kendalaList.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const toggleKendala = (id) => {
        setKendalaList(
            kendalaList.map((item) =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handleMarkAsPending = () => {
        router.post('/mekanik/mark-as-pending', {
            keruskaanacc_id: assignment.id
        }, {
            preserveScroll: true,
            onSuccess: () => {
            
            },
            onError: (errors) => {
       
                if (errors.keruskaanacc_id) {
                    toast.error(errors.keruskaanacc_id, {
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
                } else {
               
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
            }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBuktiBill(file);
            setPreviewBuktiBill(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        const checkedItems = kendalaList.filter(item => item.checked);

        if (checkedItems.length === 0) {
            toast.error("Pilih minimal satu kendala untuk diselesaikan.");
            return;
        }


        for (const item of checkedItems) {
            if (!item.nominal) {
                toast.error("Nominal biaya harus diisi untuk semua kendala yang dipilih.");
                return;
            }
            if (!item.sparepart) {
                toast.error("Detail sparepart/maintenance harus diisi untuk semua kendala yang dipilih.");
                return;
            }
        }

        const detailBiaya = checkedItems.map(item => ({
            text: item.text,
            nominal: parseFloat(item.nominal),
            sparepart: item.sparepart
        }));

  
        const formData = new FormData();
        formData.append('keruskaanacc_id', assignment.id);
        

        detailBiaya.forEach((item, index) => {
            formData.append(`detail_biaya[${index}][text]`, item.text);
            formData.append(`detail_biaya[${index}][nominal]`, item.nominal);
            formData.append(`detail_biaya[${index}][sparepart]`, item.sparepart || '');
        });
        
        if (buktiBill) {
            formData.append('bukti_bill', buktiBill);
        }

        router.post('/mekanik/bill', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Success message akan ditangani oleh flash message
            },
            onError: (errors) => {
                // Handle validation errors
                if (errors.keruskaanacc_id) {
                    toast.error(errors.keruskaanacc_id, {
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
                } else if (errors.detail_biaya) {
             
                    Object.keys(errors.detail_biaya || {}).forEach(key => {
                        const errorMessages = errors.detail_biaya[key];
                        if (Array.isArray(errorMessages)) {
                            errorMessages.forEach(msg => {
                                toast.error(msg, {
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
                            });
                        }
                    });
                } else {
          
                    toast.error('Terjadi kesalahan saat membuat bill. Silakan coba lagi.', {
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
            }
        });
    };

    if (!assignment) return <div>Loading...</div>;

    const carImage = kendaraan.gambar && !kendaraan.gambar.startsWith('http')
        ? `/storage/${kendaraan.gambar}`
        : kendaraan.gambar || "https://blog.gaadikey.com/wp-content/uploads/2017/01/Nissan-Terrano-2017-Edition.jpg";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 relative overflow-hidden pb-24">
            <ToastContainer />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md mx-auto relative z-10">
                {/* tombol back */}
                <Link
                    href="/mekanik/dashboard"
                    className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full mb-6 border border-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-110 shadow-xl"
                >
                    <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </Link>


                <div className="bg-white/10 backdrop-blur-xl rounded-[28px] p-6 shadow-2xl border border-white/10 mb-6 animate-fade-in">
                    {/* Car Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex-1">
                            <h1 className="text-white text-xl font-bold mb-2">
                                {kendaraan.merek}
                            </h1>
                            <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-300 font-semibold text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
                                Status: {kendaraan.status}
                            </div>
                        </div>

                        {/* Car Image sama plat*/}
                        <div className="flex flex-col items-end ml-4">
                            <div className="w-24 h-20 mb-2 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-sm border border-blue-300/40 p-2">
                                <img
                                    src={carImage}
                                    alt={kendaraan.merek}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-white font-semibold text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                {kendaraan.plat_nomor}
                            </p>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3.5 mb-5 border border-blue-300/40">
                        <p className="text-gray-900 text-sm">
                            {kerusakan.catatan || "Tidak ada catatan tambahan."}
                        </p>
                    </div>

                    {/* Kendala Section with Bill Inputs */}
                    <div className="mb-5">
                        <h2 className="text-white text-base font-bold mb-4">
                            Kendala & Biaya
                        </h2>

                        <div className="space-y-4">
                            {kendalaList.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="space-y-3 animate-slide-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* nama kendala*/}
                                    {/* nama kendala*/}
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={() => toggleKendala(item.id)}
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 cursor-pointer ${item.checked
                                                ? "bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50"
                                                : "bg-white/10 border-white/30"
                                                }`}
                                        >
                                            {item.checked && (
                                                <svg
                                                    className="w-3 h-3 text-gray-900"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={3}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium transition-colors ${item.checked ? "text-white" : "text-blue-200"}`}>
                                            {item.text}
                                        </span>
                                    </div>

                                    <div className="space-y-2.5 pl-7">
                                        {/* Nominal Input */}
                                        <input
                                            type="number"
                                            placeholder="Masukkan Nominal Rp"
                                            value={item.nominal || ''}
                                            onChange={(e) =>
                                                handleInputChange(item.id, "nominal", e.target.value)
                                            }
                                            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-blue-200/50 focus:bg-white/10 focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                                        />

                                        {/* Sparepart/Maintenance Input */}
                                        <input
                                            type="text"
                                            placeholder="Nama Sparepart/Maintanance Yang Dilakukan"
                                            value={item.sparepart || ''}
                                            onChange={(e) =>
                                                handleInputChange(item.id, "sparepart", e.target.value)
                                            }
                                            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-blue-200/50 focus:bg-white/10 focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upload Bukti Bill Section */}
                    <div className="mb-5">
                        <h2 className="text-white text-base font-bold mb-4">
                            Upload Bukti Bill Pembelian Part
                        </h2>
                        <div className="space-y-3">
                            <label className="block w-full">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="bukti-bill-upload"
                                />
                                <div className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center cursor-pointer hover:bg-white/10 transition-all duration-300">
                                    {previewBuktiBill ? (
                                        <div className="space-y-2">
                                            <img
                                                src={previewBuktiBill}
                                                alt="Preview bukti bill"
                                                className="w-full h-48 object-cover rounded-xl mb-2"
                                            />
                                            <p className="text-blue-200 text-sm">
                                                {buktiBill?.name || 'Gambar terpilih'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setBuktiBill(null);
                                                    setPreviewBuktiBill(null);
                                                    document.getElementById('bukti-bill-upload').value = '';
                                                }}
                                                className="text-red-400 text-xs hover:text-red-300"
                                            >
                                                Hapus gambar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <svg className="w-12 h-12 text-blue-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-blue-200 text-sm">
                                                Klik untuk upload bukti bill (opsional)
                                            </p>
                                            <p className="text-blue-200/60 text-xs">
                                                Format: JPG, PNG, GIF (Max 5MB)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <button 
                            onClick={handleMarkAsPending}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            Mark As Pending
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 animate-slide-up"
                >
                    Done
                </button>
            </div>

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
