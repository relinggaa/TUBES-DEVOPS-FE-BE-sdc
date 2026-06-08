import React from 'react';

export default function UpdateModal({
    isOpen,
    currentTheme,
    formData,
    setFormData,
    errors,
    handleSubmit,
    handleClose,
    generateRandomKey
}) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={handleClose}
        >
            <div 
                className="relative w-full max-w-md bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 backdrop-blur-2xl rounded-3xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                style={{
                    borderColor: `${currentTheme.hex.primary}40`,
                    boxShadow: `0 25px 50px -12px ${currentTheme.hex.primary}50`
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Glow */}
                <div 
                    className="absolute -inset-0.5 rounded-3xl blur-xl opacity-50 -z-10"
                    style={{
                        background: `linear-gradient(to right, ${currentTheme.hex.primary}40, ${currentTheme.hex.secondary}40)`
                    }}
                ></div>
                
                {/* Corner Accents */}
                <div 
                    className="absolute top-0 left-0 w-24 h-24 rounded-tl-3xl"
                    style={{
                        background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}15, transparent)`
                    }}
                ></div>
                
                {/* Header */}
                <div 
                    className="px-6 py-5 border-b relative"
                    style={{ borderColor: `${currentTheme.hex.primary}33` }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}20, ${currentTheme.hex.secondary}20)`,
                                    border: `1px solid ${currentTheme.hex.primary}30`
                                }}
                            >
                                <svg className="w-6 h-6" style={{ color: currentTheme.hex.secondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Update User</h2>
                                <p className="text-xs" style={{ color: `${currentTheme.hex.secondary}B3` }}>
                                    Update data user yang dipilih
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{
                                color: currentTheme.hex.secondary
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}20`;
                                e.currentTarget.style.color = currentTheme.hex.primary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = currentTheme.hex.secondary;
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold mb-2.5" style={{ color: currentTheme.hex.secondary }}>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Username</span>
                            </div>
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl text-white transition-all duration-300 focus:outline-none"
                            style={{
                                borderColor: `${currentTheme.hex.primary}40`,
                                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                                borderWidth: '1px',
                                borderStyle: 'solid'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = currentTheme.hex.primary;
                                e.target.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                e.target.style.backgroundColor = 'rgba(31, 41, 55, 0.7)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = `${currentTheme.hex.primary}40`;
                                e.target.style.boxShadow = 'none';
                                e.target.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
                            }}
                            placeholder="Masukkan username"
                            required
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>
                                {errors.username}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-semibold mb-2.5" style={{ color: currentTheme.hex.secondary }}>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>Role</span>
                            </div>
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl text-white transition-all duration-300 focus:outline-none"
                            style={{
                                borderColor: `${currentTheme.hex.primary}40`,
                                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                                borderWidth: '1px',
                                borderStyle: 'solid'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = currentTheme.hex.primary;
                                e.target.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                e.target.style.backgroundColor = 'rgba(31, 41, 55, 0.7)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = `${currentTheme.hex.primary}40`;
                                e.target.style.boxShadow = 'none';
                                e.target.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
                            }}
                            required
                        >
                            <option value="Admin">Admin</option>
                            <option value="Mekanik">Mekanik</option>
                            <option value="Driver">Driver</option>
                        </select>
                        {errors.role && (
                            <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>
                                {errors.role}
                            </p>
                        )}
                    </div>

                    {/* Key */}
                    <div>
                        <label className="block text-sm font-semibold mb-2.5" style={{ color: currentTheme.hex.secondary }}>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span>Key</span>
                            </div>
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={formData.key}
                                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                className="flex-1 px-4 py-3.5 rounded-xl text-white font-mono transition-all duration-300 focus:outline-none"
                                style={{
                                    borderColor: `${currentTheme.hex.primary}40`,
                                    backgroundColor: 'rgba(31, 41, 55, 0.5)',
                                    borderWidth: '1px',
                                    borderStyle: 'solid'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = currentTheme.hex.primary;
                                    e.target.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                    e.target.style.backgroundColor = 'rgba(31, 41, 55, 0.7)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = `${currentTheme.hex.primary}40`;
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
                                }}
                                placeholder="Klik Generate Key"
                                required
                            />
                            <button
                                type="button"
                                onClick={generateRandomKey}
                                className="group/btn relative px-5 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-105 overflow-hidden"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                    boxShadow: `0 4px 15px -3px ${currentTheme.hex.primary}40`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = `0 4px 15px -3px ${currentTheme.hex.primary}60`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = `0 4px 15px -3px ${currentTheme.hex.primary}40`;
                                }}
                            >
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                
                                <span className="relative z-10 flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Generate</span>
                                </span>
                            </button>
                        </div>
                        {errors.key && (
                            <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>
                                {errors.key}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                            style={{
                                color: currentTheme.hex.secondary,
                                backgroundColor: `${currentTheme.hex.primary}15`,
                                border: `1px solid ${currentTheme.hex.primary}30`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}25`;
                                e.currentTarget.style.color = currentTheme.hex.primary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}15`;
                                e.currentTarget.style.color = currentTheme.hex.secondary;
                            }}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="group/btn flex-1 px-4 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 relative overflow-hidden"
                            style={{
                                background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                                boxShadow: `0 4px 15px -3px ${currentTheme.hex.primary}40`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = `0 4px 15px -3px ${currentTheme.hex.primary}60`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = `0 4px 15px -3px ${currentTheme.hex.primary}40`;
                            }}
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                            
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Simpan Perubahan</span>
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
