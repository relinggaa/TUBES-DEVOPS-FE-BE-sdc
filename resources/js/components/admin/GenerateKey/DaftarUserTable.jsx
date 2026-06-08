import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function DaftarUserTable({
    users,
    currentTheme,
    searchQuery,
    filterRole,
    handleSearchChange,
    handleFilterRoleChange,
    handleResetFilters,
    copyToClipboard,
    copiedKey,
    handleUpdate,
    handleDelete
}) {
    const [visibleKeys, setVisibleKeys] = useState(new Set());

    const toggleKeyVisibility = (userId) => {
        setVisibleKeys(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

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
                className="relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 backdrop-blur-2xl rounded-3xl border shadow-2xl transition-all duration-500 overflow-hidden"
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
                    className="absolute top-0 left-0 w-24 h-24 rounded-tl-3xl"
                    style={{
                        background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}10, transparent)`
                    }}
                ></div>
                <div 
                    className="absolute bottom-0 right-0 w-24 h-24 rounded-br-3xl"
                    style={{
                        background: `linear-gradient(to top left, ${currentTheme.hex.primary}10, transparent)`
                    }}
                ></div>
                
                {/* Gradient Overlay */}
                <div 
                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl animate-pulse"
                    style={{
                        backgroundColor: currentTheme.hex.primary,
                        opacity: 0.05
                    }}
                ></div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Table Header */}
                <div 
                    className="px-6 py-4 border-b"
                    style={{ borderColor: `${currentTheme.hex.primary}33` }}
                >
                    <div className="flex items-center space-x-3">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: `linear-gradient(to bottom right, ${currentTheme.hex.primary}20, ${currentTheme.hex.secondary}20)`,
                                border: `1px solid ${currentTheme.hex.primary}30`
                            }}
                        >
                            <svg className="w-5 h-5" style={{ color: currentTheme.hex.secondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Daftar User</h2>
                            <p className="text-sm" style={{ color: `${currentTheme.hex.secondary}B3` }}>
                                {users.total || 0} user aktif
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Search and Filter */}
                <div 
                    className="px-6 py-4 border-b"
                    style={{ borderColor: `${currentTheme.hex.primary}33` }}
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg 
                                    className="w-5 h-5" 
                                    style={{ color: `${currentTheme.hex.secondary}60` }}
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Cari username atau key..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300 focus:outline-none placeholder:opacity-60"
                                style={{
                                    backgroundColor: `${currentTheme.hex.primary}10`,
                                    border: `1px solid ${currentTheme.hex.primary}30`,
                                    color: currentTheme.hex.secondary,
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = currentTheme.hex.primary;
                                    e.target.style.backgroundColor = `${currentTheme.hex.primary}15`;
                                    e.target.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = `${currentTheme.hex.primary}30`;
                                    e.target.style.backgroundColor = `${currentTheme.hex.primary}10`;
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        
                        {/* Filter Role */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg 
                                    className="w-5 h-5" 
                                    style={{ color: `${currentTheme.hex.secondary}60` }}
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </div>
                            <select
                                value={filterRole}
                                onChange={(e) => handleFilterRoleChange(e.target.value)}
                                className="pl-10 pr-8 py-2.5 rounded-xl text-sm transition-all duration-300 focus:outline-none appearance-none cursor-pointer"
                                style={{
                                    backgroundColor: `${currentTheme.hex.primary}10`,
                                    border: `1px solid ${currentTheme.hex.primary}30`,
                                    color: currentTheme.hex.secondary,
                                    minWidth: '150px'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = currentTheme.hex.primary;
                                    e.target.style.backgroundColor = `${currentTheme.hex.primary}15`;
                                    e.target.style.boxShadow = `0 0 0 3px ${currentTheme.hex.primary}20`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = `${currentTheme.hex.primary}30`;
                                    e.target.style.backgroundColor = `${currentTheme.hex.primary}10`;
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <option value="all" style={{ backgroundColor: '#111827', color: currentTheme.hex.secondary }}>Semua Role</option>
                                <option value="Admin" style={{ backgroundColor: '#111827', color: currentTheme.hex.secondary }}>Admin</option>
                                <option value="Mekanik" style={{ backgroundColor: '#111827', color: currentTheme.hex.secondary }}>Mekanik</option>
                                <option value="Driver" style={{ backgroundColor: '#111827', color: currentTheme.hex.secondary }}>Driver</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg 
                                    className="w-4 h-4" 
                                    style={{ color: currentTheme.hex.secondary }}
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Clear Filters Button */}
                        {(searchQuery || filterRole !== 'all') && (
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                                style={{
                                    backgroundColor: `${currentTheme.hex.primary}15`,
                                    border: `1px solid ${currentTheme.hex.primary}30`,
                                    color: currentTheme.hex.secondary
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}25`;
                                    e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}15`;
                                    e.currentTarget.style.borderColor = `${currentTheme.hex.primary}30`;
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Results Count */}
                    {(searchQuery || filterRole !== 'all') && (
                        <div className="mt-3 text-xs" style={{ color: `${currentTheme.hex.secondary}B3` }}>
                            Menampilkan {users.data?.length || 0} dari {users.total || 0} user yang sesuai
                        </div>
                    )}
                </div>
                
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr 
                                className="border-b sticky top-0 z-10"
                                style={{ 
                                    borderColor: `${currentTheme.hex.primary}33`,
                                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: currentTheme.hex.secondary }}>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Username</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: currentTheme.hex.secondary }}>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>Role</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider" style={{ color: currentTheme.hex.secondary }}>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        <span>Key</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider" style={{ color: currentTheme.hex.secondary }}>
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {!users.data || users.data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center">
                                        <p className="text-gray-400">
                                            {searchQuery || filterRole !== 'all' 
                                                ? 'Tidak ada user yang sesuai dengan filter' 
                                                : 'Tidak ada user yang memiliki key'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user, index) => {
                                    const UserAvatar = ({ user, theme }) => {
                                        const [imageError, setImageError] = useState(false);
                                        
                                        if (user.gambar && user.gambar.startsWith('users/') && !imageError) {
                                            return (
                                                <div 
                                                    className="w-10 h-10 rounded-xl overflow-hidden border-2 flex-shrink-0"
                                                    style={{
                                                        borderColor: `${theme.hex.primary}40`,
                                                        boxShadow: `0 2px 8px ${theme.hex.primary}20`
                                                    }}
                                                >
                                                    <img 
                                                        src={`/storage/${user.gambar}`} 
                                                        alt={user.username}
                                                        className="w-full h-full object-cover"
                                                        onError={() => setImageError(true)}
                                                    />
                                                </div>
                                            );
                                        }
                                        
                                        return (
                                            <div 
                                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                                style={{
                                                    background: `linear-gradient(to bottom right, ${theme.hex.primary}, ${theme.hex.secondary})`,
                                                    color: 'white',
                                                    boxShadow: `0 2px 8px ${theme.hex.primary}20`
                                                }}
                                            >
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                        );
                                    };
                                    
                                    return (
                                <tr 
                                    key={user.id}
                                    className="group/row border-b transition-all duration-300"
                                    style={{ 
                                        borderColor: `${currentTheme.hex.primary}20`,
                                        animationDelay: `${index * 50}ms`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}10`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <UserAvatar user={user} theme={currentTheme} />
                                            <span className="text-white font-medium">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span 
                                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 group-hover/row:scale-105"
                                            style={{
                                                backgroundColor: `${currentTheme.hex.primary}20`,
                                                color: currentTheme.hex.secondary,
                                                border: `1px solid ${currentTheme.hex.primary}40`,
                                                boxShadow: `0 2px 8px ${currentTheme.hex.primary}20`
                                            }}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {visibleKeys.has(user.id) ? (
                                                <>
                                                    <code 
                                                        className="px-3 py-1.5 rounded-lg text-sm font-mono transition-all duration-300 group-hover/row:scale-105 cursor-pointer"
                                                        style={{
                                                            backgroundColor: `${currentTheme.hex.primary}10`,
                                                            color: currentTheme.hex.secondary,
                                                            border: `1px solid ${currentTheme.hex.primary}30`
                                                        }}
                                                        onClick={() => {
                                                            copyToClipboard(user.key, user.id);
                                                            toggleKeyVisibility(user.id);
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}20`;
                                                            e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}10`;
                                                            e.currentTarget.style.borderColor = `${currentTheme.hex.primary}30`;
                                                        }}
                                                    >
                                                        {user.key}
                                                    </code>
                                                    {copiedKey === user.id && (
                                                        <span 
                                                            className="text-xs font-semibold animate-pulse"
                                                            style={{ color: currentTheme.hex.secondary }}
                                                        >
                                                            ✓ Copied!
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => toggleKeyVisibility(user.id)}
                                                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 group-hover/row:scale-105 flex items-center space-x-2"
                                                    style={{
                                                        backgroundColor: `${currentTheme.hex.primary}15`,
                                                        color: currentTheme.hex.secondary,
                                                        border: `1px solid ${currentTheme.hex.primary}30`
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}25`;
                                                        e.currentTarget.style.borderColor = currentTheme.hex.primary;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}15`;
                                                        e.currentTarget.style.borderColor = `${currentTheme.hex.primary}30`;
                                                    }}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>Klik untuk melihat</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleUpdate(user)}
                                                className="group/btn px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                                                style={{
                                                    color: currentTheme.hex.secondary,
                                                    backgroundColor: `${currentTheme.hex.primary}15`
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
                                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span>Update</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="group/btn px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                                                style={{
                                                    color: currentTheme.hex.secondary,
                                                    backgroundColor: `${currentTheme.hex.primary}15`
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
                                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div 
                        className="px-6 py-4 border-t flex items-center justify-between"
                        style={{ borderColor: `${currentTheme.hex.primary}33` }}
                    >
                        <div className="text-sm" style={{ color: `${currentTheme.hex.secondary}B3` }}>
                            Menampilkan {((users.current_page - 1) * 5) + 1} sampai {Math.min(users.current_page * 5, users.total)} dari {users.total} user
                        </div>
                        <div className="flex items-center space-x-2">
                            {users.links.map((link, index) => {
                                if (link.url === null) {
                                    return (
                                        <span
                                            key={index}
                                            className="px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                                            style={{
                                                color: `${currentTheme.hex.secondary}40`,
                                                backgroundColor: `${currentTheme.hex.primary}10`
                                            }}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                
                                const isActive = link.active;
                                
                                const handlePaginationClick = (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (link.url) {
                                        try {
                                            const urlObj = new URL(link.url);
                                            const path = urlObj.pathname + urlObj.search;
                                            router.visit(path, {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: ['users', 'filters']
                                            });
                                        } catch {
                                            const path = link.url.startsWith('/') ? link.url : '/' + link.url;
                                            router.visit(path, {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: ['users', 'filters']
                                            });
                                        }
                                    }
                                };
                                
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={handlePaginationClick}
                                        className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                                        style={{
                                            color: isActive ? currentTheme.hex.primary : currentTheme.hex.secondary,
                                            backgroundColor: isActive 
                                                ? `${currentTheme.hex.primary}25` 
                                                : `${currentTheme.hex.primary}15`,
                                            border: isActive 
                                                ? `1px solid ${currentTheme.hex.primary}40` 
                                                : `1px solid ${currentTheme.hex.primary}20`,
                                            boxShadow: isActive 
                                                ? `0 2px 8px ${currentTheme.hex.primary}30` 
                                                : 'none',
                                            pointerEvents: 'auto',
                                            zIndex: 10
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}25`;
                                                e.currentTarget.style.borderColor = `${currentTheme.hex.primary}40`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.backgroundColor = `${currentTheme.hex.primary}15`;
                                                e.currentTarget.style.borderColor = `${currentTheme.hex.primary}20`;
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
