import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';

const NavbarAdmin = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pengajuanMenuOpen, setPengajuanMenuOpen] = useState(false);
    const [mobilePengajuanOpen, setMobilePengajuanOpen] = useState(false);
    const [laporanMenuOpen, setLaporanMenuOpen] = useState(false);
    const [mobileLaporanOpen, setMobileLaporanOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    // Logo states
    const [showLogoModal, setShowLogoModal] = useState(false);
    const [selectedLogoFile, setSelectedLogoFile] = useState(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const { url, props } = usePage();
    const { themeColor, changeTheme, currentTheme, themeConfig } = useTheme();
    const appLogo = props?.appLogo || null;
    const appName = props?.appName || 'Sagara Daily Checkup';
    const dropdownRef = useRef(null);
    const userMenuButtonRef = useRef(null);
    const pengajuanDropdownRef = useRef(null);
    const laporanDropdownRef = useRef(null);


    useEffect(() => {
        if (!isUserMenuOpen) return;

        const handleClickOutside = (event) => {

            const isClickInsideDropdown = dropdownRef.current?.contains(event.target);
            const isClickOnUserButton = userMenuButtonRef.current?.contains(event.target);
            

            if (!isClickInsideDropdown && !isClickOnUserButton) {
                setIsUserMenuOpen(false);
                setIsSettingsOpen(false);
            }
        };

    
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    useEffect(() => {
        if (!pengajuanMenuOpen) return;

        const handleClickOutside = (event) => {
            if (!pengajuanDropdownRef.current?.contains(event.target)) {
                setPengajuanMenuOpen(false);
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [pengajuanMenuOpen]);

    useEffect(() => {
        if (!laporanMenuOpen) return;

        const handleClickOutside = (event) => {
            if (!laporanDropdownRef.current?.contains(event.target)) {
                setLaporanMenuOpen(false);
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [laporanMenuOpen]);
   
    const user = props?.auth?.user || props?.user || (props && Object.keys(props).length > 0 ? props : null);
    

    const displayUser = user || {
        name: 'Admin',
        username: 'admin',
        email: 'admin@sagara.com'
    };

    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            router.post('/admin/logout');
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

        router.post('/admin/update-gambar', formData, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setShowImageModal(false);
                setSelectedFile(null);
                setPreviewUrl(null);
            },
            onError: (errors) => {
                console.error('Error uploading image:', errors);
                toast.error('Gagal mengupload gambar. Pastikan file adalah gambar dan ukurannya tidak lebih dari 2MB.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                });
            }
        });
    };

    // --- Logo handlers ---
    const handleLogoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedLogoFile(file);
            setLogoPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleLogoUpload = () => {
        if (!selectedLogoFile) return;
        setIsUploadingLogo(true);
        const formData = new FormData();
        formData.append('logo', selectedLogoFile);

        router.post('/admin/update-logo', formData, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setShowLogoModal(false);
                setSelectedLogoFile(null);
                setLogoPreviewUrl(null);
                setIsUploadingLogo(false);
                toast.success('Logo berhasil diupdate!', { position: 'top-right', autoClose: 3000, hideProgressBar: true });
            },
            onError: (errors) => {
                setIsUploadingLogo(false);
                toast.error('Gagal mengupload logo. Pastikan file adalah gambar (maks. 2MB).', {
                    position: 'top-right', autoClose: 5000, hideProgressBar: true,
                });
            }
        });
    };

    const handleLogoReset = () => {
        if (!confirm('Reset logo ke default (icon bawaan)?')) return;
        router.post('/admin/reset-logo', {}, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setShowLogoModal(false);
                toast.success('Logo berhasil direset!', { position: 'top-right', autoClose: 3000, hideProgressBar: true });
            }
        });
    };

    const menuItems = [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Generate Key', href: '/admin/generate-key' },
        { name: 'Kendaraan', href: '/admin/kendaraan' },
        {
            name: 'Pengajuan',
            children: [
                { name: 'Pengajuan Perbaikan', href: '/admin/pengajuan-perbaikan' },
                { name: 'Pengajuan Towing', href: '/admin/pengajuan-towing' },
            ],
        },
        {
            name: 'Laporan Biaya',
            dropdownKey: 'laporan',
            children: [
                { name: 'Biaya Servis', href: '/admin/laporan-biaya' },
                { name: 'Biaya Bensin', href: '/admin/laporan-bensin' },
            ],
        },
    ];

    const isActive = (path) => {
        if (path === '/') {
            return url === '/';
        }
        return url.startsWith(path);
    };

    const isNavItemActive = (item) => {
        if (item.href) {
            return isActive(item.href);
        }
        if (item.children) {
            return item.children.some((c) => isActive(c.href));
        }
        return false;
    };

    // Menggunakan class mappings dari ThemeContext
    const themeColors = currentTheme.classes?.navbar || {
        bg: 'purple-500',
        border: 'purple-500',
        text: 'purple-300',
        glow: 'purple-500',
        gradient: 'from-purple-500 to-purple-600',
    };
    const glowColor = currentTheme.hex.glow;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 py-4">
  
            <div className="absolute inset-0 -z-10">
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-${themeColors.bg}/20 blur-3xl animate-pulse`}></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
                <div className={`bg-[#1E1730]/90 backdrop-blur-xl rounded-full px-6 py-3 flex justify-between items-center border border-${themeColors.border}/20 shadow-2xl shadow-${themeColors.glow}/10 hover:shadow-${themeColors.glow}/20 transition-all duration-300 relative`} style={{ overflow: 'visible' }}>
        
                    <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
                        {/* Logo area - klik untuk ganti logo */}
                        <div
                            onClick={(e) => { e.preventDefault(); setShowLogoModal(true); }}
                            title="Klik untuk ganti logo"
                            className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-${themeColors.bg}/20 to-${themeColors.bg}/30 group-hover:from-${themeColors.bg}/30 group-hover:to-${themeColors.bg}/40 transition-all duration-300 group-hover:scale-110 cursor-pointer overflow-hidden relative`}
                            style={{ border: `1px solid ${currentTheme.hex.primary}30` }}
                        >
                            {appLogo ? (
                                <img
                                    src={`/storage/${appLogo}`}
                                    alt="Logo"
                                    className="w-full h-full object-contain p-0.5"
                                />
                            ) : (
                                <svg
                                    className="w-6 h-6 text-white drop-shadow-lg transition-all duration-300"
                                    style={{ filter: `drop-shadow(0 0 8px ${currentTheme.hex.primary}80)` }}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            )}
                            {/* Edit overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                        </div>
                        <span className={`text-white text-lg font-semibold bg-gradient-to-r from-white to-${themeColors.text} bg-clip-text text-transparent group-hover:from-${themeColors.text} group-hover:to-white transition-all duration-300`}>
                            {appName}
                        </span>
                    </Link>

            
                    <div className="hidden md:flex md:items-center md:space-x-2">
                        {menuItems.map((item) => {
                            if (item.children) {
                                const submenuActive = item.children.some((c) => isActive(c.href));
                                const isPengajuan = item.dropdownKey !== 'laporan';
                                const isLaporan = item.dropdownKey === 'laporan';
                                const menuOpen = isLaporan ? laporanMenuOpen : pengajuanMenuOpen;
                                const setMenuOpen = isLaporan ? setLaporanMenuOpen : setPengajuanMenuOpen;
                                const dropRef = isLaporan ? laporanDropdownRef : pengajuanDropdownRef;

                                return (
                                    <div key={item.name} className="relative" ref={dropRef}>
                                        <button
                                            type="button"
                                            aria-expanded={menuOpen}
                                            aria-haspopup="true"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setMenuOpen((o) => !o);
                                                if (isLaporan) setPengajuanMenuOpen(false);
                                                else setLaporanMenuOpen(false);
                                            }}
                                            className={`relative flex items-center gap-1 text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full group ${
                                                submenuActive || menuOpen
                                                    ? `bg-gradient-to-r ${currentTheme.colors.button} text-white shadow-lg shadow-${themeColors.glow}/20`
                                                    : 'text-white/80 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <span>{item.name}</span>
                                            <svg
                                                className={`w-4 h-4 transition-transform shrink-0 ${menuOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            {submenuActive && !menuOpen && (
                                                <span className={`absolute inset-0 rounded-full bg-gradient-to-r from-${themeColors.bg}/20 to-transparent blur-xl -z-10`}></span>
                                            )}
                                        </button>
                                        {menuOpen && (
                                            <div
                                                className="absolute left-0 top-full mt-2 min-w-[15rem] bg-[#1E1730]/95 backdrop-blur-xl rounded-2xl py-2 z-[60]"
                                                style={{
                                                    borderColor: `${currentTheme.hex.primary}33`,
                                                    boxShadow: `0 20px 40px -12px ${currentTheme.hex.primary}44`,
                                                    borderWidth: '1px',
                                                    borderStyle: 'solid',
                                                }}
                                                role="menu"
                                            >
                                                {item.children.map((sub) => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        role="menuitem"
                                                        className={`block px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
                                                            isActive(sub.href)
                                                                ? 'text-white shadow-md'
                                                                : 'text-white/85 hover:bg-white/[0.07] hover:text-white'
                                                        }`}
                                                        style={
                                                            isActive(sub.href)
                                                                ? {
                                                                      background: `linear-gradient(to right, ${currentTheme.hex.primary}35, ${currentTheme.hex.secondary}25)`,
                                                                  }
                                                                : {}
                                                        }
                                                        onClick={() => setMenuOpen(false)}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full group ${
                                        isNavItemActive(item)
                                            ? `bg-gradient-to-r ${currentTheme.colors.button} text-white shadow-lg shadow-${themeColors.glow}/20`
                                            : 'text-white/80 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {item.name}
                                    {isNavItemActive(item) && (
                                        <span className={`absolute inset-0 rounded-full bg-gradient-to-r from-${themeColors.bg}/20 to-transparent blur-xl -z-10`}></span>
                                    )}
                                </Link>
                            );
                        })}
                        
           
                        <div className={`relative ml-4 pl-4 border-l border-${themeColors.border}/20`} style={{ position: 'relative', zIndex: 100 }}>
                            <button
                                ref={userMenuButtonRef}
                                data-user-menu-button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsUserMenuOpen(!isUserMenuOpen);
                                }}
                                className="flex items-center space-x-2 group"
                                style={{ position: 'relative', zIndex: 60, pointerEvents: 'auto', cursor: 'pointer' }}
                            >
                                <div className="relative">
                                    {user?.gambar && user.gambar.startsWith('users/') ? (
                                        <div 
                                            onClick={() => setShowImageModal(true)}
                                            className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 shadow-lg shadow-${themeColors.glow}/50 group-hover:shadow-${themeColors.glow}/70 transition-all duration-300 group-hover:scale-110 cursor-pointer"
                                            style={{ 
                                                boxShadow: `0 4px 12px ${currentTheme.hex.primary}50`,
                                                borderColor: `${currentTheme.hex.primary}50`
                                            }}
                                        >
                                            <img 
                                                src={`/storage/${user.gambar}`} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => setShowImageModal(true)}
                                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${currentTheme.colors.gradient || `from-${themeColors.bg} via-${themeColors.bg} to-${themeColors.bg}`} flex items-center justify-center shadow-lg shadow-${themeColors.glow}/50 group-hover:shadow-${themeColors.glow}/70 transition-all duration-300 group-hover:scale-110 cursor-pointer`} 
                                            style={{ background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})` }}
                                        >
                                            <span className="text-white text-xs font-bold">
                                                {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : (displayUser.username ? displayUser.username.charAt(0).toUpperCase() : 'A')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E1730] animate-pulse"></div>
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-white text-sm font-medium">
                                        {displayUser.name || displayUser.username || 'Admin'}
                                    </p>
                                    <p className="text-xs" style={{ color: `${currentTheme.hex.secondary}B3` }}>Online</p>
                                </div>
                                <svg className={`w-4 h-4 text-white/70 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                   
                            {isUserMenuOpen && (
                                <div 
                                    ref={dropdownRef}
                                    data-dropdown-menu
                                    className="absolute right-0 mt-3 w-56 bg-[#1E1730]/95 backdrop-blur-xl rounded-2xl overflow-visible animate-in fade-in slide-in-from-top-2 duration-200"
                                    style={{ 
                                        zIndex: 100, 
                                        position: 'absolute',
                                        top: 'calc(100% + 0.75rem)',
                                        right: 0,
                                        pointerEvents: 'auto',
                                        width: '14rem',
                                        maxWidth: '14rem',
                                        borderColor: `${currentTheme.hex.primary}33`,
                                        boxShadow: `0 25px 50px -12px ${currentTheme.hex.primary}33`
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <div className={`p-4 border-b border-${themeColors.border}/20`}>
                                        <div className="flex items-center space-x-3">
                                            {user?.gambar && user.gambar.startsWith('users/') ? (
                                                <div 
                                                    onClick={() => setShowImageModal(true)}
                                                    className="w-12 h-12 rounded-full overflow-hidden border-2 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                                                    style={{ 
                                                        borderColor: `${currentTheme.hex.primary}50`,
                                                        boxShadow: `0 4px 12px ${currentTheme.hex.primary}50`
                                                    }}
                                                >
                                                    <img 
                                                        src={`/storage/${user.gambar}`} 
                                                        alt="Profile" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div 
                                                    onClick={() => setShowImageModal(true)}
                                                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform" 
                                                    style={{ background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})` }}
                                                >
                                                    <span className="text-white text-sm font-bold">
                                                        {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : (displayUser.username ? displayUser.username.charAt(0).toUpperCase() : 'A')}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-semibold truncate">
                                                    {displayUser.name || displayUser.username || 'Admin'}
                                                </p>
                                                <p className="text-xs truncate" style={{ color: `${currentTheme.hex.secondary}B3` }}>
                                                    {displayUser.email || 'admin@sagara.com'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowImageModal(true);
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 flex items-center space-x-2 group"
                                            style={{ position: 'relative', zIndex: 101, pointerEvents: 'auto', cursor: 'pointer' }}
                                        >
                                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Ganti Foto Profil</span>
                                        </button>
                                        {/* Tombol Ganti Logo */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowLogoModal(true);
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 flex items-center space-x-2 group"
                                            style={{ position: 'relative', zIndex: 101, pointerEvents: 'auto', cursor: 'pointer' }}
                                        >
                                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Ganti Logo Aplikasi</span>
                                        </button>
                                        <div className="relative" style={{ zIndex: 101, position: 'relative', overflow: 'visible' }}>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('Settings clicked', isSettingsOpen);
                                                    setIsSettingsOpen(prev => !prev);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 flex items-center justify-between group"
                                                style={{ 
                                                    zIndex: 101, 
                                                    position: 'relative', 
                                                    pointerEvents: 'auto',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>Settings</span>
                                                </div>
                                                <svg className={`w-4 h-4 transition-transform duration-200 ${isSettingsOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                            
                                       
                                            {isSettingsOpen && (
                                                <div 
                                                    className="bg-[#1E1730]/95 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden"
                                                    style={{ 
                                                        zIndex: 102, 
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: '100%',
                                                        width: '12rem',
                                                        minWidth: '12rem',
                                                        marginRight: '0.5rem',
                                                        pointerEvents: 'auto',
                                                        borderColor: `${currentTheme.hex.primary}33`
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                >
                                                    <div className="p-2">
                                                        <p className="px-3 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">Pilih Warna</p>
                                                        <div className="space-y-1">
                                                            {Object.entries(themeConfig).map(([color, config]) => (
                                                                <button
                                                                    type="button"
                                                                    key={color}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        changeTheme(color);
                                                                        setIsSettingsOpen(false);
                                                                    }}
                                                                    className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all duration-200 flex items-center space-x-3 group ${
                                                                        themeColor === color
                                                                            ? `bg-gradient-to-r ${config.colors.button} text-white shadow-lg`
                                                                            : 'text-white/80 hover:text-white hover:bg-white/5'
                                                                    }`}
                                                                    style={{ position: 'relative', zIndex: 103, pointerEvents: 'auto', cursor: 'pointer' }}
                                                                >
                                                                    <div 
                                                                        className={`w-5 h-5 rounded-full border-2 ${
                                                                            themeColor === color 
                                                                                ? 'border-white shadow-lg' 
                                                                                : 'border-white/30 group-hover:border-white/50'
                                                                        }`}
                                                                        style={{ backgroundColor: config.hex.primary }}
                                                                    ></div>
                                                                    <span>{config.name}</span>
                                                                    {themeColor === color && (
                                                                        <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="my-1 border-t" style={{ borderColor: `${currentTheme.hex.primary}33` }}></div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleLogout();
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 group"
                                            style={{ 
                                                position: 'relative', 
                                                zIndex: 101, 
                                                pointerEvents: 'auto', 
                                                cursor: 'pointer',
                                                color: currentTheme.hex.secondary
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = currentTheme.hex.primary;
                                                e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}1A`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = currentTheme.hex.secondary;
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white focus:outline-none transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className={`md:hidden mt-4 mx-4 bg-[#1E1730]/95 backdrop-blur-xl rounded-2xl px-4 py-3 border border-${themeColors.border}/20 shadow-2xl animate-in slide-in-from-top-2 duration-300 relative z-40`}>
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            if (item.children) {
                                const submenuActive = item.children.some((c) => isActive(c.href));
                                const isLaporan = item.dropdownKey === 'laporan';
                                const mobileOpen = isLaporan ? mobileLaporanOpen : mobilePengajuanOpen;
                                const setMobileOpen = isLaporan ? setMobileLaporanOpen : setMobilePengajuanOpen;

                                return (
                                    <div key={item.name}>
                                        <button
                                            type="button"
                                            onClick={() => setMobileOpen((o) => !o)}
                                            className={`w-full flex items-center justify-between text-base font-medium transition-all duration-200 rounded-lg ${
                                                submenuActive
                                                    ? `bg-gradient-to-r ${currentTheme.colors.button} text-white px-4 py-3 shadow-lg shadow-${themeColors.glow}/20`
                                                    : 'text-white/90 hover:bg-white/5 px-4 py-3 text-left'
                                            }`}
                                        >
                                            <span>{item.name}</span>
                                            <svg
                                                className={`w-5 h-5 shrink-0 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {mobileOpen && (
                                            <div
                                                className="ml-4 pl-4 py-2 space-y-1 border-l mt-1"
                                                style={{ borderColor: `${currentTheme.hex.primary}55` }}
                                            >
                                                {item.children.map((sub) => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(false);
                                                            setMobileOpen(false);
                                                        }}
                                                        className={`block text-sm font-medium transition-all rounded-lg px-4 py-2.5 ${
                                                            isActive(sub.href)
                                                                ? `bg-gradient-to-r ${currentTheme.colors.button} text-white shadow-md`
                                                                : 'text-white/85 hover:bg-white/[0.07]'
                                                        }`}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block text-base font-medium transition-all duration-200 rounded-lg ${
                                        isNavItemActive(item)
                                            ? `bg-gradient-to-r ${currentTheme.colors.button} text-white px-4 py-3 shadow-lg shadow-${themeColors.glow}/20`
                                            : 'text-white/80 hover:text-white hover:bg-white/5 px-4 py-3'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        
                        {/* User Info & Logout - Mobile */}
                        <div className={`pt-4 mt-4 border-t border-${themeColors.border}/20 space-y-2`}>
                            <div className={`flex items-center space-x-3 px-4 py-3 bg-${themeColors.bg}/10 rounded-lg`}>
                                <div className="relative">
                                    {user?.gambar && user.gambar.startsWith('users/') ? (
                                        <div 
                                            onClick={() => setShowImageModal(true)}
                                            className="w-12 h-12 rounded-full overflow-hidden border-2 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                                            style={{ 
                                                borderColor: `${currentTheme.hex.primary}50`,
                                                boxShadow: `0 4px 12px ${currentTheme.hex.primary}50`
                                            }}
                                        >
                                            <img 
                                                src={`/storage/${user.gambar}`} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => setShowImageModal(true)}
                                            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform" 
                                            style={{ background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})` }}
                                        >
                                            <span className="text-white text-sm font-bold">
                                                {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : (displayUser.username ? displayUser.username.charAt(0).toUpperCase() : 'A')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E1730]"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-semibold">
                                        {displayUser.name || displayUser.username || 'Admin'}
                                    </p>
                                    <p className="text-xs" style={{ color: `${currentTheme.hex.secondary}B3` }}>
                                        {displayUser.email || 'admin@sagara.com'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}CC, ${currentTheme.hex.secondary}CC)`,
                                    boxShadow: `0 10px 15px -3px ${currentTheme.hex.primary}33`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`;
                                    e.currentTarget.style.boxShadow = `0 10px 15px -3px ${currentTheme.hex.primary}4D`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(to right, ${currentTheme.hex.primary}CC, ${currentTheme.hex.secondary}CC)`;
                                    e.currentTarget.style.boxShadow = `0 10px 15px -3px ${currentTheme.hex.primary}33`;
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Profile Photo Upload */}
            {showImageModal && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => {
                        setShowImageModal(false);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                    }}
                >
                    <div 
                        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full border shadow-2xl"
                        style={{
                            borderColor: `${currentTheme.hex.primary}40`,
                            boxShadow: `0 25px 50px -12px ${currentTheme.hex.primary}30`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowImageModal(false);
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
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 shadow-xl" style={{ borderColor: `${currentTheme.hex.primary}40` }}>
                                <img
                                    src={previewUrl || (user?.gambar && user.gambar.startsWith('users/') ? `/storage/${user.gambar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.username || 'Admin')}&background=${currentTheme.hex.primary.replace('#', '')}&color=fff&size=128`)}
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
                                <div className="w-full bg-white/10 backdrop-blur-md border rounded-2xl p-4 text-center cursor-pointer hover:bg-white/15 transition-all" style={{ borderColor: `${currentTheme.hex.primary}40` }}>
                                    <svg className="w-8 h-8 mx-auto mb-2" style={{ color: currentTheme.hex.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    setShowImageModal(false);
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="flex-1 bg-white/10 backdrop-blur-md border text-white font-semibold py-3 rounded-full hover:bg-white/15 transition-all"
                                style={{ borderColor: `${currentTheme.hex.primary}40` }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile}
                                className="flex-1 text-white font-bold py-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                    boxShadow: `0 10px 25px -5px ${currentTheme.hex.primary}40`
                                }}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ganti Logo */}
            {showLogoModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => {
                        setShowLogoModal(false);
                        setSelectedLogoFile(null);
                        setLogoPreviewUrl(null);
                    }}
                >
                    <div
                        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full border shadow-2xl"
                        style={{
                            borderColor: `${currentTheme.hex.primary}40`,
                            boxShadow: `0 25px 50px -12px ${currentTheme.hex.primary}40`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={() => {
                                setShowLogoModal(false);
                                setSelectedLogoFile(null);
                                setLogoPreviewUrl(null);
                            }}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-white text-2xl font-bold mb-2">Ganti Logo Aplikasi</h3>
                        <p className="text-white/50 text-sm mb-6">Logo akan tampil di navbar dan seluruh halaman admin</p>

                        {/* Preview Logo */}
                        <div className="flex justify-center mb-6">
                            <div
                                className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 flex items-center justify-center shadow-xl"
                                style={{
                                    borderColor: `${currentTheme.hex.primary}40`,
                                    background: `linear-gradient(135deg, ${currentTheme.hex.primary}15, ${currentTheme.hex.secondary}10)`
                                }}
                            >
                                {(logoPreviewUrl || appLogo) ? (
                                    <img
                                        src={logoPreviewUrl || `/storage/${appLogo}`}
                                        alt="Logo Preview"
                                        className="w-full h-full object-contain p-2"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-white/30 text-xs">Default</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status logo saat ini */}
                        {appLogo && !logoPreviewUrl && (
                            <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${currentTheme.hex.primary}18` }}>
                                <svg className="w-4 h-4 shrink-0" style={{ color: currentTheme.hex.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-white/70 text-xs">Logo kustom sedang aktif</span>
                                <button
                                    type="button"
                                    onClick={handleLogoReset}
                                    className="ml-auto text-xs font-semibold hover:underline"
                                    style={{ color: currentTheme.hex.primary }}
                                >
                                    Reset ke default
                                </button>
                            </div>
                        )}

                        {/* File Input */}
                        <div className="mb-6">
                            <label className="block w-full cursor-pointer" htmlFor="logo-upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoFileChange}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <div
                                    className="w-full backdrop-blur-md border-2 border-dashed rounded-2xl p-5 text-center hover:bg-white/5 transition-all"
                                    style={{ borderColor: `${currentTheme.hex.primary}50` }}
                                >
                                    <svg className="w-8 h-8 mx-auto mb-2" style={{ color: currentTheme.hex.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-white/70 text-sm">
                                        {selectedLogoFile ? (
                                            <span className="font-semibold" style={{ color: currentTheme.hex.primary }}>{selectedLogoFile.name}</span>
                                        ) : (
                                            <>
                                                <span className="font-semibold" style={{ color: currentTheme.hex.primary }}>Klik untuk pilih file</span>
                                                <span className="text-white/40"> atau seret ke sini</span>
                                            </>
                                        )}
                                    </p>
                                    <p className="text-white/30 text-xs mt-1">PNG, JPG, GIF, SVG, WEBP — maks. 2MB</p>
                                </div>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowLogoModal(false);
                                    setSelectedLogoFile(null);
                                    setLogoPreviewUrl(null);
                                }}
                                className="flex-1 bg-white/10 backdrop-blur-md border text-white font-semibold py-3 rounded-full hover:bg-white/15 transition-all"
                                style={{ borderColor: `${currentTheme.hex.primary}40` }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogoUpload}
                                disabled={!selectedLogoFile || isUploadingLogo}
                                className="flex-1 text-white font-bold py-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                    boxShadow: `0 10px 25px -5px ${currentTheme.hex.primary}40`
                                }}
                            >
                                {isUploadingLogo ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        Mengupload...
                                    </>
                                ) : 'Simpan Logo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </nav>
    );
};

export default NavbarAdmin;
