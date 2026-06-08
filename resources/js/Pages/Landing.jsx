import React from 'react';
import { Link } from '@inertiajs/react';
import Lanyard from '../components/Lanyard/Relingga/Lanyard';
import LanyardAriq from '../components/Lanyard/Ariq/LanyardAriq';
import TextType from '../components/TextType';
import Aurora from '../components/Aurora';

export default function Landing() {
    return (
        <div className="relative w-full min-h-screen overflow-x-hidden bg-black">
            {/* Aurora Background */}
            <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0, pointerEvents: 'none' }}>
                <Aurora
                    colorStops={["#AA2B1D", "#FFFFFF", "#AA2B1D"]}
                    blend={0.5}
                    amplitude={2.0}
                    speed={0.5}
                />
            </div>

            {/* Lanyard Layer (Interactive background elements) */}
            <div className="absolute inset-0 z-10 pointer-events-none flex justify-between overflow-hidden">

                <div className="hidden xl:block relative w-[25vw] h-full pointer-events-auto">
                    <div className="absolute inset-0 flex items-start justify-center pt-0">
                        <Lanyard position={[0, 2, 20]} gravity={[0, -40, 0]} />
                    </div>
                </div>


                <div className="hidden xl:block relative w-[25vw] h-full pointer-events-auto">
                    <div className="absolute inset-0 flex items-start justify-center pt-0">
                        <LanyardAriq position={[0, 2, 20]} gravity={[0, -40, 0]} />
                    </div>
                </div>
            </div>

            {/* Content Layer (Centered Text and Buttons) */}
            <div className="relative z-30 min-h-screen flex flex-col items-center justify-center pointer-events-none px-4 md:px-0">
                <div className="pointer-events-auto w-full md:max-w-4xl flex flex-col items-center">

                    {/* Hero Section */}
                    <div className="text-center mt-20 mb-8 md:mb-16 transform hover:scale-[1.02] transition-transform duration-700 cursor-default">
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in">
                            <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-red-500">Sagara Daily Checkup</span>
                        </div>

                        <div className="max-w-3xl mx-auto px-2">
                            <TextType
                                text={["Project Tugas Besar", "Perancangan Dan Pemrogaman Web", "Kelompok Sagara", "Developed By ", "Relingga Aditya", "Ariq Hisyam Nabil"]}
                                typingSpeed={60}
                                pauseDuration={2000}
                                showCursor={true}
                                cursorCharacter="|"
                                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-red-100 to-red-600 leading-tight tracking-tight drop-shadow-[0_10px_30px_rgba(170,43,29,0.4)]"
                            />
                        </div>


                    </div>

                    {/* Navigation Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 w-full max-w-3xl px-4 animate-fade-in-up">
                        {[
                            { href: "/admin/login", label: "Admin", icon: "admin", desc: "System Management" },
                            { href: "/mekanik/login", label: "Mekanik", icon: "mechanic", desc: "Repair & Maintenance" },
                            { href: "/driver/login", label: "Driver", icon: "driver", desc: "Vehicle Operations" }
                        ].map((item, idx) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="group relative p-6 md:p-8 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-500 hover:border-red-500/50 hover:shadow-[0_0_40px_rgba(170,43,29,0.2)] hover:-translate-y-2"
                                style={{ animationDelay: `${1.2 + idx * 0.1}s` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#AA2B1D]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative flex flex-col items-center gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 group-hover:bg-red-500/10 group-hover:scale-110 transition-all duration-500 border border-white/5 group-hover:border-red-500/20">
                                        {item.icon === 'admin' && (
                                            <svg className="w-8 h-8 text-white group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        )}
                                        {item.icon === 'mechanic' && (
                                            <svg className="w-8 h-8 text-white group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                        {item.icon === 'driver' && (
                                            <svg className="w-8 h-8 text-white group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white text-lg md:text-xl font-bold tracking-tight mb-1 group-hover:text-red-400 transition-colors">{item.label}</div>
                                        <div className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest">{item.desc}</div>
                                    </div>
                                    <div className="w-8 h-0.5 bg-red-500/20 group-hover:w-16 group-hover:bg-red-500 transition-all duration-500" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    <style jsx>{`
                        @keyframes fade-in-up {
                            from {
                                opacity: 0;
                                transform: translateY(30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        @keyframes fade-in {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        .animate-fade-in-up {
                            animation: fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s backwards;
                        }
                        .animate-fade-in {
                            animation: fade-in 1.2s ease-out forwards;
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}
