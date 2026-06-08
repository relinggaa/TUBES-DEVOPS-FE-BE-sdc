import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================
// Mock router dibuat di luar agar bisa diakses oleh test 3
// ============================================================
const mockRouterPost = vi.fn();
const mockRouterPut = vi.fn();

vi.mock('@inertiajs/react', () => ({
  Link: ({ children, href, className, title }) => (
    <a href={href} className={className} title={title}>
      {children}
    </a>
  ),
  usePage: () => ({
    props: {
      auth: {
        user: {
          id: 1,
          username: 'Ahmad Driver',
          gambar: null,
        }
      },
      flash: {},
    }
  }),
  router: {
    post: mockRouterPost,
    put: mockRouterPut,
  }
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

// Lazy import setelah mock didefinisikan
const { default: DashboardDriver } = await import('../../../Pages/Driver/DashboardDriver');

// Mock global
window.confirm = vi.fn(() => true);
window.URL.createObjectURL = vi.fn();

// ============================================================
// Data dummy
// ============================================================
const mockKendaraan = {
  id: 1,
  merek: 'Toyota Avanza',
  status: 'Normal',
  plat_nomor: 'B 1234 CD',
  gambar: null
};

const mockKendaraanRusak = {
  ...mockKendaraan,
  status: 'Pengajuan Perbaikan'
};

// ============================================================
// Test Suite
// ============================================================
describe('DashboardDriver Component', () => {

  // Bersihkan DOM setelah setiap test agar tidak ada sisa render
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('1. Merender dashboard dengan username yang tepat', () => {
    render(<DashboardDriver kendaraan={mockKendaraan} />);
    expect(screen.getByText('Ahmad Driver')).toBeDefined();
    expect(screen.getByText('Driver')).toBeDefined();
  });

  it('2. Merender Navigation Bar dengan semua tombol yang sesuai', () => {
    render(<DashboardDriver kendaraan={mockKendaraan} />);

    // getAllByTitle digunakan karena ada kemungkinan elemen duplikat di DOM
    expect(screen.getAllByTitle('Tanya AI').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('Towing').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('Upload Struk Bensin').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('Logout').length).toBeGreaterThan(0);
  });

  it('3. Menjalankan router.post saat tombol Logout di-klik', () => {
    render(<DashboardDriver kendaraan={mockKendaraan} />);

    const logoutBtn = screen.getAllByTitle('Logout')[0];
    fireEvent.click(logoutBtn);

    expect(window.confirm).toHaveBeenCalledWith('Apakah Anda yakin ingin logout?');
    expect(mockRouterPost).toHaveBeenCalledWith('/driver/logout');
  });

  it('4. Menampilkan informasi kendaraan dengan benar jika status Normal', () => {
    render(<DashboardDriver kendaraan={mockKendaraan} />);

    // getAllByText agar tidak crash jika ada duplikat
    expect(screen.getAllByText('Toyota Avanza').length).toBeGreaterThan(0);
    expect(screen.getAllByText('B 1234 CD').length).toBeGreaterThan(0);

    // Tombol laporan harus muncul saat status Normal
    expect(screen.getByText('Buat Laporan Kerusakan')).toBeDefined();
  });

  it('5. Menampilkan tombol yang tepat jika status Pengajuan Perbaikan', () => {
    render(<DashboardDriver kendaraan={mockKendaraanRusak} />);

    expect(screen.getAllByText('Toyota Avanza').length).toBeGreaterThan(0);

    // Tombol Batal & Update Kendala harus muncul
    expect(screen.getByText('Batalkan Pengajuan')).toBeDefined();
    expect(screen.getByText('Update Kendala')).toBeDefined();
  });

  it('6. Menampilkan "Belum ada kendaraan" ketika data kendaraan kosong', () => {
    render(<DashboardDriver kendaraan={null} />);

    expect(screen.getByText('Belum ada kendaraan')).toBeDefined();
    expect(screen.getByText('Hubungi admin untuk mendapatkan kendaraan')).toBeDefined();
  });
});
