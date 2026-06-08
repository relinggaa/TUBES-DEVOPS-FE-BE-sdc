import React from 'react';

export default function PageHeader({ 
    currentTheme, 
    title,
    subtitle,
    buttonText,
    onButtonClick,
    badgeText = "Active",
    showBadge = true
}) {
    return (
        <div className="relative group">
            {/* Background Glow Effect */}
            <div 
                className="absolute -inset-0.5 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10"
                style={{
                    background: `linear-gradient(to right, ${currentTheme.hex.primary}33, ${currentTheme.hex.secondary}33, ${currentTheme.hex.primary}33)`
                }}
            ></div>
            
            <div 
                className="relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 backdrop-blur-2xl rounded-3xl border shadow-2xl transition-all duration-500 p-8 md:p-10 overflow-hidden"
                style={{
                    borderColor: `${currentTheme.hex.primary}20`,
                    boxShadow: `0 10px 25px -5px ${currentTheme.hex.primary}10`
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${currentTheme.hex.primary}30`;
                    e.currentTarget.style.boxShadow = `0 10px 25px -5px ${currentTheme.hex.primary}20`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${currentTheme.hex.primary}20`;
                    e.currentTarget.style.boxShadow = `0 10px 25px -5px ${currentTheme.hex.primary}10`;
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
                <div className="relative z-20 flex flex-col md:flex-row md:items-center md:justify-between" style={{ isolation: 'isolate' }}>
                    <div className="flex-1 mb-6 md:mb-0 relative" style={{ zIndex: 25 }}>
                        {/* Badge */}
                        {showBadge && (
                            <div className="inline-flex items-center space-x-2 mb-4 relative" style={{ zIndex: 31 }}>
                                <span 
                                    className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm"
                                    style={{
                                        backgroundColor: `${currentTheme.hex.primary}20`,
                                        color: currentTheme.hex.secondary,
                                        border: `1px solid ${currentTheme.hex.primary}40`
                                    }}
                                >
                                    <span className="flex items-center space-x-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        <span>{badgeText}</span>
                                    </span>
                                </span>
                            </div>
                        )}
                        
                        {/* Title */}
                        <h1 
                            className="text-4xl md:text-6xl font-extrabold mb-3 leading-tight relative" 
                            style={{ 
                                zIndex: 30, 
                                isolation: 'isolate',
                                position: 'relative',
                                marginBottom: '0.75rem'
                            }}
                        >
                            <span
                                style={{
                                    backgroundImage: `linear-gradient(to right, #ffffff, ${currentTheme.hex.secondary}, ${currentTheme.hex.primary})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    display: 'inline-block',
                                    position: 'relative',
                                    zIndex: 30,
                                    lineHeight: '1.2',
                                    backgroundSize: '100%',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    color: 'transparent'
                                }}
                            >
                                {title}
                            </span>
                        </h1>
                        {/* Subtitle */}
                        {subtitle && (
                            <p 
                                className="text-lg md:text-xl max-w-2xl relative"
                                style={{ 
                                    color: `${currentTheme.hex.secondary}B3`,
                                    zIndex: 35,
                                    position: 'relative',
                                    marginTop: '0.5rem',
                                    isolation: 'isolate'
                                }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                    
                    {/* CTA Button */}
                    {buttonText && onButtonClick && (
                        <div className="md:ml-8">
                            <button
                                onClick={onButtonClick}
                                className="group relative px-8 py-4 text-white rounded-2xl font-bold text-sm transition-all duration-500 shadow-2xl hover:scale-110 flex items-center space-x-3 overflow-hidden"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary}, ${currentTheme.hex.primary})`,
                                    boxShadow: `0 10px 40px -10px ${currentTheme.hex.primary}60`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = `0 10px 40px -10px ${currentTheme.hex.primary}80`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = `0 10px 40px -10px ${currentTheme.hex.primary}60`;
                                }}
                            >
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                
                                <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="relative z-10">{buttonText}</span>
                                <svg className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                
                                {/* Glow rings */}
                                <div 
                                    className="absolute -inset-1 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500 -z-10"
                                    style={{
                                        background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`
                                    }}
                                ></div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
