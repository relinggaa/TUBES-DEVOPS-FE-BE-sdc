import React, { useState, useEffect, useRef } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { toast } from "react-toastify";

const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

const isTrustedExternalUrl = (value, expectedHost) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "https:" && parsedUrl.host === expectedHost;
  } catch {
    return false;
  }
};

const emptyRiwayatPaginated = { data: [], links: [], total: 0 };

export default function RequestTowing({ riwayatTowing = emptyRiwayatPaginated, activeTowing = null }) {
  const { flash } = usePage().props;

  const historyItems = Array.isArray(riwayatTowing) ? riwayatTowing : (riwayatTowing?.data ?? []);
  const historyLinks = Array.isArray(riwayatTowing) ? [] : (riwayatTowing?.links ?? []);
  const historyTotal = Array.isArray(riwayatTowing) ? riwayatTowing.length : (riwayatTowing?.total ?? historyItems.length);
  const historyEmpty = historyTotal === 0;

  // Form state
  const [lokasi, setLokasi] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Map refs
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  // Reverse geocode globally available
  const reverseGeocode = async (lat, lng) => {
    try {
      const reverseUrl = new URL(NOMINATIM_REVERSE_URL);
      reverseUrl.searchParams.set("lat", String(lat));
      reverseUrl.searchParams.set("lon", String(lng));
      reverseUrl.searchParams.set("format", "json");

      const res = await fetch(reverseUrl.toString(), {
        headers: {
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setLokasi(addr);
    } catch {
      setLokasi(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  // Flash messages
  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success, {
        position: "top-right",
        autoClose: 3000,
        style: {
          backgroundColor: "#1e293b",
          color: "#ffffff",
          border: "1px solid #3b82f640",
          borderRadius: "12px",
        },
      });
    }
    if (flash?.error) {
      toast.error(flash.error, {
        position: "top-right",
        autoClose: 3000,
        style: {
          backgroundColor: "#1e293b",
          color: "#ffffff",
          border: "1px solid #ef444440",
          borderRadius: "12px",
        },
      });
    }
  }, [flash?.success, flash?.error]);

  // Load Leaflet map
  useEffect(() => {
    if (mapLoaded || !mapRef.current) return;

    const loadLeaflet = async () => {
      // Inject Leaflet CSS
      if (!document.getElementById("leaflet-css") && isTrustedExternalUrl(LEAFLET_CSS_URL, "unpkg.com")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = LEAFLET_CSS_URL;
        link.referrerPolicy = "no-referrer";
        document.head.appendChild(link);
      }

      // Inject Leaflet JS
      if (!window.L) {
        if (!isTrustedExternalUrl(LEAFLET_JS_URL, "unpkg.com")) {
          throw new Error("Invalid Leaflet script URL");
        }
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = LEAFLET_JS_URL;
          script.onload = resolve;
          script.onerror = reject;
          script.referrerPolicy = "no-referrer";
          document.head.appendChild(script);
        });
      }

      const L = window.L;
      const defaultCenter = [-6.2088, 106.8456]; // Jakarta

      const map = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom icon
      const customIcon = window.L.divIcon({
        className: "",
        html: `<div style="
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(99,102,241,0.6);
          border: 3px solid white;
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      // Init marker at default center
      markerRef.current = L.marker(defaultCenter, { icon: customIcon })
        .addTo(map)
        .bindPopup("📍 Titik Penjemputan")
        .openPopup();

      setCoords({ lat: defaultCenter[0], lng: defaultCenter[1] });

      // Initial fetch for default center
      reverseGeocode(defaultCenter[0], defaultCenter[1]);

      // Update location when map is moved
      map.on("move", () => {
        const center = map.getCenter();
        if (markerRef.current) markerRef.current.setLatLng(center);
      });

      map.on("moveend", () => {
        const center = map.getCenter();
        setCoords({ lat: center.lat, lng: center.lng });
        reverseGeocode(center.lat, center.lng);
      });

      // Update location when map is clicked
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        map.setView([lat, lng], map.getZoom(), { animate: true });
      });

      leafletMapRef.current = map;
      setMapLoaded(true);
    };

    loadLeaflet().catch(console.error);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Perangkat ini tidak mendukung geolokasi.", {
        position: "top-right",
        autoClose: 4000,
        style: {
          backgroundColor: "#1e293b",
          color: "#ffffff",
          border: "1px solid #ef444440",
          borderRadius: "12px",
        },
      });
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const map = leafletMapRef.current;
        if (map) {
          const zoom = Math.max(map.getZoom(), 15);
          map.setView([lat, lng], zoom, { animate: true });
        } else {
          setCoords({ lat, lng });
          reverseGeocode(lat, lng);
        }
        setGettingLocation(false);
        toast.success("Lokasi saat ini diterapkan.", {
          position: "top-right",
          autoClose: 2500,
          style: {
            backgroundColor: "#1e293b",
            color: "#ffffff",
            border: "1px solid #3b82f640",
            borderRadius: "12px",
          },
        });
      },
      (err) => {
        setGettingLocation(false);
        let message = "Tidak dapat mengambil lokasi.";
        if (err.code === 1) {
          message = "Izin akses lokasi ditolak. Aktifkan di pengaturan browser Anda.";
        } else if (err.code === 2) {
          message = "Informasi lokasi tidak tersedia.";
        } else if (err.code === 3) {
          message = "Permintaan lokasi kedaluwarsa. Coba lagi.";
        }
        toast.error(message, {
          position: "top-right",
          autoClose: 4000,
          style: {
            backgroundColor: "#1e293b",
            color: "#ffffff",
            border: "1px solid #ef444440",
            borderRadius: "12px",
          },
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = () => {
    if (!lokasi.trim()) {
      toast.error("Lokasi harus diisi!", { position: "top-right", autoClose: 3000 });
      return;
    }
    setIsSubmitting(true);
    router.post(
      "/driver/towing",
      {
        lokasi: lokasi,
        latitude: coords?.lat || null,
        longitude: coords?.lng || null,
        keterangan: keterangan,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setLokasi("");
          setKeterangan("");
          setCoords(null);
          if (markerRef.current && leafletMapRef.current) {
            leafletMapRef.current.removeLayer(markerRef.current);
            markerRef.current = null;
          }
          setIsSubmitting(false);
        },
        onError: () => setIsSubmitting(false),
      }
    );
  };

  const handleCancel = (towingId) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pengajuan towing ini?")) return;
    router.post(
      "/driver/towing/cancel",
      { towing_id: towingId },
      { preserveScroll: true }
    );
  };

  const statusConfig = {
    Pending: {
      color: "#f59e0b",
      bg: "#f59e0b20",
      border: "#f59e0b40",
      label: "Menunggu",
      icon: "⏳",
    },
    Diproses: {
      color: "#6366f1",
      bg: "#6366f120",
      border: "#6366f140",
      label: "Sedang Diproses",
      icon: "🚗",
    },
    Selesai: {
      color: "#10b981",
      bg: "#10b98120",
      border: "#10b98140",
      label: "Selesai",
      icon: "✅",
    },
    Dibatalkan: {
      color: "#ef4444",
      bg: "#ef444420",
      border: "#ef444440",
      label: "Dibatalkan",
      icon: "❌",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-xl mx-auto relative z-10 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 animate-pulse pointer-events-none"></div>
          <div className="flex items-center gap-3 z-10">
            <Link
              href="/driver/dashboard"
              className="text-white hover:text-indigo-300 transition-colors bg-white/10 p-2 rounded-xl border border-white/10 hover:bg-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Request Towing</h1>
              <p className="text-indigo-300 text-xs">Pinpoint lokasi & ajukan bantuan</p>
            </div>
          </div>
          {/* Towing Icon */}
          <div className="z-10 w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-indigo-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 16H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6h4l3 3v4a1 1 0 0 1-1 1h-2M10 16h6" />
            </svg>
          </div>
        </div>

        {/* Active Towing Alert */}
        {activeTowing && (
          <div className="bg-indigo-500/20 backdrop-blur-xl border border-indigo-400/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base mb-1">Pengajuan Aktif #{activeTowing.id}</h3>
                <p className="text-indigo-200 text-sm mb-2 truncate">{activeTowing.lokasi}</p>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    color: statusConfig[activeTowing.status]?.color,
                    backgroundColor: statusConfig[activeTowing.status]?.bg,
                    borderColor: statusConfig[activeTowing.status]?.border,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: statusConfig[activeTowing.status]?.color }}></span>
                  {statusConfig[activeTowing.status]?.label}
                </div>
              </div>
            </div>

            {/* Tombol Batalkan Pengajuan - tampil hanya jika isproses = false */}
            {!activeTowing.isproses ? (
              <button
                onClick={() => handleCancel(activeTowing.id)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 hover:border-red-400/70 text-red-300 hover:text-red-200 font-semibold text-sm transition-all duration-200 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batalkan Pengajuan
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-indigo-300/60 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Tidak dapat dibatalkan — sedang diproses
              </div>
            )}

            {activeTowing.status === "Diproses" && (
              <p className="text-cyan-200/95 text-xs mt-3 pt-3 border-t border-white/10 leading-relaxed">
                Di halaman <span className="font-semibold text-white">Dashboard</span>, kendaraan Anda tampil sebagai{" "}
                <span className="font-semibold">Pengajuan Perbaikan</span>
                dengan kendala sesuai lokasi dan keterangan towing yang Anda kirim, agar tim dapat menindaklanjuti satu jalur pengajuan.
              </p>
            )}
          </div>
        )}

        {/* Map Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Pilih Lokasi di Peta
          </h2>

          {/* Map container */}
          <div className="relative rounded-2xl overflow-hidden border border-white/20 mb-4" style={{ height: "260px" }}>
            <div ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <p className="text-white text-sm">Memuat peta...</p>
                </div>
              </div>
            )}
          </div>

          {!activeTowing && (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gettingLocation}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-100 hover:text-white bg-indigo-500/25 hover:bg-indigo-500/35 border border-indigo-400/40 hover:border-indigo-300/60 rounded-xl px-4 py-3 mb-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {gettingLocation ? (
                <>
                  <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Mencari lokasi...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.344 17.677M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12h.01" />
                  </svg>
                  <span>Gunakan lokasi saat ini</span>
                </>
              )}
            </button>
          )}

          <p className="text-indigo-300 text-xs text-center mb-1">💡 Geser peta untuk mengubah titik penjemputan towing.</p>
          <p className="text-indigo-400/90 text-xs text-center">Lokasi diisi otomatis dari titik tengah peta, lalu bisa Anda edit manual.</p>
        </div>

        {/* Form Card */}
        {!activeTowing && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>

            <h2 className="text-white text-lg font-semibold mb-5 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Detail Pengajuan Towing
            </h2>

            <div className="space-y-4 mb-6">
              {/* Lokasi Field */}
              <div>
                <label className="block text-indigo-200 text-sm font-medium mb-2">
                  Alamat / Lokasi <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <textarea
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    rows="2"
                    className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 pl-10 pr-4 text-white placeholder-indigo-300/60 shadow-lg outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30 transition-all resize-none text-sm"
                    placeholder="Lokasi will be auto-filled from map, or type manually..."
                  />
                </div>
                {coords && (
                  <p className="text-indigo-400 text-xs mt-1.5 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Keterangan Field */}
              <div>
                <label className="block text-indigo-200 text-sm font-medium mb-2">
                  Keterangan Tambahan   <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows="3"
                  required
                  className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 px-4 text-white placeholder-indigo-300/60 shadow-lg outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/30 transition-all resize-none text-sm"
                  placeholder="Contoh: Ban kempis di tengah jalan tol..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !lokasi.trim()}
              className="w-full group relative bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-bold py-4 px-4 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white relative" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span className="relative">Mengirim Pengajuan...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform relative" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 16H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6h4l3 3v4a1 1 0 0 1-1 1h-2M10 16h6" />
                  </svg>
                  <span className="relative text-base">Ajukan Request Towing</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Already has active towing - disabled form overlay */}
        {activeTowing && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden opacity-60">
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl px-6 py-4 text-center border border-white/10">
                <span className="text-2xl mb-2 block">🚫</span>
                <p className="text-white font-semibold text-sm">Pengajuan sudah aktif</p>
                <p className="text-indigo-300 text-xs mt-1">Batalkan pengajuan aktif lebih dulu</p>
              </div>
            </div>
            <h2 className="text-white/50 text-lg font-semibold mb-5">Detail Pengajuan Towing</h2>
            <div className="space-y-4 mb-6">
              <div className="h-12 bg-white/10 rounded-xl"></div>
              <div className="h-20 bg-white/10 rounded-xl"></div>
            </div>
            <div className="h-14 bg-white/10 rounded-xl"></div>
          </div>
        )}

        {/* History Section */}
        <div className="space-y-4">
          <h3 className="text-white text-xl font-bold px-2 flex items-center gap-2 drop-shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History Towing
          </h3>

          {historyEmpty ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-500/20 mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-indigo-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 16H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6h4l3 3v4a1 1 0 0 1-1 1h-2M10 16h6" />
                </svg>
              </div>
              <p className="text-white text-md font-semibold">Belum ada history towing</p>
              <p className="text-indigo-200 text-sm mt-1">Pengajuan towing yang Anda buat akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyTotal > historyItems.length && (
                <p className="text-indigo-300/90 text-xs px-2">
                  Total {historyTotal} riwayat
                  {riwayatTowing?.from != null && riwayatTowing?.to != null && (
                    <span className="text-indigo-400/80"> · halaman #{riwayatTowing?.current_page ?? 1}</span>
                  )}
                </p>
              )}
              {historyItems.map((item, index) => {
                const cfg = statusConfig[item.status] || statusConfig.Pending;
                const dateObj = new Date(item.created_at);
                const formattedDate = dateObj.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={item.id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl group hover:bg-white/15 hover:-translate-y-0.5 hover:shadow-indigo-500/20 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border text-xl"
                        style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                      >
                        {cfg.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-white font-semibold text-sm">Towing #{item.id}</p>
                          <div
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                            style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: cfg.color }}></span>
                            {cfg.label}
                          </div>
                        </div>
                        <p className="text-indigo-200 text-xs truncate mb-2">{item.lokasi}</p>
                        {item.keterangan && (
                          <p className="text-blue-200/70 text-xs italic truncate mb-2">"{item.keterangan}"</p>
                        )}
                        <div className="flex items-center gap-3 text-indigo-300/70 text-xs">
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Batalkan di history: hanya jika status Pending dan isproses = false */}
                      {item.status === "Pending" && !item.isproses && (
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-400/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-all"
                          title="Batalkan Pengajuan"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {historyLinks.length > 1 && (
                <nav className="flex flex-wrap gap-2 justify-center items-center pt-4 pb-2" aria-label="Pagination riwayat towing">
                  {historyLinks.map((link, idx) =>
                    link.url ? (
                      <Link
                        key={`h-${idx}`}
                        href={link.url}
                        preserveScroll
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          link.active
                            ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/30"
                            : "border-white/15 text-white/85 hover:bg-white/10 hover:border-white/25"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ) : (
                      <span key={`hs-${idx}`} className="px-3 py-2 text-xs text-white/35" dangerouslySetInnerHTML={{ __html: link.label }} />
                    )
                  )}
                </nav>
              )}
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}
