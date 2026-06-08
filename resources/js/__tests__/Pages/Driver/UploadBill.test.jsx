import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

// ============================================================
// Mock router & inertia - mockFlash sebagai object yang dimutasi
// ============================================================
const mockRouterPost = vi.fn();
let mockFlash = {};

vi.mock('@inertiajs/react', () => ({
  Link: ({ children, href, className, title }) => (
    <a href={href} className={className} title={title}>
      {children}
    </a>
  ),
  usePage: () => ({
    props: {
      flash: mockFlash,
    }
  }),
  router: {
    post: mockRouterPost,
  }
}));

// Mock react-toastify - gunakan vi.fn() langsung di dalam factory (TIDAK boleh referensi variabel luar)
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

// Import toast SETELAH vi.mock agar mendapat versi yang sudah di-mock
import { toast } from 'react-toastify';

// Global Window mocks for object URL
window.URL.createObjectURL = vi.fn(() => 'blob:dummy-url');
window.URL.revokeObjectURL = vi.fn();

// Import komponen setelah semua mock didefinisikan
const { default: UploadBill } = await import('../../../Pages/Driver/UploadBill');

// ============================================================
// Dummy Data
// ============================================================
const mockRiwayatStruk = [
  {
    id: 1,
    gambar: 'struk_bensin/dummy1.jpg',
    bank: 'BCA',
    no_rekening: '111',
    is_accept: null,
    created_at: '2026-04-24T10:00:00Z',
  },
  {
    id: 2,
    gambar: 'struk_bensin/dummy2.jpg',
    bank: 'GOPAY',
    no_rekening: '08123456789',
    is_accept: true,
    created_at: '2026-04-23T08:30:00Z',
  },
];

// Helper: pilih file di input
async function selectFile(filename = 'struk.png', type = 'image/png') {
  const file = new File(['dummy content'], filename, { type });
  const inputEl = document.querySelector('input[type="file"]');
  fireEvent.change(inputEl, { target: { files: [file] } });
  await waitFor(() => screen.getByAltText('Preview Struk'));
  return file;
}

function fillNoRekening(value = '1234567890') {
  const input = document.getElementById('upload-no-rekening');
  fireEvent.change(input, { target: { value } });
}

// ============================================================
// Test Suite
// ============================================================
describe('UploadBill Component', () => {

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockFlash = {};
  });

  // ---- Render & UI ----

  it('1. Merender halaman UploadBill dengan benar', () => {
    render(<UploadBill riwayatStruk={[]} />);

    expect(screen.getAllByText('Upload Struk Bensin').length).toBeGreaterThan(0);
    expect(screen.getByText('Daftarkan Struk Baru')).toBeDefined();
    expect(screen.getByText('Click to upload')).toBeDefined();
    const uploadBtn = screen.getByRole('button', { name: /upload struk bensin/i });
    expect(uploadBtn.disabled).toBe(true);
  });

  it('2. Menampilkan "Belum ada history" ketika riwayatStruk kosong', () => {
    render(<UploadBill riwayatStruk={[]} />);

    expect(screen.getByText('Belum ada history')).toBeDefined();
    expect(screen.getByText('Struk yang diupload akan muncul di sini')).toBeDefined();
  });

  it('3. Menampilkan riwayat struk jika riwayatStruk tidak kosong', () => {
    render(<UploadBill riwayatStruk={mockRiwayatStruk} />);

    expect(screen.queryByText('Belum ada history')).toBeNull();
    expect(screen.getByText('Struk #1')).toBeDefined();
    expect(screen.getByText('Struk #2')).toBeDefined();
  });

  it('4. Memunculkan file preview setelah input file; tombol upload aktif jika no rekening diisi', async () => {
    render(<UploadBill riwayatStruk={[]} />);

    await selectFile();

    const imgPreview = screen.getByAltText('Preview Struk');
    expect(imgPreview).toBeDefined();
    expect(imgPreview.src).toContain('blob:dummy-url');

    let uploadBtn = screen.getByRole('button', { name: /upload struk bensin/i });
    expect(uploadBtn.disabled).toBe(true);

    fillNoRekening('9876543210');
    uploadBtn = screen.getByRole('button', { name: /upload struk bensin/i });
    expect(uploadBtn.disabled).toBe(false);
  });

  it('5. Tombol hapus preview (X) menghapus preview dan menonaktifkan tombol upload', async () => {
    render(<UploadBill riwayatStruk={[]} />);

    await selectFile();
    fillNoRekening();

    // Tombol X berwarna merah ada di area preview
    const removePreviewBtn = document.querySelector('button.bg-red-500\\/80');
    expect(removePreviewBtn).not.toBeNull();
    fireEvent.click(removePreviewBtn);

    await waitFor(() => {
      expect(screen.queryByAltText('Preview Struk')).toBeNull();
      const uploadBtn = screen.getByRole('button', { name: /upload struk bensin/i });
      expect(uploadBtn.disabled).toBe(true);
    });
  });

  it('6. Menjalankan router.post saat tombol Upload diklik dengan file valid', async () => {
    render(<UploadBill riwayatStruk={[]} />);

    const file = await selectFile();
    fillNoRekening('5550011');
    const uploadBtn = screen.getByRole('button', { name: /upload struk bensin/i });
    fireEvent.click(uploadBtn);

    expect(mockRouterPost).toHaveBeenCalledTimes(1);
    expect(mockRouterPost.mock.calls[0][0]).toBe('/driver/struk-bensin');

    const formDataSent = mockRouterPost.mock.calls[0][1];
    expect(formDataSent instanceof FormData).toBe(true);
    expect(formDataSent.get('gambar')).toBe(file);
    expect(formDataSent.get('bank')).toBe('BRI');
    expect(formDataSent.get('no_rekening')).toBe('5550011');
  });

  it('7. onSuccess callback mereset selectedFile dan preview', async () => {
    mockRouterPost.mockImplementation((url, data, options) => {
      options?.onSuccess?.();
    });

    render(<UploadBill riwayatStruk={[]} />);
    await selectFile();
    fillNoRekening();

    const uploadBtn = screen.getByRole('button', { name: /upload struk bensin/i });
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(screen.queryByAltText('Preview Struk')).toBeNull();
      expect(screen.getByText('Click to upload')).toBeDefined();
    });
  });

  it('8. onError callback memanggil toast.error', async () => {
    mockRouterPost.mockImplementation((url, data, options) => {
      options?.onError?.({ gambar: 'File terlalu besar' });
    });

    render(<UploadBill riwayatStruk={[]} />);
    await selectFile();
    fillNoRekening();

    const uploadBtn = screen.getByRole('button', { name: /upload struk bensin/i });
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });

  it('9. Menampilkan toast.success ketika flash.success ada', async () => {
    mockFlash = { success: 'Struk berhasil diupload!' };

    render(<UploadBill riwayatStruk={[]} />);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Struk berhasil diupload!',
        expect.objectContaining({ position: 'top-right' })
      );
    });
  });

  it('10. Menampilkan toast.error ketika flash.error ada', async () => {
    mockFlash = { error: 'Upload gagal!' };

    render(<UploadBill riwayatStruk={[]} />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Upload gagal!',
        expect.objectContaining({ position: 'top-right' })
      );
    });
  });

  it('11. Link "back" ke dashboard tersedia', () => {
    render(<UploadBill riwayatStruk={[]} />);
    const backLink = document.querySelector('a[href="/driver/dashboard"]');
    expect(backLink).not.toBeNull();
  });
});
