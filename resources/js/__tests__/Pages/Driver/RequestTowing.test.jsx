import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

const mockRouterPost = vi.fn();
const mockUsePage = vi.fn(() => ({ props: { flash: {} } }));
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@inertiajs/react', () => ({
  Link: ({ children, href, className }) => (
    <a href={href} className={className}>{children}</a>
  ),
  usePage: mockUsePage,
  router: {
    post: mockRouterPost,
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

const mockMapOn = vi.fn();
const mockMapRemove = vi.fn();
const mockMapSetView = vi.fn();
const mockMapRemoveLayer = vi.fn();
const mockMarkerSetLatLng = vi.fn();

const mockMarker = {
  setLatLng: mockMarkerSetLatLng,
  addTo: () => mockMarker,
  bindPopup: () => mockMarker,
  openPopup: () => mockMarker,
};

const mockLeafletMap = {
  on: mockMapOn,
  remove: mockMapRemove,
  setView: mockMapSetView,
  removeLayer: mockMapRemoveLayer,
  getCenter: vi.fn(() => ({ lat: -6.2088, lng: 106.8456 })),
  getZoom: vi.fn(() => 13),
};

const mockRiwayat = [
  {
    id: 1,
    lokasi: 'Jl. Gatot Subroto, Jakarta',
    keterangan: 'Ban kempis',
    status: 'Selesai',
    isproses: false,
    created_at: '2026-04-20T10:30:00Z',
  },
  {
    id: 2,
    lokasi: 'Tol Jagorawi KM 15',
    keterangan: '',
    status: 'Pending',
    isproses: false,
    created_at: '2026-04-22T08:00:00Z',
  },
];

const mockActiveTowing = {
  id: 3,
  lokasi: 'Jl. MH Thamrin, Jakarta',
  status: 'Diproses',
  isproses: true,
};

beforeEach(() => {
  window.L = {
    map: vi.fn(() => mockLeafletMap),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => mockMarker),
    divIcon: vi.fn(() => ({})),
  };

  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          display_name: 'Jl. Sudirman No.1, Jakarta Pusat',
        }),
    })
  );

  mockUsePage.mockReturnValue({ props: { flash: {} } });
  window.confirm = vi.fn(() => true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const { default: RequestTowing } = await import('../../../Pages/Driver/RequestTowing');

describe('RequestTowing Component', () => {
  it('1. Merender halaman request towing', () => {
    render(<RequestTowing />);
    expect(screen.getByText('Request Towing')).toBeDefined();
    expect(screen.getByText(/geser peta untuk mengubah titik penjemputan towing/i)).toBeDefined();
  });

  it('2. Menampilkan form pengajuan saat tidak ada activeTowing', () => {
    render(<RequestTowing />);
    expect(screen.getByText('Detail Pengajuan Towing')).toBeDefined();
    expect(screen.getByRole('button', { name: /ajukan request towing/i })).toBeDefined();
  });

  it('3. Menampilkan alert aktif saat activeTowing tersedia', () => {
    render(<RequestTowing activeTowing={mockActiveTowing} />);
    expect(screen.getByText('Pengajuan Aktif #3')).toBeDefined();
    expect(screen.getByText('Sedang Diproses')).toBeDefined();
    expect(screen.queryByRole('button', { name: /ajukan request towing/i })).toBeNull();
  });

  it('4. Menampilkan riwayat towing dan statusnya', () => {
    render(<RequestTowing riwayatTowing={mockRiwayat} />);
    expect(screen.getByText('Towing #1')).toBeDefined();
    expect(screen.getByText('Towing #2')).toBeDefined();
    expect(screen.getByText('Selesai')).toBeDefined();
    expect(screen.getByText('Menunggu')).toBeDefined();
  });

  it('5. Mengisi lokasi dari reverse geocode awal peta', async () => {
    render(<RequestTowing />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jl. Sudirman No.1, Jakarta Pusat')).toBeDefined();
    });
  });

  it('6. Memanggil router.post saat submit pengajuan towing', async () => {
    render(<RequestTowing />);

    fireEvent.change(screen.getByPlaceholderText(/lokasi will be auto-filled/i), {
      target: { value: 'Jl. Sudirman No.1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ban kempis di tengah jalan tol/i), {
      target: { value: 'Ban kempis depan' },
    });

    fireEvent.click(screen.getByRole('button', { name: /ajukan request towing/i }));

    await waitFor(() => {
      expect(mockRouterPost).toHaveBeenCalledTimes(1);
      expect(mockRouterPost).toHaveBeenCalledWith(
        '/driver/towing',
        expect.objectContaining({
          lokasi: 'Jl. Sudirman No.1',
          keterangan: 'Ban kempis depan',
        }),
        expect.objectContaining({ preserveScroll: true })
      );
    });
  });

  it('7. Membatalkan request dari history saat konfirmasi true', async () => {
    render(<RequestTowing riwayatTowing={mockRiwayat} />);

    // Tombol batalkan di history item Pending menggunakan title="Batalkan Pengajuan"
    fireEvent.click(screen.getByTitle('Batalkan Pengajuan'));

    await waitFor(() => {
      expect(mockRouterPost).toHaveBeenCalledWith(
        '/driver/towing/cancel',
        { towing_id: 2 },
        expect.objectContaining({ preserveScroll: true })
      );
    });
  });

  it('8. Tidak membatalkan request saat konfirmasi false', () => {
    window.confirm = vi.fn(() => false);
    render(<RequestTowing riwayatTowing={mockRiwayat} />);

    // Tombol batalkan di history item Pending menggunakan title="Batalkan Pengajuan"
    fireEvent.click(screen.getByTitle('Batalkan Pengajuan'));

    expect(mockRouterPost).not.toHaveBeenCalled();
  });

  it('9. Menampilkan flash success dan flash error sebagai toast', async () => {
    mockUsePage.mockReturnValue({
      props: { flash: { success: 'Sukses', error: 'Gagal' } },
    });

    render(<RequestTowing />);

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Sukses', expect.any(Object));
      expect(mockToastError).toHaveBeenCalledWith('Gagal', expect.any(Object));
    });
  });

  it('10. Memproses callback moveend map untuk update lokasi', async () => {
    render(<RequestTowing />);

    const moveendHandler = mockMapOn.mock.calls.find(([eventName]) => eventName === 'moveend')?.[1];
    expect(typeof moveendHandler).toBe('function');

    moveendHandler();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(screen.getByDisplayValue('Jl. Sudirman No.1, Jakarta Pusat')).toBeDefined();
    });
  });

  it('11. Reset form saat submit sukses', async () => {
    mockRouterPost.mockImplementation((_url, _payload, options) => {
      options?.onSuccess?.();
    });

    render(<RequestTowing />);

    fireEvent.change(screen.getByPlaceholderText(/lokasi will be auto-filled/i), {
      target: { value: 'Jl. Cikini Raya' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ban kempis di tengah jalan tol/i), {
      target: { value: 'Keterangan awal' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ajukan request towing/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/lokasi will be auto-filled/i).value).toBe('');
      expect(screen.getByPlaceholderText(/ban kempis di tengah jalan tol/i).value).toBe('');
    });
  });

  it('12. Selesai loading submit saat onError dipanggil', async () => {
    mockRouterPost.mockImplementation((_url, _payload, options) => {
      options?.onError?.({ lokasi: 'error' });
    });

    render(<RequestTowing />);
    fireEvent.change(screen.getByPlaceholderText(/lokasi will be auto-filled/i), {
      target: { value: 'Jl. Asia Afrika' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ajukan request towing/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajukan request towing/i })).toBeDefined();
    });
  });

  it('13. Menampilkan tombol batalkan pada active towing status Pending', () => {
    render(<RequestTowing activeTowing={{ id: 10, lokasi: 'Depok', status: 'Pending', isproses: false }} />);
    // Tombol di active card adalah tombol penuh dengan teks "Batalkan Pengajuan"
    expect(screen.getByRole('button', { name: /batalkan pengajuan/i })).toBeDefined();
  });
});
