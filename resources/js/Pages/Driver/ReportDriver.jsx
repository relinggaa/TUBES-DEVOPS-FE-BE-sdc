import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";

export default function ReportDriver({ kendaraan = null }) {
  const { flash } = usePage().props;
  const [formData, setFormData] = useState({
    merek: '',
    plat_nomor: '',
    catatan: ''
  });

  const [kendalaList, setKendalaList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (kendaraan) {
      setFormData({
        merek: kendaraan.merek || '',
        plat_nomor: kendaraan.plat_nomor || '',
        catatan: ''
      });
    }
  }, [kendaraan]);


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
  const [newKendala, setNewKendala] = useState({ name: "", description: "" });

  const removeKendala = (id) => {
    setKendalaList(kendalaList.filter((item) => item.id !== id));
  };

  const handleAddKendala = () => {
    if (newKendala.name.trim() && newKendala.description.trim()) {
      const newId = kendalaList.length > 0 ? Math.max(...kendalaList.map(k => k.id)) + 1 : 1;
      setKendalaList([...kendalaList, { id: newId, ...newKendala }]);
      setNewKendala({ name: "", description: "" });
      setShowModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!kendaraan || !kendaraan.id) {
      toast.error('Kendaraan tidak ditemukan. Silakan hubungi admin.', {
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
      return;
    }


    if (kendalaList.length === 0) {
      toast.error('Silakan tambahkan minimal 1 kendala sebelum mengirim laporan.', {
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
      return;
    }

    setIsSubmitting(true);


    const kendalaData = kendalaList.map(item => ({
      name: item.name,
      description: item.description
    }));

    router.post('/driver/report', {
      kendaraan_id: kendaraan.id,
      catatan: formData.catatan || null,
      kendala: kendalaData.length > 0 ? kendalaData : null,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
      },
      onError: (errors) => {
        setIsSubmitting(false);
        console.error('Error submitting report:', errors);


        Object.keys(errors).forEach(key => {
          toast.error(errors[key], {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Back Button */}
        <Link
          href="/driver/dashboard"
          className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full mb-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-110 shadow-2xl group"
        >
          <svg
            className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>


        <form onSubmit={handleSubmit}>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 mb-6 animate-fade-in">
            <div className="mb-6">
              <label htmlFor="credit-card" className="block text-white font-medium mb-3 drop-shadow-lg">
                Merek Kendaraan
              </label>
              <input
                type="text"
                id="merek-kendaraan"
                name="merek-kendaraan"
                value={formData.merek}
                onChange={(e) => setFormData({ ...formData, merek: e.target.value })}
                className="block w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-4 px-4 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all"
                placeholder="Merek kendaraan"
              />
            </div>
            {/* Plat Nomor Input */}
            <div className="mb-6">
              <label htmlFor="credit-card" className="block text-white font-medium mb-3 drop-shadow-lg">
                Plat Nomor
              </label>
              <input
                type="text"
                id="plat-nomor"
                name="plat-nomor"
                value={formData.plat_nomor}
                onChange={(e) => setFormData({ ...formData, plat_nomor: e.target.value.toUpperCase() })}
                className="block w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-4 px-4 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all"
                placeholder="Plat nomor"
              />
            </div>

            {/* Catatan Input */}
            <div className="mb-6">
              <label htmlFor="phone" className="block text-white font-medium mb-3 drop-shadow-lg">
                Catatan
              </label>
              <textarea
                id="catatan"
                name="catatan"
                rows="4"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                className="block w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-4 px-4 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none"
                placeholder="Masukkan catatan kerusakan..."
              />
            </div>

            {/* Kendala Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-300/40 mb-6">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 mb-6"
              >
                Tambah Kendala
              </button>

              <div className="space-y-4">
                {kendalaList.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-300/40 hover:bg-white/10 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <button
                      onClick={() => removeKendala(item.id)}
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
                    <div className="flex-1">
                      <span className="block text-gray-900 font-semibold mb-1">
                        {item.name}
                      </span>
                      <span className="block text-blue-700 text-sm">
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !kendaraan || kendalaList.length === 0}
            className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 animate-slide-up disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <span>Kirim Laporan</span>
                <svg
                  className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal for Adding Kendala */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[28px] p-8 max-w-md w-full border border-white/20 shadow-2xl animate-slide-up">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false);
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
                  placeholder="Contoh: Kendala 3"
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
                  setShowModal(false);
                  setNewKendala({ name: "", description: "" });
                }}
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold py-3 rounded-full hover:bg-white/15 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddKendala}
                disabled={!newKendala.name.trim() || !newKendala.description.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Tambah
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
