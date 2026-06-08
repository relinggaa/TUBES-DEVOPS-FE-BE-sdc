import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [themeColor, setThemeColor] = useState(() => {
        
        if (typeof window !== 'undefined') {
            return localStorage.getItem('adminThemeColor') || 'purple';
        }
        return 'purple';
    });

    const themeConfig = {
        purple: {
            name: 'Ungu',
            primary: 'purple',
            gradient: {
                from: 'from-gray-900',
                via: 'via-purple-900/20',
                to: 'to-gray-900',
            },
            colors: {
                bg: 'bg-purple-500/20',
                border: 'border-purple-500/20',
                text: 'text-purple-300',
                glow: 'shadow-purple-500/20',
                button: 'from-purple-600/30 to-purple-500/20',
                gradient: 'from-purple-500 via-purple-600 to-purple-700',
            },
            hex: {
                primary: '#8b5cf6',
                secondary: '#a855f7',
                glow: 'rgba(168, 85, 247, 0.2)',
            },
            classes: {
                // Stats component classes
                stats: {
                    border: 'border-purple-500/20',
                    borderHover: 'hover:border-purple-500/40',
                    shadowHover: 'hover:shadow-purple-500/20',
                    text: 'text-purple-300',
                    textHover: 'group-hover:text-purple-200',
                    gradientFrom: 'from-purple-500',
                    gradientTo: 'to-purple-400',
                },
                // Navbar component classes
                navbar: {
                    bg: 'purple-500',
                    border: 'purple-500',
                    text: 'purple-300',
                    glow: 'purple-500',
                    gradient: 'from-purple-500 to-purple-600',
                },
                // Layout background orbs
                layout: {
                    orb1: 'bg-purple-500/20',
                    orb2: 'bg-cyan-500/10',
                    orb3: 'bg-purple-600/10',
                    orb4: 'bg-purple-400/5',
                    orb5: 'bg-cyan-400/5',
                    grid: '#8b5cf6',
                },
                // Header component classes
                header: {
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
                },
                // QuickActions component classes
                quickActions: {
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
                },
                // RecentActivities component classes
                recentActivities: {
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
                },
                // Chart component classes
                chart: {
                    border: 'border-purple-500/20',
                    shadowHover: 'hover:shadow-purple-500/10',
                    gradientFrom: 'from-purple-500/5',
                    gradientTo: 'to-purple-500/5',
                },
            }
        },
        red: {
            name: 'Merah',
            primary: 'red',
            gradient: {
                from: 'from-gray-900',
                via: 'via-red-900/20',
                to: 'to-gray-900',
            },
            colors: {
                bg: 'bg-red-500/20',
                border: 'border-red-500/20',
                text: 'text-red-300',
                glow: 'shadow-red-500/20',
                button: 'from-red-600/30 to-red-500/20',
                gradient: 'from-red-500 via-red-600 to-red-700',
            },
            hex: {
                primary: '#ef4444',
                secondary: '#f87171',
                glow: 'rgba(239, 68, 68, 0.2)',
            },
            classes: {
                stats: {
                    border: 'border-red-500/20',
                    borderHover: 'hover:border-red-500/40',
                    shadowHover: 'hover:shadow-red-500/20',
                    text: 'text-red-300',
                    textHover: 'group-hover:text-red-200',
                    gradientFrom: 'from-red-500',
                    gradientTo: 'to-red-400',
                },
                navbar: {
                    bg: 'red-500',
                    border: 'red-500',
                    text: 'red-300',
                    glow: 'red-500',
                    gradient: 'from-red-500 to-red-600',
                },
                layout: {
                    orb1: 'bg-red-500/20',
                    orb2: 'bg-red-500/10',
                    orb3: 'bg-red-600/10',
                    orb4: 'bg-red-400/5',
                    orb5: 'bg-red-400/5',
                    grid: '#ef4444',
                },
                header: {
                    border: 'border-red-500/20',
                    borderHover: 'hover:border-red-500/30',
                    shadow: 'shadow-red-500/10',
                    shadowHover: 'hover:shadow-red-500/20',
                    text: 'text-red-300',
                    bg: 'bg-red-500/20',
                    bgGlow: 'bg-red-500/5',
                    gradientFrom: 'from-red-600/20',
                    gradientVia: 'via-red-500/20',
                    gradientTo: 'to-red-600/20',
                    gradientFromSolid: 'from-red-500',
                    gradientViaSolid: 'via-red-200',
                    gradientToSolid: 'to-red-400',
                    gradientFromGlow: 'from-red-600',
                    gradientToGlow: 'to-red-400',
                },
                quickActions: {
                    border: 'border-red-500/20',
                    borderHover: 'hover:border-red-500/30',
                    shadow: 'shadow-red-500/40',
                    shadowHover: 'hover:shadow-red-500/60',
                    shadowHoverSmall: 'hover:shadow-red-500/10',
                    text: 'text-red-300',
                    textHover: 'group-hover/btn:text-red-400',
                    bg: 'bg-red-500/20',
                    bgHover: 'group-hover/btn:bg-red-500/20',
                    gradientFrom: 'from-red-600/20',
                    gradientVia: 'via-red-500/20',
                    gradientTo: 'to-red-600/20',
                    bgGlow: 'bg-red-500/5',
                },
                recentActivities: {
                    border: 'border-red-500/20',
                    borderHover: 'hover:border-red-500/30',
                    shadowHover: 'hover:shadow-red-500/10',
                    text: 'text-red-300',
                    textHover: 'group-hover/item:text-red-200',
                    bg: 'bg-red-500/20',
                    bgHover: 'group-hover/item:bg-red-500/20',
                    gradientFrom: 'from-red-600/20',
                    gradientVia: 'via-red-500/20',
                    gradientTo: 'to-red-600/20',
                    bgGlow: 'bg-red-500/5',
                },
                chart: {
                    border: 'border-red-500/20',
                    shadowHover: 'hover:shadow-red-500/10',
                    gradientFrom: 'from-red-500/5',
                    gradientTo: 'to-red-500/5',
                },
            }
        },
        blue: {
            name: 'Biru',
            primary: 'blue',
            gradient: {
                from: 'from-gray-900',
                via: 'via-blue-900/20',
                to: 'to-gray-900',
            },
            colors: {
                bg: 'bg-blue-500/20',
                border: 'border-blue-500/20',
                text: 'text-blue-300',
                glow: 'shadow-blue-500/20',
                button: 'from-blue-600/30 to-blue-500/20',
                gradient: 'from-blue-500 via-blue-600 to-blue-700',
            },
            hex: {
                primary: '#3b82f6',
                secondary: '#60a5fa',
                glow: 'rgba(59, 130, 246, 0.2)',
            },
            classes: {
                stats: {
                    border: 'border-blue-500/20',
                    borderHover: 'hover:border-blue-500/40',
                    shadowHover: 'hover:shadow-blue-500/20',
                    text: 'text-blue-300',
                    textHover: 'group-hover:text-blue-200',
                    gradientFrom: 'from-blue-500',
                    gradientTo: 'to-blue-400',
                },
                navbar: {
                    bg: 'blue-500',
                    border: 'blue-500',
                    text: 'blue-300',
                    glow: 'blue-500',
                    gradient: 'from-blue-500 to-blue-600',
                },
                layout: {
                    orb1: 'bg-blue-500/20',
                    orb2: 'bg-blue-500/10',
                    orb3: 'bg-blue-600/10',
                    orb4: 'bg-blue-400/5',
                    orb5: 'bg-blue-400/5',
                    grid: '#3b82f6',
                },
                header: {
                    border: 'border-blue-500/20',
                    borderHover: 'hover:border-blue-500/30',
                    shadow: 'shadow-blue-500/10',
                    shadowHover: 'hover:shadow-blue-500/20',
                    text: 'text-blue-300',
                    bg: 'bg-blue-500/20',
                    bgGlow: 'bg-blue-500/5',
                    gradientFrom: 'from-blue-600/20',
                    gradientVia: 'via-blue-500/20',
                    gradientTo: 'to-blue-600/20',
                    gradientFromSolid: 'from-blue-500',
                    gradientViaSolid: 'via-blue-200',
                    gradientToSolid: 'to-blue-400',
                    gradientFromGlow: 'from-blue-600',
                    gradientToGlow: 'to-blue-400',
                },
                quickActions: {
                    border: 'border-blue-500/20',
                    borderHover: 'hover:border-blue-500/30',
                    shadow: 'shadow-blue-500/40',
                    shadowHover: 'hover:shadow-blue-500/60',
                    shadowHoverSmall: 'hover:shadow-blue-500/10',
                    text: 'text-blue-300',
                    textHover: 'group-hover/btn:text-blue-400',
                    bg: 'bg-blue-500/20',
                    bgHover: 'group-hover/btn:bg-blue-500/20',
                    gradientFrom: 'from-blue-600/20',
                    gradientVia: 'via-blue-500/20',
                    gradientTo: 'to-blue-600/20',
                    bgGlow: 'bg-blue-500/5',
                },
                recentActivities: {
                    border: 'border-blue-500/20',
                    borderHover: 'hover:border-blue-500/30',
                    shadowHover: 'hover:shadow-blue-500/10',
                    text: 'text-blue-300',
                    textHover: 'group-hover/item:text-blue-200',
                    bg: 'bg-blue-500/20',
                    bgHover: 'group-hover/item:bg-blue-500/20',
                    gradientFrom: 'from-blue-600/20',
                    gradientVia: 'via-blue-500/20',
                    gradientTo: 'to-blue-600/20',
                    bgGlow: 'bg-blue-500/5',
                },
                chart: {
                    border: 'border-blue-500/20',
                    shadowHover: 'hover:shadow-blue-500/10',
                    gradientFrom: 'from-blue-500/5',
                    gradientTo: 'to-blue-500/5',
                },
            }
        },
        green: {
            name: 'Hijau',
            primary: 'green',
            gradient: {
                from: 'from-gray-900',
                via: 'via-green-900/20',
                to: 'to-gray-900',
            },
            colors: {
                bg: 'bg-green-500/20',
                border: 'border-green-500/20',
                text: 'text-green-300',
                glow: 'shadow-green-500/20',
                button: 'from-green-600/30 to-green-500/20',
                gradient: 'from-green-500 via-green-600 to-green-700',
            },
            hex: {
                primary: '#22c55e',
                secondary: '#4ade80',
                glow: 'rgba(34, 197, 94, 0.2)',
            },
            classes: {
                stats: {
                    border: 'border-green-500/20',
                    borderHover: 'hover:border-green-500/40',
                    shadowHover: 'hover:shadow-green-500/20',
                    text: 'text-green-300',
                    textHover: 'group-hover:text-green-200',
                    gradientFrom: 'from-green-500',
                    gradientTo: 'to-green-400',
                },
                navbar: {
                    bg: 'green-500',
                    border: 'green-500',
                    text: 'green-300',
                    glow: 'green-500',
                    gradient: 'from-green-500 to-green-600',
                },
                layout: {
                    orb1: 'bg-green-500/20',
                    orb2: 'bg-green-500/10',
                    orb3: 'bg-green-600/10',
                    orb4: 'bg-green-400/5',
                    orb5: 'bg-green-400/5',
                    grid: '#22c55e',
                },
                header: {
                    border: 'border-green-500/20',
                    borderHover: 'hover:border-green-500/30',
                    shadow: 'shadow-green-500/10',
                    shadowHover: 'hover:shadow-green-500/20',
                    text: 'text-green-300',
                    bg: 'bg-green-500/20',
                    bgGlow: 'bg-green-500/5',
                    gradientFrom: 'from-green-600/20',
                    gradientVia: 'via-green-500/20',
                    gradientTo: 'to-green-600/20',
                    gradientFromSolid: 'from-green-500',
                    gradientViaSolid: 'via-green-200',
                    gradientToSolid: 'to-green-400',
                    gradientFromGlow: 'from-green-600',
                    gradientToGlow: 'to-green-400',
                },
                quickActions: {
                    border: 'border-green-500/20',
                    borderHover: 'hover:border-green-500/30',
                    shadow: 'shadow-green-500/40',
                    shadowHover: 'hover:shadow-green-500/60',
                    shadowHoverSmall: 'hover:shadow-green-500/10',
                    text: 'text-green-300',
                    textHover: 'group-hover/btn:text-green-400',
                    bg: 'bg-green-500/20',
                    bgHover: 'group-hover/btn:bg-green-500/20',
                    gradientFrom: 'from-green-600/20',
                    gradientVia: 'via-green-500/20',
                    gradientTo: 'to-green-600/20',
                    bgGlow: 'bg-green-500/5',
                },
                recentActivities: {
                    border: 'border-green-500/20',
                    borderHover: 'hover:border-green-500/30',
                    shadowHover: 'hover:shadow-green-500/10',
                    text: 'text-green-300',
                    textHover: 'group-hover/item:text-green-200',
                    bg: 'bg-green-500/20',
                    bgHover: 'group-hover/item:bg-green-500/20',
                    gradientFrom: 'from-green-600/20',
                    gradientVia: 'via-green-500/20',
                    gradientTo: 'to-green-600/20',
                    bgGlow: 'bg-green-500/5',
                },
                chart: {
                    border: 'border-green-500/20',
                    shadowHover: 'hover:shadow-green-500/10',
                    gradientFrom: 'from-green-500/5',
                    gradientTo: 'to-green-500/5',
                },
            }
        },
        yellow: {
            name: 'Kuning',
            primary: 'yellow',
            gradient: {
                from: 'from-gray-900',
                via: 'via-yellow-900/20',
                to: 'to-gray-900',
            },
            colors: {
                bg: 'bg-yellow-500/20',
                border: 'border-yellow-500/20',
                text: 'text-yellow-300',
                glow: 'shadow-yellow-500/20',
                button: 'from-yellow-600/30 to-yellow-500/20',
                gradient: 'from-yellow-500 via-yellow-600 to-yellow-700',
            },
            hex: {
                primary: '#eab308',
                secondary: '#facc15',
                glow: 'rgba(234, 179, 8, 0.2)',
            },
            classes: {
                stats: {
                    border: 'border-yellow-500/20',
                    borderHover: 'hover:border-yellow-500/40',
                    shadowHover: 'hover:shadow-yellow-500/20',
                    text: 'text-yellow-300',
                    textHover: 'group-hover:text-yellow-200',
                    gradientFrom: 'from-yellow-500',
                    gradientTo: 'to-yellow-400',
                },
                navbar: {
                    bg: 'yellow-500',
                    border: 'yellow-500',
                    text: 'yellow-300',
                    glow: 'yellow-500',
                    gradient: 'from-yellow-500 to-yellow-600',
                },
                layout: {
                    orb1: 'bg-yellow-500/20',
                    orb2: 'bg-yellow-500/10',
                    orb3: 'bg-yellow-600/10',
                    orb4: 'bg-yellow-400/5',
                    orb5: 'bg-yellow-400/5',
                    grid: '#eab308',
                },
                header: {
                    border: 'border-yellow-500/20',
                    borderHover: 'hover:border-yellow-500/30',
                    shadow: 'shadow-yellow-500/10',
                    shadowHover: 'hover:shadow-yellow-500/20',
                    text: 'text-yellow-300',
                    bg: 'bg-yellow-500/20',
                    bgGlow: 'bg-yellow-500/5',
                    gradientFrom: 'from-yellow-600/20',
                    gradientVia: 'via-yellow-500/20',
                    gradientTo: 'to-yellow-600/20',
                    gradientFromSolid: 'from-yellow-500',
                    gradientViaSolid: 'via-yellow-200',
                    gradientToSolid: 'to-yellow-400',
                    gradientFromGlow: 'from-yellow-600',
                    gradientToGlow: 'to-yellow-400',
                },
                quickActions: {
                    border: 'border-yellow-500/20',
                    borderHover: 'hover:border-yellow-500/30',
                    shadow: 'shadow-yellow-500/40',
                    shadowHover: 'hover:shadow-yellow-500/60',
                    shadowHoverSmall: 'hover:shadow-yellow-500/10',
                    text: 'text-yellow-300',
                    textHover: 'group-hover/btn:text-yellow-400',
                    bg: 'bg-yellow-500/20',
                    bgHover: 'group-hover/btn:bg-yellow-500/20',
                    gradientFrom: 'from-yellow-600/20',
                    gradientVia: 'via-yellow-500/20',
                    gradientTo: 'to-yellow-600/20',
                    bgGlow: 'bg-yellow-500/5',
                },
                recentActivities: {
                    border: 'border-yellow-500/20',
                    borderHover: 'hover:border-yellow-500/30',
                    shadowHover: 'hover:shadow-yellow-500/10',
                    text: 'text-yellow-300',
                    textHover: 'group-hover/item:text-yellow-200',
                    bg: 'bg-yellow-500/20',
                    bgHover: 'group-hover/item:bg-yellow-500/20',
                    gradientFrom: 'from-yellow-600/20',
                    gradientVia: 'via-yellow-500/20',
                    gradientTo: 'to-yellow-600/20',
                    bgGlow: 'bg-yellow-500/5',
                },
                chart: {
                    border: 'border-yellow-500/20',
                    shadowHover: 'hover:shadow-yellow-500/10',
                    gradientFrom: 'from-yellow-500/5',
                    gradientTo: 'to-yellow-500/5',
                },
            }
        },
    };

    const changeTheme = (color) => {
        setThemeColor(color);
        if (typeof window !== 'undefined') {
            localStorage.setItem('adminThemeColor', color);
        }
    };

    const currentTheme = themeConfig[themeColor] || themeConfig.purple;

    useEffect(() => {

        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', themeColor);
        }
    }, [themeColor]);

    return (
        <ThemeContext.Provider value={{ themeColor, changeTheme, currentTheme, themeConfig }}>
            {children}
        </ThemeContext.Provider>
    );
};
