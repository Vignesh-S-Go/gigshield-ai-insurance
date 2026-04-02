import { Plus, Trash2, Edit2, Users, Shield, User, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { authApi } from '../api/authApi';
import { formatDate } from '../utils/helpers';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        role: 'worker'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await authApi.getUsers();
            setUsers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                await authApi.updateUser(editingUser.id, formData);
            } else {
                await authApi.createUser(formData);
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ name: '', phone: '', email: '', role: 'worker' });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save user');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await authApi.deleteUser(id);
            fetchUsers();
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            phone: user.phone.replace('+91 ', ''),
            email: user.email || '',
            role: user.role
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ name: '', phone: '', email: '', role: 'worker' });
        setError('');
        setShowModal(true);
    };

    const getRoleBadge = (role) => {
        if (role === 'admin') {
            return <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">Admin</span>;
        }
        return <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">Worker</span>;
    };

    return (
        <div className="animate-fade-in">
            <Header title="User Management" subtitle={`${users.length} registered users`} />

            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/40">
                            <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-dark-800 dark:text-dark-200">All Users</h2>
                            <p className="text-xs text-dark-400">Manage platform access</p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-100 dark:border-dark-700">
                                    <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-3">User</th>
                                    <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-3">Phone</th>
                                    <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-3">Email</th>
                                    <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-3">Role</th>
                                    <th className="text-left text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-3">Created</th>
                                    <th className="text-right text-xs font-semibold text-dark-400 uppercase tracking-wider px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-50 dark:divide-dark-800">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {user.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="font-semibold text-dark-800 dark:text-dark-200">{user.name || 'Unnamed'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-400">{user.phone}</td>
                                        <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-400">{user.email || '-'}</td>
                                        <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                                        <td className="px-4 py-3 text-sm text-dark-500">{formatDate(user.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-400 hover:text-primary-500"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-400 hover:text-danger-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="text-center py-12 text-dark-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No users found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Edit User' : 'Add New User'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="Enter full name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            className="input-field"
                            placeholder="9876543210"
                            disabled={!!editingUser}
                        />
                        {!editingUser && <p className="text-xs text-dark-500 mt-1">OTP will be sent to this number for login</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-1">Email (Optional)</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-field"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'worker' })}
                                className={`p-3 rounded-xl border-2 transition-all ${
                                    formData.role === 'worker'
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-dark-200 dark:border-dark-700'
                                }`}
                            >
                                <User className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-sm font-semibold">Worker</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'admin' })}
                                className={`p-3 rounded-xl border-2 transition-all ${
                                    formData.role === 'admin'
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-dark-200 dark:border-dark-700'
                                }`}
                            >
                                <Shield className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-sm font-semibold">Admin</p>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-3 rounded-xl bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary"
                        >
                            {editingUser ? 'Update' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
