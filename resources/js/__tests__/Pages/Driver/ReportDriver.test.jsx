import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

// ============================================================
// Mock inertia
// ============================================================
const mockRouterPost = vi.fn();

vi.mock('@inertiajs/react', () => ({
  Link: ({ children, href, className }) => (
    <a href={href} className={className}>{children}</a>
  ),
  usePage: () => ({
    props: { flash: {} }
  }),
  router: {
    post: mockRouterPost,
  }
}));

// Mock react-toastify
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('react-toastify', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  }
}));

// Lazy import setelah mock
const { default: ReportDriver } = await import('../../../Pages/Driver/ReportDriver');

// ============================================================
// Dummy Data
// ============================================================
const mockKendaraan = {
  id: 1,
  merek: 'Toyota Avanza',
  plat_nomor: 'B 1234 CD',
};

// ============================================================
// Test Suite
// ============================================================
describe('ReportDriver Component', () => {

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('1. Merender halaman report dengan form kendaraan yang terisi', () => {
    render(<ReportDriver kendaraan={mockKendaraan} />);

    // Input merek dan plat harus terisi dari props kendaraan
    expect(screen.getByDisplayValue('Toyota Avanza')).toBeDefined();
    expect(screen.getByDisplayValue('B 1234 CD')).toBeDefined();
    // Tombol Tambah Kendala harus muncul
    expect(screen.getByText('Tambah Kendala')).toBeDefined();
  });

  it('2. Merender form kosong jika kendaraan null', () => {
    render(<ReportDriver kendaraan={null} />);

    const merekInput = screen.getByPlaceholderText('Merek kendaraan');
    const platInput = screen.getByPlaceholderText('Plat nomor');

    expect(merekInput.value).toBe('');
    expect(platInput.value).toBe('');
  });

  it('3. Membuka modal Tambah Kendala saat tombol diklik', async () => {
    render(<ReportDriver kendaraan={mockKendaraan} />);

    const tambahBtn = screen.getByText('Tambah Kendala');
    fireEvent.click(tambahBtn);

    await waitFor(() => {
      expect(screen.getByText('Tambah Kendala Baru')).toBeDefined();
    });
  });

  it('4. Menutup modal saat tombol Batal di dalam modal diklik', async () => {
    render(<ReportDriver kendaraan={mockKendaraan} />);

    // Buka modal
    fireEvent.click(screen.getByText('Tambah Kendala'));
    await waitFor(() => {
      expect(screen.getByText('Tambah Kendala Baru')).toBeDefined();
    });

    // Tutup modal
    const batalBtn = screen.getByRole('button', { name: /batal/i });
    fireEvent.click(batalBtn);

    await waitFor(() => {
      expect(screen.queryByText('Tambah Kendala Baru')).toBeNull();
    });
  });

  it('5. Menambahkan kendala ke list setelah mengisi form modal', async () => {
    render(<ReportDriver kendaraan={mockKendaraan} />);

    // Buka modal
    fireEvent.click(screen.getByText('Tambah Kendala'));
    await waitFor(() => {
      expect(screen.getByText('Tambah Kendala Baru')).toBeDefined();
    });

    // Isi form kendala
    const namaInput = screen.getByPlaceholderText('Contoh: Kendala 3');
    const deskInput = screen.getByPlaceholderText('Deskripsi kendala...');

    fireEvent.change(namaInput, { target: { value: 'Ban Bocor' } });
    fireEvent.change(deskInput, { target: { value: 'Ban depan kiri kempes' } });

    // Klik Tambah
    const tambahModalBtn = screen.getByRole('button', { name: /^tambah$/i });
    fireEvent.click(tambahModalBtn);

    await waitFor(() => {
      expect(screen.getByText('Ban Bocor')).toBeDefined();
      expect(screen.getByText('Ban depan kiri kempes')).toBeDefined();
    });
  });

  it('6. Tombol Kirim Laporan aktif setelah ada kendala', async () => {
    render(<ReportDriver kendaraan={mockKendaraan} />);

    // Tambah satu kendala dulu
    fireEvent.click(screen.getByText('Tambah Kendala'));
    await waitFor(() => screen.getByText('Tambah Kendala Baru'));

    fireEvent.change(screen.getByPlaceholderText('Contoh: Kendala 3'), {
      target: { value: 'Rem Blong' }
    });
    fireEvent.change(screen.getByPlaceholderText('Deskripsi kendala...'), {
      target: { value: 'Rem tidak berfungsi' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^tambah$/i }));

    await waitFor(() => {
      const kirimBtn = screen.getByRole('button', { name: /kirim laporan/i });
      expect(kirimBtn.disabled).toBe(false);
    });
  });

  it('7. Memanggil router.post saat Kirim Laporan ditekan', async () => {
    render(<ReportDriver kendaraan={mockKendaraan} />);

    // Tambah satu kendala
    fireEvent.click(screen.getByText('Tambah Kendala'));
    await waitFor(() => screen.getByText('Tambah Kendala Baru'));

    fireEvent.change(screen.getByPlaceholderText('Contoh: Kendala 3'), {
      target: { value: 'Mesin Panasn' }
    });
    fireEvent.change(screen.getByPlaceholderText('Deskripsi kendala...'), {
      target: { value: 'Suhu mesin overheat' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^tambah$/i }));

    await waitFor(() => screen.getByText('Mesin Panasn'));

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /kirim laporan/i }));

    await waitFor(() => {
      expect(mockRouterPost).toHaveBeenCalledTimes(1);
      expect(mockRouterPost.mock.calls[0][0]).toBe('/driver/report');
    });
  });
});
