import React from 'react';
import { router } from '@inertiajs/react';

export default function QuickActions({ currentTheme }) {

    const classes = currentTheme.classes?.quickActions || {
        border: 'border-purple-500/20',
        borderHover: 'hover:border-purple-500/30',
        shadow: 'shadow-purple-500/40',
        shadowHover: 'hover:shadow-purple-500/60',
        shadowHoverSmall: 'hover:shadow-purple-500/10',
        text: 'text-purple-300',
        textHover: 'group-hover/btn:text-purple-400',
        bg: 'bg-purple-500/20',
        bgHover: 'group-hover/btn:bg-purple-500/20',
        gradientFrom: 'from-purple-600/20',
        gradientVia: 'via-purple-500/20',
        gradientTo: 'to-purple-600/20',
        bgGlow: 'bg-purple-500/5',
    };

    const actions = [
        { 
            name: 'Lihat Laporan', 
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            route: '/admin/laporan-biaya'
        },
        { 
            name: 'Generate Key', 
            icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
            route: '/admin/generate-key'
        },
        { 
            name: 'Kendaraan', 
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
            route: '/admin/kendaraan'
        }
    ];

    const handleActionClick = (route) => {
        if (route) {
            router.visit(route);
        }
    };

    return (
        <div className="group relative">
            {/* Background Glow Effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${classes.gradientFrom} ${classes.gradientVia} ${classes.gradientTo} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10`}></div>
            
            {/* Main Card */}
            <div className={`relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/60 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border ${classes.border} shadow-2xl ${classes.shadowHoverSmall} ${classes.borderHover} transition-all duration-500 overflow-hidden`}>
                {/* Grid Pattern Overlay (hidden) */}
                <div className="absolute inset-0 opacity-0">
                    <div 
                        className="absolute inset-0 bg-[size:1.5rem_1.5rem]"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${currentTheme.hex.primary} 1px, transparent 1px), linear-gradient(to bottom, ${currentTheme.hex.primary} 1px, transparent 1px)`
                        }}
                    ></div>
                </div>
                
                {/* Gradient Overlay */}
                <div className={`absolute top-0 left-0 w-64 h-64 ${classes.bgGlow} rounded-full blur-3xl`}></div>
                
                <div className="relative z-10">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-2">
                            <div 
                                className={`w-10 h-10 rounded-xl ${currentTheme.colors.button} flex items-center justify-center`}
                                style={{
                                    borderColor: `${currentTheme.hex.primary}4D`,
                                    borderWidth: '1px',
                                    borderStyle: 'solid'
                                }}
                            >
                                <svg className={`w-5 h-5 ${classes.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Akses cepat ke fitur utama</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Actions List */}
                    <div className="space-y-3">
                        {/* Primary Action - Review Pengajuan */}
                        <button 
                            onClick={() => handleActionClick('/admin/pengajuan-perbaikan')}
                            className={`group/btn relative w-full px-4 py-4 text-white rounded-2xl font-semibold transition-all duration-300 text-left flex items-center justify-between shadow-xl ${classes.shadow} ${classes.shadowHover} hover:scale-[1.02] overflow-hidden`}
                        >
                            {/* Button Background Gradient */}
                            <div 
                                className="absolute inset-0 rounded-2xl z-0 transition-all duration-300"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary}, ${currentTheme.hex.primary})`
                                }}
                            ></div>
                            
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 rounded-2xl z-0"></div>
                            
                            {/* Button Content */}
                            <span className="relative z-10 flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span>Review Pengajuan</span>
                            </span>
                            <svg className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                        
                        {/* Secondary Actions */}
                        {actions.map((action, index) => (
                            <button 
                                key={index}
                                onClick={() => handleActionClick(action.route)}
                                className={`group/btn relative w-full px-4 py-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 hover:from-gray-800/70 hover:to-gray-800/50 text-white rounded-2xl font-semibold transition-all duration-300 text-left flex items-center justify-between border border-gray-700/50 ${classes.borderHover} hover:shadow-xl ${classes.shadowHoverSmall} hover:scale-[1.02] overflow-hidden`}
                            >
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                
                                {/* Button Content */}
                                <span className="relative z-10 flex items-center space-x-3">
                                    <div 
                                        className={`w-10 h-10 rounded-xl bg-gray-700/50 ${classes.bgHover} flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110`}
                                        style={{
                                            borderColor: `${currentTheme.hex.primary}80`
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = `${currentTheme.hex.primary}CC`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = `${currentTheme.hex.primary}80`;
                                        }}
                                    >
                                        <svg className={`w-5 h-5 text-gray-400 ${classes.textHover} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                                        </svg>
                                    </div>
                                    <span>{action.name}</span>
                                </span>
                                <svg className={`w-5 h-5 relative z-10 ${classes.text} ${classes.textHover} group-hover/btn:translate-x-1 transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
