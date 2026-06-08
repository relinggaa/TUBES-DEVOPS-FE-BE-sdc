import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function RecentActivities({ recentActivities, currentTheme }) {
    const [showAll, setShowAll] = useState(false);
    const displayedActivities = showAll ? recentActivities : recentActivities.slice(0, 5);

    const classes = currentTheme.classes?.recentActivities || {
        border: 'border-purple-500/20',
        borderHover: 'hover:border-purple-500/30',
        shadowHover: 'hover:shadow-purple-500/10',
        text: 'text-purple-300',
        textHover: 'group-hover/item:text-purple-200',
        bg: 'bg-purple-500/20',
        bgHover: 'group-hover/item:bg-purple-500/20',
        gradientFrom: 'from-purple-600/20',
        gradientVia: 'via-purple-500/20',
        gradientTo: 'to-purple-600/20',
        bgGlow: 'bg-purple-500/5',
    };
    return (
        <div className="lg:col-span-2 group relative">
            {/* Background Glow Effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${classes.gradientFrom} ${classes.gradientVia} ${classes.gradientTo} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10`}></div>
            
            {/* Main Card */}
            <div className={`relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/60 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border ${classes.border} shadow-2xl ${classes.shadowHover} ${classes.borderHover} transition-all duration-500 overflow-hidden`}>
                {/* Grid Pattern Overlay (hidden) */}
                <div className="absolute inset-0 opacity-0">
                    <div 
                        className="absolute inset-0 bg-[size:1.5rem_1.5rem]"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${currentTheme.hex.primary} 1px, transparent 1px), linear-gradient(to bottom, ${currentTheme.hex.primary} 1px, transparent 1px)`
                        }}
                    ></div>
                </div>
                
                {/* Gradient Orbs */}
                <div className={`absolute top-0 right-0 w-64 h-64 ${classes.bgGlow} rounded-full blur-3xl`}></div>
                <div className={`absolute bottom-0 left-0 w-64 h-64 ${classes.bgGlow} rounded-full blur-3xl`}></div>
                
                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div 
                                className={`w-10 h-10 rounded-xl ${currentTheme.colors.button} flex items-center justify-center`}
                                style={{
                                    borderColor: `${currentTheme.hex.primary}4D`,
                                    borderWidth: '1px',
                                    borderStyle: 'solid'
                                }}
                            >
                                <svg className={`w-5 h-5 ${classes.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Aktivitas Terkini</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Update terbaru dari sistem</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-xs text-green-400 font-medium">Live</span>
                        </div>
                    </div>
                    
                    {/* Activities List */}
                    <div className="space-y-3">
                        {displayedActivities.map((activity, index) => {
                            const typeColors = {
                                success: { bg: 'bg-green-500', glow: 'rgba(34, 197, 94, 0.4)' },
                                warning: { bg: 'bg-yellow-500', glow: 'rgba(234, 179, 8, 0.4)' },
                                info: { bg: 'bg-blue-500', glow: 'rgba(59, 130, 246, 0.4)' }
                            };
                            const color = typeColors[activity.type] || typeColors.info;
                            
                            const handleClick = () => {
                                if (activity.route) {
                                    router.visit(activity.route);
                                }
                            };

                            return (
                                <div
                                    key={activity.id}
                                    onClick={handleClick}
                                    className={`group/item relative flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-800/40 to-gray-800/20 rounded-2xl hover:from-gray-800/60 hover:to-gray-800/40 transition-all duration-300 border border-gray-700/30 ${classes.borderHover} hover:shadow-xl ${classes.shadowHover} cursor-pointer overflow-hidden`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000"></div>
                                    
                                    {/* Status Indicator */}
                                    <div className="relative flex-shrink-0 mt-1 z-10">
                                        <div className={`w-4 h-4 rounded-full ${color.bg} group-hover/item:scale-125 transition-transform duration-300`} style={{ boxShadow: `0 0 12px ${color.glow}` }}></div>
                                        <div className={`absolute inset-0 w-4 h-4 rounded-full ${color.bg} opacity-30 group-hover/item:opacity-60 group-hover/item:scale-200 transition-all duration-300 animate-ping`}></div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <p className={`text-white font-semibold ${classes.textHover} transition-colors`}>{activity.activity}</p>
                                        <div className="flex items-center space-x-2 mt-1.5">
                                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-400 text-xs group-hover/item:text-gray-300 transition-colors">{activity.time}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Arrow Icon */}
                                    <div className="flex-shrink-0 mt-1 relative z-10">
                                        <div className={`w-8 h-8 rounded-lg bg-gray-800/50 ${classes.bgHover} flex items-center justify-center transition-all duration-300 group-hover/item:scale-110`}>
                                            <svg className={`w-4 h-4 text-gray-400 ${classes.textHover} group-hover/item:translate-x-0.5 transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* View All Button */}
                    {recentActivities.length > 5 && (
                        <button 
                            onClick={() => setShowAll(!showAll)}
                            className="mt-6 w-full py-3.5 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group/btn border transition-all duration-300"
                            style={{
                                color: currentTheme.hex.secondary,
                                borderColor: `${currentTheme.hex.primary}33`,
                                backgroundColor: `${currentTheme.hex.primary}08`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = currentTheme.hex.primary;
                                e.currentTarget.style.borderColor = `${currentTheme.hex.primary}66`;
                                e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}14`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = currentTheme.hex.secondary;
                                e.currentTarget.style.borderColor = `${currentTheme.hex.primary}33`;
                                e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}08`;
                            }}
                        >
                            <span>{showAll ? 'Sembunyikan' : `Lihat Semua Aktivitas (${recentActivities.length})`}</span>
                            {showAll ? (
                                <svg 
                                    className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-all duration-300" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                    style={{
                                        color: 'inherit'
                                    }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            ) : (
                                <svg 
                                    className="w-4 h-4 group-hover/btn:translate-x-1 transition-all duration-300" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                    style={{
                                        color: 'inherit'
                                    }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
