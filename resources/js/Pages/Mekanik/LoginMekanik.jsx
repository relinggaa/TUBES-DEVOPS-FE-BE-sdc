import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";

export default function LoginMekanik() {
    const { flash } = usePage().props;
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        router.post('/mekanik/login', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setIsLoading(false);
            }
        });
    };

    const handleKeyChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        setFormData(prev => ({ ...prev, key: value }));
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
            >
                <source src="/videos/background.mov" type="video/quicktime" />
                <source src="/videos/background.mov" type="video/mp4" />
            </video>

            {/* Dark Overlay */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-slate-900/80"></div> */}

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="group relative bg-white/10 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/20 animate-fade-in hover:bg-white/15 hover:border-white/30 hover:shadow-cyan-500/30 transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-400/0 via-cyan-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:via-cyan-400/10 group-hover:to-purple-400/10 transition-all duration-500 pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                                Sign in
                            </h1>
                            <p className="text-blue-200">Sign in to access your account</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Username Input */}
                            <div className="mb-6">
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                        className={`peer block w-full appearance-none rounded-xl border backdrop-blur-sm px-4 pt-6 pb-3 text-sm text-white placeholder-transparent focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all hover:bg-white/15 hover:border-white/30 ${
                                            errors.username ? 'border-red-400/50 bg-white/10' : 'border-white/20 bg-white/10'
                                        }`}
                                        placeholder="Enter Username"
                                    />
                                    <label
                                        htmlFor="username"
                                        className="absolute left-4 top-2 text-xs text-blue-200 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-300/50 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-300"
                                    >
                                        Enter Username
                                    </label>
                                    {/* Input icon */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-xs text-red-400">{errors.username}</p>
                                )}
                            </div>

                            {/* Key Input */}
                            <div className="mb-6">
                                <div className="relative group/input">
                                    <input
                                        type="text"
                                        id="key"
                                        value={formData.key}
                                        onChange={handleKeyChange}
                                        className={`peer block w-full appearance-none rounded-xl border backdrop-blur-sm px-4 pt-6 pb-3 text-sm text-white placeholder-transparent focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all hover:bg-white/15 hover:border-white/30 font-mono tracking-wider ${
                                            errors.key ? 'border-red-400/50 bg-white/10' : 'border-white/20 bg-white/10'
                                        }`}
                                        placeholder="Enter Your Key"
                                        maxLength={8}
                                    />
                                    <label
                                        htmlFor="key"
                                        className="absolute left-4 top-2 text-xs text-blue-200 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-300/50 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-300"
                                    >
                                        Enter Your Key
                                    </label>
                                    {/* Input icon */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.key && (
                                    <p className="mt-1 text-xs text-red-400">{errors.key}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 mb-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group/btn relative flex-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
                                    <span className="relative">
                                        {isLoading ? 'Memproses...' : 'Login'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className="group/btn relative flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-300 font-bold py-3 rounded-xl hover:bg-white/15 transition-all duration-300 hover:scale-105 active:scale-95 hover:border-white/30 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-cyan-400/0 group-hover/btn:from-blue-400/10 group-hover/btn:to-cyan-400/10 transition-all duration-300"></div>
                                    <span className="relative">Contact Admin</span>
                                </button>
                            </div>
                        </form>

                        {/* Forget Password Link */}
                        <p className="text-center text-blue-200 text-sm">
                            Forget Your Key?{" "}
                            <a
                                href="#"
                                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors inline-flex items-center gap-1 group/link"
                            >
                                Click Here?
                                <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                        </p>
                    </div>
                </div>
            </div>

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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
        </div>
    );
}
