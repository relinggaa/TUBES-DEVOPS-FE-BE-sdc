import React, { useState, useEffect } from 'react';
import LayoutAdmin from '../../layout/LayoutAdmin';
import PageHeader from '../../components/admin/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { router, usePage, Link as InertiaLink } from '@inertiajs/react';
import { toast } from 'react-toastify';

const statusMeta = {
  Pending: { label: 'Pending', color: '#f59e0b' },
  Diproses: { label: 'Diproses', color: '#6366f1' },
  Selesai: { label: 'Selesai', color: '#10b981' },
  Dibatalkan: { label: 'Dibatalkan', color: '#ef4444' },
};

export default function TowingAdmin({ towings, filters }) {
  const { currentTheme } = useTheme();
  const { flash } = usePage().props;

  const [searchInput, setSearchInput] = useState(filters?.search ?? '');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setSearchInput(filters?.search ?? '');
  }, [filters?.search]);

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success, {
        position: 'top-right',
        autoClose: 3000,
        style: {
          background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
          color: '#ffffff',
        },
      });
    }
    if (flash?.error) {
      toast.error(flash.error, {
        position: 'top-right',
        autoClose: 3500,
      });
    }
  }, [flash?.success, flash?.error]);

  const applySearch = (e) => {
    e.preventDefault();
    router.get('/admin/pengajuan-towing', { search: searchInput.trim() || undefined }, { preserveScroll: true, replace: true });
  };

  const updateStatus = (towingId, action) => {
    setBusyId(towingId);
    router.post(
      '/admin/towing/update-status',
      { towing_id: towingId, action },
      {
        preserveScroll: true,
        onFinish: () => setBusyId(null),
      }
    );
  };

  const data = towings?.data ?? [];
  const links = towings?.links ?? [];

  return (
    <LayoutAdmin>
      <div className="space-y-10">
        <PageHeader currentTheme={currentTheme} title="Pengajuan Towing" subtitle="Kelola status pengajuan towing dari driver" />

        <form
          onSubmit={applySearch}
          className="flex flex-col sm:flex-row gap-3 sm:items-end"
        >
          <div className="flex-1 min-w-0">
            <label htmlFor="towing-search" className="block text-sm font-medium text-gray-400 mb-1.5">
              Cari
            </label>
            <input
              id="towing-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Lokasi, keterangan, driver, atau status..."
              className="w-full rounded-xl border bg-white/[0.07] backdrop-blur-sm px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition-all text-sm"
              style={{
                borderColor: `${currentTheme.hex.primary}40`,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = `${currentTheme.hex.primary}`;
                e.target.style.boxShadow = `0 0 0 2px ${currentTheme.hex.primary}33`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = `${currentTheme.hex.primary}40`;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl px-5 py-2.5 font-semibold text-white text-sm transition-transform active:scale-[0.98]"
              style={{
                background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                boxShadow: `0 8px 24px ${currentTheme.hex.primary}44`,
              }}
            >
              Cari
            </button>
            {filters?.search && (
              <InertiaLink
                href="/admin/pengajuan-towing"
                preserveScroll
                className="rounded-xl px-4 py-2.5 border text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                style={{ borderColor: `${currentTheme.hex.primary}40` }}
              >
                Reset
              </InertiaLink>
            )}
          </div>
        </form>

        {data.length === 0 ? (
          <div
            className="backdrop-blur-sm rounded-xl p-12 border shadow-xl text-center"
            style={{
              background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}10, ${currentTheme.hex.secondary}10)`,
              borderColor: `${currentTheme.hex.primary}30`,
            }}
          >
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-gray-400 text-lg">{filters?.search ? 'Tidak ada hasil untuk pencarian ini.' : 'Belum ada pengajuan towing.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((t, index) => {
              const cfg = statusMeta[t.status] || statusMeta.Pending;
              const driverLabel = t.driver?.username || '—';
              const createdAt = new Date(t.created_at);
              const formattedDate = createdAt.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              const formattedTime = createdAt.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const mapHref =
                t.latitude != null && t.longitude != null
                  ? `https://www.google.com/maps?q=${encodeURIComponent(`${t.latitude},${t.longitude}`)}`
                  : null;

              return (
                <div
                  key={t.id}
                  className="backdrop-blur-sm rounded-xl p-5 sm:p-6 border shadow-xl transition-all duration-300 hover:scale-[1.005]"
                  style={{
                    background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}0D, ${currentTheme.hex.secondary}10)`,
                    borderColor: `${currentTheme.hex.primary}30`,
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 gap-y-2">
                        <span className="text-white font-bold text-lg">Towing #{t.id}</span>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${cfg.color}25`,
                            color: cfg.color,
                            border: `1px solid ${cfg.color}50`,
                          }}
                        >
                          {cfg.label}
                        </span>
                        {mapHref && (
                          <a
                            href={mapHref}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-xs font-semibold underline-offset-2 hover:underline"
                            style={{ color: currentTheme.hex.secondary }}
                          >
                            Lihat maps
                          </a>
                        )}
                      </div>
                      <div className="flex items-start gap-2 text-gray-300 text-sm">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Driver: {driverLabel}</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-200 text-sm">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="leading-relaxed break-words">{t.lokasi}</span>
                      </div>
                      {t.keterangan ? (
                        <p className="text-gray-400 text-sm italic pl-6 border-l-2" style={{ borderColor: `${currentTheme.hex.primary}40` }}>
                          {t.keterangan}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>
                          {formattedDate} · {formattedTime}
                        </span>
                        {t.latitude != null && t.longitude != null && (
                          <span className="font-mono text-gray-500">
                            {Number(t.latitude).toFixed(5)}, {Number(t.longitude).toFixed(5)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col flex-wrap gap-2 shrink-0">
                      {t.status === 'Pending' && (
                        <button
                          type="button"
                          disabled={busyId === t.id}
                          onClick={() => updateStatus(t.id, 'process')}
                          className="rounded-xl px-4 py-2.5 text-white text-sm font-semibold disabled:opacity-45 transition-all active:scale-[0.98]"
                          style={{
                            background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                          }}
                        >
                          {busyId === t.id ? 'Memproses…' : '→ Diproses'}
                        </button>
                      )}
                      {t.status === 'Diproses' && (
                        <button
                          type="button"
                          disabled={busyId === t.id}
                          onClick={() => updateStatus(t.id, 'complete')}
                          className="rounded-xl px-4 py-2.5 border text-white text-sm font-semibold disabled:opacity-45 transition-all active:scale-[0.98]"
                          style={{
                            borderColor: `${currentTheme.hex.primary}60`,
                            background: `${currentTheme.hex.primary}22`,
                          }}
                        >
                          {busyId === t.id ? 'Memproses…' : '✓ Selesai'}
                        </button>
                      )}
                      {t.status === 'Selesai' && (
                        <span
                          className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 border border-white/10 inline-block text-center"
                        >
                          Selesai
                        </span>
                      )}
                      {t.status !== 'Pending' && t.status !== 'Diproses' && t.status !== 'Selesai' && (
                        <span className="text-xs text-gray-500">Status: {t.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {links.length > 1 && (
          <nav className="flex flex-wrap gap-2 justify-center items-center pt-4" aria-label="Pagination towing">
            {links.map((link, idx) =>
              link.url ? (
                <InertiaLink
                  key={`p-${idx}`}
                  href={link.url}
                  preserveScroll
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    link.active
                      ? 'text-white shadow-lg border-transparent'
                      : 'text-gray-300 border-white/10 hover:bg-white/5'
                  }`}
                  style={
                    link.active
                      ? {
                          background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                          boxShadow: `0 4px 14px ${currentTheme.hex.primary}44`,
                        }
                      : {}
                  }
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ) : (
                <span
                  key={`s-${idx}`}
                  className="px-3 py-2 text-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              )
            )}
          </nav>
        )}
      </div>
    </LayoutAdmin>
  );
}
