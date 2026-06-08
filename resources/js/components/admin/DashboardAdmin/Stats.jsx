import React from 'react';

export default function Stats({ stats, currentTheme }) {

    const classes = currentTheme.classes?.stats || {
        border: 'border-purple-500/20',
        borderHover: 'hover:border-purple-500/40',
        shadowHover: 'hover:shadow-purple-500/20',
        text: 'text-purple-300',
        textHover: 'group-hover:text-purple-200',
        gradientFrom: 'from-purple-500',
        gradientTo: 'to-purple-400',
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                const baseGradients = [
                    { from: 'from-blue-500/20', to: 'to-cyan-500/20', glow: 'from-blue-500', textColor: 'text-cyan-300', glowColor: 'rgba(103, 232, 249, 0.6)' },
                    { from: 'from-green-500/20', to: 'to-emerald-500/20', glow: 'from-green-500', textColor: 'text-emerald-300', glowColor: 'rgba(110, 231, 183, 0.6)' },
                    { from: 'from-yellow-500/20', to: 'to-orange-500/20', glow: 'from-yellow-500', textColor: 'text-orange-300', glowColor: 'rgba(251, 146, 60, 0.6)' },
                    { from: `${classes.gradientFrom}/20`, to: `${classes.gradientTo}/20`, glow: `${classes.gradientFrom}`, textColor: classes.text, glowColor: currentTheme.hex.glow },
                ];
                const gradients = baseGradients;
                const gradient = gradients[index % gradients.length];
  
                return (
                    <div
                        key={index}
                        className={`group relative bg-gradient-to-br from-gray-900/70 via-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border ${classes.border} ${classes.borderHover} transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${classes.shadowHover} overflow-hidden cursor-pointer`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                     
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.to} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`}></div>
                        
                
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient.glow} ${classes.gradientTo} rounded-2xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 -z-10`}></div>
                        
                   
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${gradient.from} to-transparent rounded-tr-2xl opacity-20 z-0`}></div>
                        
                   
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-0"></div>
                        
                        <div className="relative z-30">
                            {/* Icon Section */}
                            <div className="flex items-center justify-between mb-6">
                                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg z-10`}>
                                    <div className={`w-3 h-3 rounded-full ${gradient.textColor} animate-pulse shadow-lg relative z-10`} style={{ boxShadow: `0 0 10px ${gradient.glowColor}` }}></div>
                                    <div className={`absolute inset-0 rounded-xl ${gradient.textColor} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300 -z-10`}></div>
                                </div>
                            
                                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-sm z-10 relative">
                                    <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="text-xs text-green-400 font-semibold">+12%</span>
                                </div>
                            </div>
                            
                            {/* Main Value */}
                            <div className="mb-3 relative z-30">
                                <p 
                                    className={`text-6xl font-extrabold ${gradient.textColor} mb-1 group-hover:scale-105 transition-transform duration-300 inline-block`}
                                    style={{ 
                                        textShadow: `0 0 20px ${gradient.glowColor}, 0 0 40px ${gradient.glowColor}`,
                                        filter: 'none',
                                        WebkitTextStroke: '0px'
                                    }}
                                >
                                    {stat.value}
                                </p>
                            </div>
                            
                            {/* Title */}
                            <h3 className={`text-white text-lg font-bold mb-2 ${classes.textHover} transition-colors relative z-30`}>
                                {stat.title}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors relative z-30">
                                {stat.description}
                            </p>
                         
                          
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
