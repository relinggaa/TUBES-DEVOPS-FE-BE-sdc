import React from 'react';

export default function DeleteModal({
    isOpen,
    currentTheme,
    title,
    message,
    onConfirm,
    onCancel
}) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={onCancel}
        >
            <div 
                className="relative w-full max-w-md bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 backdrop-blur-2xl rounded-3xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                style={{
                    borderColor: `#ef444440`,
                    boxShadow: `0 25px 50px -12px #ef444450`
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Glow */}
                <div 
                    className="absolute -inset-0.5 rounded-3xl blur-xl opacity-50 -z-10"
                    style={{
                        background: `linear-gradient(to right, #ef444440, #dc262640)`
                    }}
                ></div>
                
                {/* Corner Accents */}
                <div 
                    className="absolute top-0 left-0 w-24 h-24 rounded-tl-3xl"
                    style={{
                        background: `linear-gradient(to bottom right, #ef444415, transparent)`
                    }}
                ></div>
                
                {/* Content */}
                <div className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: '#ef444420'
                            }}
                        >
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white text-center mb-3">
                        {title || 'Konfirmasi Hapus'}
                    </h2>

                    {/* Message */}
                    <p className="text-gray-300 text-center mb-6">
                        {message || 'Apakah Anda yakin ingin menghapus item ini?'}
                    </p>

                    {/* Warning Text */}
                    <div 
                        className="p-3 rounded-xl mb-6"
                        style={{
                            backgroundColor: '#ef444410',
                            border: '1px solid #ef444430'
                        }}
                    >
                        <p className="text-sm text-red-300 text-center">
                            ⚠️ Tindakan ini tidak dapat dibatalkan
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 border"
                            style={{
                                color: currentTheme.hex.secondary,
                                borderColor: `${currentTheme.hex.primary}40`,
                                backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}20`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg"
                            style={{
                                background: 'linear-gradient(to right, #ef4444, #dc2626)',
                                boxShadow: '0 10px 25px -5px #ef444440'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 10px 25px -5px #ef444460';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 10px 25px -5px #ef444440';
                            }}
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}









