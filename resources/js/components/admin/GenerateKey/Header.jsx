import React from 'react';
import PageHeader from '../PageHeader';

export default function Header({ currentTheme, onAddUserClick }) {
    return (
        <PageHeader
            currentTheme={currentTheme}
            title="Generate Key"
            subtitle="Buat dan kelola kunci akses untuk user dengan mudah dan aman"
            buttonText="Tambah User"
            onButtonClick={onAddUserClick}
            badgeText="Active"
            showBadge={true}
        />
    );
}
