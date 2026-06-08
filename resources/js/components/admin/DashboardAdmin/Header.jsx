import React from 'react';
import { Link } from '@inertiajs/react';

export default function Header({ currentTheme }) {

    const classes = currentTheme.classes?.header || {
        border: 'border-purple-500/20',
        borderHover: 'hover:border-purple-500/30',
        shadow: 'shadow-purple-500/10',
        shadowHover: 'hover:shadow-purple-500/20',
        text: 'text-purple-300',
        bg: 'bg-purple-500/20',
        bgGlow: 'bg-purple-500/5',
        gradientFrom: 'from-purple-600/20',
        gradientVia: 'via-purple-500/20',
        gradientTo: 'to-purple-600/20',
        gradientFromSolid: 'from-purple-500',
        gradientViaSolid: 'via-purple-200',
        gradientToSolid: 'to-purple-400',
        gradientFromGlow: 'from-purple-600',
        gradientToGlow: 'to-purple-400',
    };
    return (
        <div className="relative group">
            {/* Background Glow Effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${classes.gradientFrom} ${classes.gradientVia} ${classes.gradientTo} rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10`}></div>
            
            {/* Main Card */}
            <div className={`relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 backdrop-blur-2xl rounded-3xl border ${classes.border} shadow-2xl ${classes.shadow} ${classes.shadowHover} ${classes.borderHover} transition-all duration-500 p-8 md:p-10 overflow-hidden`}>
                {/* Corner Accents */}
                <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${classes.gradientFrom.replace('/20', '/10')} to-transparent rounded-tl-3xl`}></div>
                <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${classes.gradientFrom.replace('/20', '/10')} to-transparent rounded-br-3xl`}></div>
                
                {/* Grid Pattern Overlay (hidden) */}
                <div className="absolute inset-0 opacity-0">
                    <div 
                        className="absolute inset-0 bg-[size:2rem_2rem]"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${currentTheme.hex.primary} 1px, transparent 1px), linear-gradient(to bottom, ${currentTheme.hex.primary} 1px, transparent 1px)`
                        }}
                    ></div>
                </div>
                
                {/* Gradient Orbs */}
                <div className={`absolute top-0 right-0 w-96 h-96 ${classes.bgGlow} rounded-full blur-3xl animate-pulse`}></div>
                <div className={`absolute bottom-0 left-0 w-96 h-96 ${classes.bgGlow} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                        {/* Badge Section with Animation */}
                        <div className="flex items-center gap-3 mb-4 group">
                            <span className={`relative px-3 py-1.5 ${currentTheme.colors.button} backdrop-blur-sm ${classes.text} text-xs font-bold rounded-full border ${classes.border.replace('/20', '/30')} shadow-lg ${classes.shadow.replace('/10', '/20')} ${classes.shadowHover.replace('/20', '/40')} transition-all duration-300 hover:scale-105`}>
                                <span className="relative z-10 flex items-center space-x-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    <span>New</span>
                                </span>
                                <span className={`absolute inset-0 rounded-full bg-gradient-to-r ${classes.gradientFrom} to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></span>
                            </span>
                            <Link 
                                href="#" 
                                className="text-sm font-medium transition-all duration-300 flex items-center space-x-1 group/link"
                                style={{
                                    color: currentTheme.hex.secondary
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = currentTheme.hex.primary;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = currentTheme.hex.secondary;
                                }}
                            >
                                <span>Dashboard Update</span>
                                <svg 
                                    className="w-4 h-4 group-hover/link:translate-x-1 transition-all duration-300" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                    style={{
                                        color: 'inherit'
                                    }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        
                        {/* Title */}
                        <h1 className="relative text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
                            <span className={`block bg-gradient-to-r from-white ${classes.gradientViaSolid} ${classes.gradientToSolid} bg-clip-text text-transparent`}>
                                Dashboard Admin
                            </span>
                            
                            {/* Title Glow */}
                            <span className={`absolute inset-0 bg-gradient-to-r ${classes.gradientFromGlow}/20 ${classes.gradientToGlow}/20 blur-2xl -z-10 opacity-50 animate-pulse`}></span>
                        </h1>
                        
                        {/* Subtitle */}
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                            Kelola semua aktivitas dan pengajuan perbaikan dengan mudah dan efisien
                        </p>
                        
                        {/* Stats Preview */}
                        <div className="flex items-center gap-6 mt-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm text-gray-400">System Active</span>
                            </div>
                            <div className="h-4 w-px bg-gray-700"></div>
                            <div className="flex items-center space-x-2" style={{ color: currentTheme.hex.secondary }}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'inherit' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-sm" style={{ color: 'inherit' }}>Real-time Updates</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-8 md:mt-0 md:ml-8">
                        <button className={`group relative px-8 py-4 text-white rounded-2xl font-bold text-sm transition-all duration-500 shadow-2xl ${classes.shadow.replace('/10', '/40')} ${classes.shadowHover.replace('/20', '/60')} hover:scale-110 flex items-center space-x-3 overflow-hidden`}>
                            {/* Button Background Gradient */}
                            <div 
                                className="absolute inset-0 rounded-2xl z-0 transition-all duration-500"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary}, ${currentTheme.hex.primary})`
                                }}
                            ></div>
                            
                            {/* Button Hover Gradient */}
                            <div 
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.secondary}, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`
                                }}
                            ></div>
                            
                            {/* Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl z-0"></div>
                            
                            {/* Button Content */}
                            <span className="relative z-10 flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Lihat Pengajuan Perbaikan</span>
                            </span>
                            <svg className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            
                            {/* Glow Rings */}
                            <div className={`absolute -inset-1 bg-gradient-to-r ${classes.gradientFromGlow} ${classes.gradientToGlow} rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500 -z-10`}></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
