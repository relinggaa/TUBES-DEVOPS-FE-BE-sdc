import React, { useState, useMemo, useEffect, useRef } from 'react';
import LayoutAdmin from '../../layout/LayoutAdmin';
import { useTheme } from '../../contexts/ThemeContext';
import { usePage, router } from '@inertiajs/react';
import DaftarUserTable from '../../components/admin/GenerateKey/DaftarUserTable';
import Header from '../../components/admin/GenerateKey/Header';
import CreateModal from '../../components/admin/GenerateKey/CreateModal';
import Modal from '../../components/admin/GenerateKey/Modal';
import DeleteModal from '../../components/admin/DeleteModal';
import { toast } from 'react-toastify';

export default function GenerateKey({ users = { data: [], links: [], current_page: 1, last_page: 1, total: 0 }, filters = { search: '', filter_role: 'all' } }) {
    const { currentTheme } = useTheme();
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        role: 'Admin',
        key: ''
    });
    const [copiedKey, setCopiedKey] = useState(null);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [filterRole, setFilterRole] = useState(filters.filter_role || 'all');
    const searchTimeoutRef = useRef(null);

    const generateRandomKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = '';
        for (let i = 0; i < 8; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, key });
    };

    const copyToClipboard = (key, id) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});


        setIsModalOpen(false);
        const previousFormData = { ...formData };
        setFormData({ username: '', role: 'Admin', key: '' });

        router.post('/admin/generate-key', previousFormData, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {

            },
            onError: (errors) => {
                setErrors(errors);
                setIsModalOpen(true);
                setFormData(previousFormData);
            }
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ username: '', role: 'Admin', key: '' });
        setErrors({});
    };

    const handleUpdate = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            role: user.role,
            key: user.key
        });
        setIsUpdateModalOpen(true);
        setErrors({});
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        if (!editingUser) return;

        setIsUpdateModalOpen(false);
        const previousFormData = { ...formData };
        const previousEditingUser = editingUser;

        router.put(`/admin/generate-key/${editingUser.id}`, previousFormData, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setEditingUser(null);
                setFormData({ username: '', role: 'Admin', key: '' });
            },
            onError: (errors) => {
                setErrors(errors);
                setIsUpdateModalOpen(true);
                setEditingUser(previousEditingUser);
                setFormData(previousFormData);
            }
        });
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setEditingUser(null);
        setFormData({ username: '', role: 'Admin', key: '' });
        setErrors({});
    };

    const handleDelete = (id) => {
        setDeletingUserId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingUserId) {
            router.delete(`/admin/generate-key/${deletingUserId}`, {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setDeletingUserId(null);
                }
            });
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setDeletingUserId(null);
    };


    useEffect(() => {
        if (filters.search !== undefined) {
            setSearchQuery(filters.search);
        }
        if (filters.filter_role !== undefined) {
            setFilterRole(filters.filter_role);
        }
    }, [filters]);

   
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: `1px solid ${currentTheme.hex.primary}40`,
                    borderRadius: '12px',
                    boxShadow: `0 4px 12px ${currentTheme.hex.primary}30`
                },
                progressStyle: {
                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`
                }
            });
        }
    }, [flash?.success, currentTheme]);


    const applyFilters = (search, role, page = 1) => {
        const params = {};
        if (search && search.trim() !== '') {
            params.search = search.trim();
        }
        if (role && role !== 'all') {
            params.filter_role = role;
        }

        params.page = page;

        router.get('/admin/generate-key', params, {
            preserveState: true,
            preserveScroll: true,
            only: ['users', 'filters'],
            replace: true
        });
    };


    const handleSearchChange = (value) => {
        setSearchQuery(value);


        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }


        searchTimeoutRef.current = setTimeout(() => {
            applyFilters(value, filterRole);
        }, 500);
    };


    const handleFilterRoleChange = (value) => {
        setFilterRole(value);
        applyFilters(searchQuery, value);
    };


    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterRole('all');
        applyFilters('', 'all');
    };

    return (
        <LayoutAdmin>
            <div className="space-y-8">
                {/* Header Card */}
                <Header
                    currentTheme={currentTheme}
                    onAddUserClick={() => setIsModalOpen(true)}
                />

                {/* Table Card */}
                <DaftarUserTable
                    users={users}
                    currentTheme={currentTheme}
                    searchQuery={searchQuery}
                    filterRole={filterRole}
                    handleSearchChange={handleSearchChange}
                    handleFilterRoleChange={handleFilterRoleChange}
                    handleResetFilters={handleResetFilters}
                    copyToClipboard={copyToClipboard}
                    copiedKey={copiedKey}
                    handleUpdate={handleUpdate}
                    handleDelete={handleDelete}
                />

                {/* Create Modal */}
                <CreateModal
                    isOpen={isModalOpen}
                    currentTheme={currentTheme}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleSubmit={handleSubmit}
                    handleClose={handleCloseModal}
                    generateRandomKey={generateRandomKey}
                />

                {/* Update Modal */}
                <Modal
                    isOpen={isUpdateModalOpen}
                    currentTheme={currentTheme}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleSubmit={handleUpdateSubmit}
                    handleClose={handleCloseUpdateModal}
                    generateRandomKey={generateRandomKey}
                />

                {/* Delete Modal */}
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    currentTheme={currentTheme}
                    title="Hapus User"
                    message="Apakah Anda yakin ingin menghapus user ini?"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            </div>
        </LayoutAdmin>
    );
}
