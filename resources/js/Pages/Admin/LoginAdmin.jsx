import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useTheme } from '../../contexts/ThemeContext';
import ModelViewer from '../../components/ModelViewer';
import { toast } from 'react-toastify';

export default function LoginAdmin() {
    const { currentTheme } = useTheme();
    const { flash, auth } = usePage().props;
    const [formData, setFormData] = useState({
        username: '',
        key: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);


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
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: `1px solid ${currentTheme.hex.primary}40`,
                    borderRadius: '12px',
                    boxShadow: `0 4px 12px ${currentTheme.hex.primary}30`
                },
                progressStyle: {
                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`
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
                    backgroundColor: '#000000',
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
    }, [flash?.success, flash?.error, currentTheme]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        router.post('/admin/login', formData, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsLoading(false);
              
            },
            onError: (errors) => {
                setErrors(errors);
                setIsLoading(false);
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#0D0219] relative overflow-hidden">
   
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-transparent via-purple-900/20 to-transparent blur-3xl animate-pulse"
                    style={{
                        background: `radial-gradient(circle at center, ${currentTheme.hex.primary}20 0%, transparent 70%)`
                    }}
                ></div>
            </div>




            <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
              
                <div className="relative flex items-center justify-center p-8 lg:p-12 overflow-hidden">
                 
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: `radial-gradient(circle at center, ${currentTheme.hex.primary}15 0%, transparent 70%)`
                        }}
                    ></div>

                    <div className="relative z-10 w-full h-full max-w-4xl flex items-center justify-center">
                        <ModelViewer
                            url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb"
                            width={1000}
                            height={900}
                            autoRotate={false}
                            autoRotateSpeed={0.5}
                            showScreenshotButton={false}
                            enableManualRotation={true}
                            enableHoverRotation={true}
                            enableManualZoom={true}
                            defaultZoom={1.0}
                        />
                    </div>
                </div>

                {/* Right Column - Login Form */}
                <div className="relative flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md">
                        <div className="relative group">
                            {/* Background Glow Effect */}
                            <div
                                className="absolute -inset-0.5 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}40, ${currentTheme.hex.secondary}40, ${currentTheme.hex.primary}40)`
                                }}
                            ></div>

                            {/* Main Card */}
                            <div
                                className=" relative bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-800/90 backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 md:p-10 overflow-hidden"
                                style={{
                                    borderColor: `${currentTheme.hex.primary}40`,
                                    boxShadow: `0 25px 50px -12px ${currentTheme.hex.primary}30`
                                }}
                            >
                                {/* Corner Accents */}
                                <div
                                    className="absolute top-0 left-0 w-32 h-32 rounded-tl-3xl -z-10"
                                    style={{
                                        background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}15, transparent)`
                                    }}
                                ></div>
                                <div
                                    className="absolute bottom-0 right-0 w-32 h-32 rounded-br-3xl -z-10"
                                    style={{
                                        background: `linear-gradient(to top left, ${currentTheme.hex.primary}15, transparent)`
                                    }}
                                ></div>

                                {/* Gradient Overlay */}
                                <div
                                    className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl animate-pulse -z-10"
                                    style={{
                                        backgroundColor: currentTheme.hex.primary,
                                        opacity: 0.05
                                    }}
                                ></div>

                                {/* Shine Effect */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
                                    style={{ zIndex: -1 }}
                                ></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Logo/Header */}
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center mb-4">
                                            <div
                                                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
                                                style={{
                                                    background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                                    boxShadow: `0 10px 40px -10px ${currentTheme.hex.primary}60`
                                                }}
                                            >
                                                <svg
                                                    className="w-8 h-8 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    style={{ filter: `drop-shadow(0 0 8px ${currentTheme.hex.primary}80)` }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h1
                                            className="text-4xl font-extrabold mb-2"
                                            style={{
                                                background: `linear-gradient(to right, #ffffff, ${currentTheme.hex.secondary}, ${currentTheme.hex.primary})`,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                display: 'inline-block'
                                            }}
                                        >
                                            Sagara Daily Checkup
                                        </h1>
                                        <p className="text-gray-400 text-sm mt-2">Masuk ke Admin Panel</p>
                                    </div>

                                    {/* Login Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Username Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Username
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                                                    style={{
                                                        borderColor: errors.username ? '#ef4444' : `${currentTheme.hex.primary}40`,
                                                    }}
                                                    onFocus={(e) => {
                                                        e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                                        e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.currentTarget.style.borderColor = errors.username ? '#ef4444' : `${currentTheme.hex.primary}40`;
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                    placeholder="Masukkan username"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            {errors.username && (
                                                <p className="mt-1.5 text-sm text-red-400 flex items-center space-x-1">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{errors.username}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Key Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Key
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.key}
                                                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 font-mono tracking-wider"
                                                    style={{
                                                        borderColor: errors.key ? '#ef4444' : `${currentTheme.hex.primary}40`,
                                                    }}
                                                    onFocus={(e) => {
                                                        e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                                        e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.currentTarget.style.borderColor = errors.key ? '#ef4444' : `${currentTheme.hex.primary}40`;
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                    placeholder="Masukkan key (8 karakter)"
                                                    maxLength={8}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            {errors.key && (
                                                <p className="mt-1.5 text-sm text-red-400 flex items-center space-x-1">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{errors.key}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 shadow-2xl flex items-center justify-center space-x-2 group/btn overflow-hidden relative"
                                            style={{
                                                background: isLoading
                                                    ? `linear-gradient(to right, ${currentTheme.hex.primary}80, ${currentTheme.hex.secondary}80)`
                                                    : `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary}, ${currentTheme.hex.primary})`,
                                                boxShadow: `0 10px 40px -10px ${currentTheme.hex.primary}60`,
                                                backgroundSize: isLoading ? '100%' : '200% 100%',
                                                animation: isLoading ? 'none' : 'gradient-shift 3s ease infinite'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isLoading) {
                                                    e.currentTarget.style.boxShadow = `0 15px 50px -10px ${currentTheme.hex.primary}80`;
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isLoading) {
                                                    e.currentTarget.style.boxShadow = `0 10px 40px -10px ${currentTheme.hex.primary}60`;
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }
                                            }}
                                        >
                                            {/* Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>

                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="relative z-10">Memproses...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="relative z-10">Masuk</span>
                                                    <svg className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </>
                                            )}

                                            {/* Glow rings */}
                                            <div
                                                className="absolute -inset-1 rounded-xl opacity-20 group-hover/btn:opacity-40 blur-xl transition-opacity duration-500 -z-10"
                                                style={{
                                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`
                                                }}
                                            ></div>
                                        </button>
                                    </form>

                                    {/* Footer */}
                                    <div className="mt-6 text-center">
                                        <p className="text-gray-500 text-xs">
                                            © 2025 Sagara Daily Checkup. All rights reserved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animation for Gradient */}
            <style>{`
                @keyframes gradient-shift {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
            `}</style>
        </div>
    );
}
