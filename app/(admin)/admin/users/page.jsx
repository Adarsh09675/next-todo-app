'use client';

import { useState, useEffect } from 'react';
import UserTable from '@/components/UserTable';
import { useAuth } from '@/components/AuthProvider';

export default function AdminUsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId, isBlocked) => {
        try {
            const res = await fetch('/api/admin/block-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isBlocked }),
            });
            if (res.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, isBlocked } : u));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const res = await fetch('/api/admin/update-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newRole }),
            });
            if (res.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-white">User Management</h1>
            <UserTable
                users={users}
                onBlock={handleBlockUser}
                onRoleUpdate={handleRoleUpdate}
                currentUserRole={user?.role}
            />
        </div>
    );
}
