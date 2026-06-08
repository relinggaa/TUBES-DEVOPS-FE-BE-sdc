import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { toast } from "react-toastify";

export default function DashboardDriver({ kendaraan = null, kerusakan = null }) {
  const { auth, flash } = usePage().props;
  const user = auth?.user;


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


  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // State untuk update kendala
  const [updateFormData, setUpdateFormData] = useState({
    catatan: '',
    kendalaList: []
  });
  const [newKendala, setNewKendala] = useState({ name: "", description: "" });
  const [showKendalaModal, setShowKendalaModal] = useState(false);

  // State untuk edit kendala
  const [editingKendala, setEditingKendala] = useState(null);
  const [showEditKendalaModal, setShowEditKendalaModal] = useState(false);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      router.post('/driver/logout');
    }
  };

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

    router.post('/driver/update-gambar', formData, {
      preserveScroll: true,
      preserveState: false,
      onSuccess: () => {
        setShowModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      },
      onError: (errors) => {
        console.error('Error uploading image:', errors);
        alert('Gagal mengupload gambar. Pastikan file adalah gambar dan ukurannya tidak lebih dari 2MB.');
      }
    });
  };

  // Handler untuk batalkan pengajuan
  const handleCancelPengajuan = () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pengajuan perbaikan?')) {
      return;
    }

    router.post('/driver/kerusakan/cancel', {
      kendaraan_id: kendaraan.id
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Pengajuan berhasil dibatalkan!', {
          position: "top-right",
          autoClose: 3000,
        });
      },
      onError: (errors) => {
        console.error('Error canceling:', errors);
      }
    });
  };

  // Handler untuk membuka modal update
  const handleOpenUpdateModal = () => {
    if (kerusakan) {
      setUpdateFormData({
        catatan: kerusakan.catatan || '',
        kendalaList: kerusakan.kendala?.map((k, idx) => ({
          id: idx + 1,
          name: k.name,
          description: k.description
        })) || []
      });
      setShowUpdateModal(true);
    }
  };

  // Handler untuk tambah kendala di modal update
  const handleAddKendalaUpdate = () => {
    if (newKendala.name.trim() && newKendala.description.trim()) {
      const newId = updateFormData.kendalaList.length > 0
        ? Math.max(...updateFormData.kendalaList.map(k => k.id)) + 1
        : 1;
      setUpdateFormData({
        ...updateFormData,
        kendalaList: [...updateFormData.kendalaList, { id: newId, ...newKendala }]
      });
      setNewKendala({ name: "", description: "" });
      setShowKendalaModal(false);
    }
  };

  // Handler untuk hapus kendala di modal update
  const removeKendalaUpdate = (id) => {
    setUpdateFormData({
      ...updateFormData,
      kendalaList: updateFormData.kendalaList.filter((item) => item.id !== id)
    });
  };

  // Handler untuk membuka modal edit kendala
  const handleOpenEditKendala = (kendala) => {
    setEditingKendala({ ...kendala });
    setShowEditKendalaModal(true);
  };

  // Handler untuk menyimpan edit kendala
  const handleSaveEditKendala = () => {
    if (editingKendala.name.trim() && editingKendala.description.trim()) {
      setUpdateFormData({
        ...updateFormData,
        kendalaList: updateFormData.kendalaList.map((item) =>
          item.id === editingKendala.id ? editingKendala : item
        )
      });
      setEditingKendala(null);
      setShowEditKendalaModal(false);
    }
  };

  // Handler untuk submit update
  const handleSubmitUpdate = () => {
    if (updateFormData.kendalaList.length === 0) {
      toast.error('Minimal harus ada 1 kendala!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const kendalaData = updateFormData.kendalaList.map(item => ({
      name: item.name,
      description: item.description
    }));

    router.put(`/driver/kerusakan/${kerusakan.id}`, {
      catatan: updateFormData.catatan,
      kendala: kendalaData
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setShowUpdateModal(false);
        toast.success('Kendala berhasil diupdate!', {
          position: "top-right",
          autoClose: 3000,
        });
      },
      onError: (errors) => {
        console.error('Error updating:', errors);
      }
    });
  };

  const vehicles = kendaraan ? [{
    id: kendaraan.id,
    name: kendaraan.merek,
    status: kendaraan.status || 'Normal',
    plate: kendaraan.plat_nomor,
    image: kendaraan.gambar ? `/storage/${kendaraan.gambar}` : "https://blog.gaadikey.com/wp-content/uploads/2017/01/Nissan-Terrano-2017-Edition.jpg",
  }] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 mb-6 shadow-2xl relative overflow-hidden gap-2">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 animate-pulse pointer-events-none"></div>

          {/* Tanya AI */}
          <Link
            href="/driver/tanya-ai"
            className="flex-1 group relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold px-2 py-2 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 z-10"
            title="Tanya AI"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-sm font-bold truncate">Tanya AI</span>
          </Link>

          {/* Towing Button */}
          <Link
            href="/driver/towing"
            className="flex-1 group relative bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold px-2 py-2 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 shadow-sm z-10"
            title="Towing"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-indigo-300 group-hover:scale-110 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 16H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6h4l3 3v4a1 1 0 0 1-1 1h-2M10 16h6" />
            </svg>
            <span className="text-xs sm:text-sm font-medium truncate">Towing</span>
          </Link>

          {/* Bensin Button */}
          <Link
            href="/driver/struk-bensin"
            className="flex-1 group relative bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold px-2 py-2 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 shadow-sm z-10"
            title="Upload Struk Bensin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 14h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3v6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 10v4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 10h4" />
            </svg>
            <span className="text-xs sm:text-sm font-medium truncate">Bensin</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="group relative bg-white/10 hover:bg-red-500/80 border border-white/10 text-white px-3 py-2 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center shadow-sm z-10"
            title="Logout"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <div className="relative bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-purple-500/20 backdrop-blur-2xl rounded-[32px] p-8 mb-8 shadow-2xl border border-white/30 overflow-hidden animate-fade-in hover:scale-[1.02] hover:border-white/40 hover:shadow-cyan-500/30 transition-all duration-300 cursor-pointer group">

          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-cyan-400/5 pointer-events-none"></div>

          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

          <div className="relative flex flex-col items-center">
            {/* Profile Image with Gradient Border */}
            <div className="relative mb-6">
              {/* Gradient border ring */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 rounded-full blur-sm opacity-75 animate-pulse"></div>

              {/* Image container */}
              <div
                onClick={() => setShowModal(true)}
                className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white/40 shadow-2xl backdrop-blur-sm cursor-pointer hover:border-white/50 transition-all"
              >
                <img
                  src={user?.gambar ? `/storage/${user.gambar}` : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_qydwbyfzBseOkXvF2to4jax9f5yN6unb5g&s"}
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setShowModal(true)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 border-2 border-white/40"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            {/* Name */}
            <h4 className="text-white text-3xl font-bold mb-2 drop-shadow-2xl tracking-tight">
              {user?.username || 'Driver'}
            </h4>

            {/* Date*/}
            <div className="flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">

              <p className="text-blue-200 text-sm font-medium">
                Driver
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Cards */}
        {vehicles.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-blue-500/20">
                <svg className="w-10 h-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <p className="text-white text-lg font-semibold">Belum ada kendaraan</p>
              <p className="text-blue-200 text-sm">Hubungi admin untuk mendapatkan kendaraan</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {vehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/30 group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-3 group-hover:text-blue-300 transition-colors">
                      {vehicle.name}
                    </h3>
                    <div
                      className="inline-flex items-center gap-2 border font-bold text-sm px-4 py-2 rounded-full backdrop-blur-sm"
                      style={{
                        backgroundColor:
                          vehicle.status === 'Normal'
                            ? '#3b82f620'
                            : vehicle.status === 'Pengajuan Perbaikan'
                              ? '#f59e0b20'
                              : vehicle.status === 'Pending'
                                ? '#6366f120'
                                : '#ef444420',
                        color:
                          vehicle.status === 'Normal'
                            ? 'white'
                            : vehicle.status === 'Pengajuan Perbaikan'
                              ? '#f59e0b'
                              : vehicle.status === 'Pending'
                                ? '#6366f1'
                                : '#ef4444',
                        borderColor:
                          vehicle.status === 'Normal'
                            ? '#3b82f640'
                            : vehicle.status === 'Pengajuan Perbaikan'
                              ? '#f59e0b40'
                              : vehicle.status === 'Pending'
                                ? '#6366f140'
                                : '#ef444440'
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor:
                            vehicle.status === 'Normal'
                              ? '#3b82f6'
                              : vehicle.status === 'Pengajuan Perbaikan'
                                ? '#f59e0b'
                                : vehicle.status === 'Pending'
                                  ? '#6366f1'
                                  : '#ef4444'
                        }}
                      ></span>
                      Status: {vehicle.status}
                    </div>
                  </div>

                  <div className="flex flex-col items-end ml-4">
                    <div className="w-28 h-20 mb-3 rounded-lg overflow-hidden bg-white/60 backdrop-blur-sm border border-blue-300/40 p-2 hover:scale-110 transition-transform duration-300">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-white font-bold text-sm bg-white/10 px-4 py-2 rounded-lg border border-white/20 backdrop-blur-sm">
                      {vehicle.plate}
                    </p>
                  </div>
                </div>

                {/* Tampilkan Catatan dan Kendala jika status bukan Normal */}
                {vehicle.status !== 'Normal' && kerusakan && (
                  <div className="mb-4 space-y-4 animate-slide-up">
                    {/* Catatan */}
                    {kerusakan.catatan && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-blue-300/30">
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <h4 className="text-blue-300 font-semibold text-sm mb-1">Catatan</h4>
                            <p className="text-white text-sm leading-relaxed">{kerusakan.catatan}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Kendala */}
                    {kerusakan.kendala && kerusakan.kendala.length > 0 && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-blue-300/30">
                        <div className="flex items-center gap-2 mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <h4 className="text-amber-400 font-semibold text-sm">Daftar Kendala ({kerusakan.kendala.length})</h4>
                        </div>
                        <div className="space-y-2">
                          {kerusakan.kendala.map((item, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-white font-semibold text-sm mb-0.5">{item.name}</p>
                                  <p className="text-blue-200 text-xs">{item.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tombol Dinamis Berdasarkan Status */}
                {vehicle.status === 'Normal' && (
                  <Link href="/driver/report">
                    <button className="group relative w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                      <div className="relative flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-base">Buat Laporan Kerusakan</span>
                      </div>
                    </button>
                  </Link>
                )}

                {vehicle.status === 'Pengajuan Perbaikan' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleCancelPengajuan}
                      className="group relative w-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                      <div className="relative flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-base">Batalkan Pengajuan</span>
                      </div>
                    </button>

                    <button
                      onClick={handleOpenUpdateModal}
                      className="group relative w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                      <div className="relative flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-base">Update Kendala</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Tidak ada tombol untuk status Perbaikan dan Pending */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Profile Photo Upload */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[28px] p-8 max-w-md w-full border border-white/20 shadow-2xl animate-slide-up">
            {/* Close Button */}
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

            {/* Preview */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/40 shadow-xl">
                <img
                  src={previewUrl || (user?.gambar ? `/storage/${user.gambar}` : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_qydwbyfzBseOkXvF2to4jax9f5yN6unb5g&s")}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* File Input */}
            <div className="mb-6">
              <label className="block w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="profile-upload"
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

            {/* Action Buttons */}
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

      {/* Modal for Update Kendala */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[28px] p-8 max-w-2xl w-full border border-white/20 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowUpdateModal(false);
                setShowKendalaModal(false);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-white text-2xl font-bold mb-6">Update Kendala Kerusakan</h3>

            {/* Catatan */}
            <div className="mb-6">
              <label className="block text-blue-200 text-sm font-medium mb-2">
                Catatan
              </label>
              <textarea
                value={updateFormData.catatan}
                onChange={(e) => setUpdateFormData({ ...updateFormData, catatan: e.target.value })}
                rows="3"
                className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none"
                placeholder="Masukkan catatan kerusakan..."
              />
            </div>

            {/* Kendala List */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-300/40 mb-6">
              <button
                type="button"
                onClick={() => setShowKendalaModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 mb-4"
              >
                Tambah Kendala
              </button>

              <div className="space-y-3">
                {updateFormData.kendalaList.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-blue-300/40 hover:bg-white/25 transition-all duration-300"
                  >
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => removeKendalaUpdate(item.id)}
                        className="flex-shrink-0 mt-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m3-3h4"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditKendala(item)}
                        className="flex-shrink-0 mt-1 text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1">
                      <span className="block text-white font-semibold mb-1">
                        {item.name}
                      </span>
                      <span className="block text-blue-200 text-sm">
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold py-3 rounded-full hover:bg-white/15 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitUpdate}
                disabled={updateFormData.kendalaList.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding Kendala in Update */}
      {showKendalaModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[28px] p-8 max-w-md w-full border border-white/20 shadow-2xl animate-slide-up">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowKendalaModal(false);
                setNewKendala({ name: "", description: "" });
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-white text-2xl font-bold mb-6">Tambah Kendala Baru</h3>

            {/* Form Inputs */}
            <div className="space-y-4 mb-6">
              {/* Nama Kendala */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Nama Kendala
                </label>
                <input
                  type="text"
                  value={newKendala.name}
                  onChange={(e) => setNewKendala({ ...newKendala, name: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  placeholder="Contoh: Ban Bocor"
                />
              </div>

              {/* Deskripsi Kendala */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Deskripsi Kendala
                </label>
                <textarea
                  value={newKendala.description}
                  onChange={(e) => setNewKendala({ ...newKendala, description: e.target.value })}
                  rows="3"
                  className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none"
                  placeholder="Deskripsi kendala..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowKendalaModal(false);
                  setNewKendala({ name: "", description: "" });
                }}
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold py-3 rounded-full hover:bg-white/15 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddKendalaUpdate}
                disabled={!newKendala.name.trim() || !newKendala.description.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Kendala */}
      {showEditKendalaModal && editingKendala && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[28px] p-8 max-w-md w-full border border-white/20 shadow-2xl animate-slide-up">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowEditKendalaModal(false);
                setEditingKendala(null);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-white text-2xl font-bold mb-6">Edit Kendala</h3>

            {/* Form Inputs */}
            <div className="space-y-4 mb-6">
              {/* Nama Kendala */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Nama Kendala
                </label>
                <input
                  type="text"
                  value={editingKendala.name}
                  onChange={(e) => setEditingKendala({ ...editingKendala, name: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  placeholder="Contoh: Ban Bocor"
                />
              </div>

              {/* Deskripsi Kendala */}
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Deskripsi Kendala
                </label>
                <textarea
                  value={editingKendala.description}
                  onChange={(e) => setEditingKendala({ ...editingKendala, description: e.target.value })}
                  rows="3"
                  className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none"
                  placeholder="Deskripsi kendala..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditKendalaModal(false);
                  setEditingKendala(null);
                }}
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold py-3 rounded-full hover:bg-white/15 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditKendala}
                disabled={!editingKendala.name.trim() || !editingKendala.description.trim()}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Simpan
              </button>
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
