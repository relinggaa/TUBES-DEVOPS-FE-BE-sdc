import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

// ============================================================
// Mock inertia router & usePage
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

// Lazy import setelah mock didefinisikan
const { default: LoginDriver } = await import('../../../Pages/Driver/LoginDriver');

// ============================================================
// Test Suite
// ============================================================
describe('LoginDriver Component', () => {

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('1. Merender halaman login dengan form yang benar', () => {
    render(<LoginDriver />);

    expect(screen.getByText('Sign in')).toBeDefined();
    expect(screen.getByText('Sign in to access your account')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter Username')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter Your Key')).toBeDefined();
    expect(screen.getByRole('button', { name: /login/i })).toBeDefined();
  });

  it('2. Bisa mengetik ke input username dan key', () => {
    render(<LoginDriver />);

    const usernameInput = screen.getByPlaceholderText('Enter Username');
    const keyInput = screen.getByPlaceholderText('Enter Your Key');

    fireEvent.change(usernameInput, { target: { value: 'TestDriver' } });
    fireEvent.change(keyInput, { target: { value: 'ABC12345' } });

    expect(usernameInput.value).toBe('TestDriver');
    // key di-toUpperCase() oleh komponen
    expect(keyInput.value).toBe('ABC12345');
  });

  it('3. Memanggil router.post saat form di-submit', async () => {
    render(<LoginDriver />);

    const usernameInput = screen.getByPlaceholderText('Enter Username');
    const keyInput = screen.getByPlaceholderText('Enter Your Key');

    fireEvent.change(usernameInput, { target: { value: 'Ahmad' } });
    fireEvent.change(keyInput, { target: { value: 'KEY12345' } });

    const form = document.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockRouterPost).toHaveBeenCalledTimes(1);
      expect(mockRouterPost.mock.calls[0][0]).toBe('/driver/login');
      expect(mockRouterPost.mock.calls[0][1]).toMatchObject({
        username: 'Ahmad',
        key: 'KEY12345',
      });
    });
  });

  it('4. Tombol login disable saat isLoading', async () => {
    // Simulate loading state: make router.post not call callbacks (pending)
    mockRouterPost.mockImplementation(() => {}); // never calls onSuccess/onError

    render(<LoginDriver />);

    const usernameInput = screen.getByPlaceholderText('Enter Username');
    fireEvent.change(usernameInput, { target: { value: 'Driver' } });

    const form = document.querySelector('form');
    fireEvent.submit(form);

    // Tombol login harus di-disable saat loading
    const loginBtn = screen.getByRole('button', { name: /memproses/i });
    expect(loginBtn.disabled).toBe(true);
  });

  it('5. Menampilkan tombol "Contact Admin"', () => {
    render(<LoginDriver />);
    expect(screen.getByText('Contact Admin')).toBeDefined();
  });

  it('6. Menampilkan teks "Forget Your Key?"', () => {
    render(<LoginDriver />);
    expect(screen.getByText(/Forget Your Key/i)).toBeDefined();
  });
});
