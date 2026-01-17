'use client';

import { Shield, Ban, CheckCircle, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export default function UserTable({ users, onBlock, onRoleUpdate, currentUserRole }) {
    const [loadingId, setLoadingId] = useState(null);

    const handleBlock = async (userId, currentStatus, targetUserRole) => {
        // Restriction: Admin cannot block another Admin
        if (currentUserRole === 'admin' && targetUserRole === 'admin') {
            alert("Admin can't be blocked by admin. You can block only users.");
            return;
        }

        setLoadingId(userId);
        await onBlock(userId, !currentStatus);
        setLoadingId(null);
    };

    const handleRoleChange = async (userId, newRole) => {
        setLoadingId(userId);
        await onRoleUpdate(userId, newRole);
        setLoadingId(null);
    };

    const canManageRole = (targetUser) => {
        if (currentUserRole === 'superadmin') return targetUser.role !== 'superadmin';
        if (currentUserRole === 'admin') return targetUser.role === 'user';
        return false;
    };

    const canBlock = (targetUser) => {
        if (targetUser.role === 'superadmin') return false;
        return true;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/50">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800 text-gray-200 font-medium">
                    <tr>
                        <th className="px-6 py-4">Name / Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {users.map((user) => (
                        <tr key={user.id || user._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">{user.name}</span>
                                    <span className="text-xs text-gray-500">{user.email}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold
                  ${user.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' :
                                        user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}
                `}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {user.is_blocked ? (
                                    <span className="flex items-center gap-1 text-red-400"><Ban size={14} /> Blocked</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-green-400"><CheckCircle size={14} /> Active</span>
                                )}
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                                {/* Block/Unblock */}
                                {canBlock(user) && (
                                    <button
                                        onClick={() => handleBlock(user.id || user._id, user.is_blocked, user.role)}
                                        disabled={loadingId === (user.id || user._id)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                        ${user.is_blocked ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}
                    `}
                                    >
                                        {user.is_blocked ? 'Unblock' : 'Block'}
                                    </button>
                                )}

                                {/* Role Promotion - Quick Actions */}
                                {canManageRole(user) && (
                                    <div className="flex gap-1">
                                        {user.role === 'user' && (
                                            <button
                                                onClick={() => handleRoleChange(user.id || user._id, 'admin')}
                                                disabled={loadingId === (user.id || user._id)}
                                                className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                            >
                                                Promote to Admin
                                            </button>
                                        )}
                                        {user.role === 'admin' && currentUserRole === 'superadmin' && (
                                            <button
                                                onClick={() => handleRoleChange(user.id || user._id, 'user')}
                                                disabled={loadingId === (user.id || user._id)}
                                                className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                                            >
                                                Demote to User
                                            </button>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
