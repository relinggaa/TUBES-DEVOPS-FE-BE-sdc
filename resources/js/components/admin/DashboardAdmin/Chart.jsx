import React from 'react';

export default function Chart({ currentTheme, chartData = [] }) {
    const maxValue = chartData.length > 0 
        ? Math.max(...chartData.map(d => d.pengajuan), 1) 
        : 1;


    const classes = currentTheme.classes?.chart || {
        border: 'border-purple-500/20',
        shadowHover: 'hover:shadow-purple-500/10',
        gradientFrom: 'from-purple-500/5',
        gradientTo: 'to-purple-500/5',
    };

    return (
        <div className={`bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border ${classes.border} shadow-xl hover:shadow-2xl ${classes.shadowHover} transition-all duration-300`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <span 
                        className="w-1 h-8 rounded-full mr-3"
                        style={{
                            background: `linear-gradient(to bottom, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`
                        }}
                    ></span>
                    Statistik 7 Hari Terakhir
                </h2>
            </div>
            
            {/* Chart */}
            <div className="h-64 flex items-end justify-between gap-2 bg-gradient-to-br from-gray-800/30 to-gray-800/20 rounded-xl border border-gray-700/30 p-4 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${classes.gradientFrom} via-transparent ${classes.gradientTo}`}></div>
                
                {chartData.length > 0 ? (
                    <>
                        {chartData.map((data, index) => {
                            const height = (data.pengajuan / maxValue) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center justify-end gap-2 relative z-10">
                                    <div 
                                        className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                                        style={{
                                            height: `${Math.max(height, 5)}%`,
                                            background: `linear-gradient(to top, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                            minHeight: data.pengajuan > 0 ? '8px' : '0px'
                                        }}
                                    >
                                        {data.pengajuan > 0 && (
                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-white">
                                                {data.pengajuan}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 text-center">{data.date}</span>
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <div className="relative z-10 flex flex-col items-center space-y-2 w-full" style={{ color: currentTheme.hex.secondary }}>
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'inherit' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-sm" style={{ color: 'inherit' }}>Belum ada data</p>
                    </div>
                )}
            </div>
        </div>
    );
}
