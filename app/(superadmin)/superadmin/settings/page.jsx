'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, CheckSquare, Activity } from 'lucide-react';

export default function SystemSettingsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/superadmin/system-stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-white">Loading system stats...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2 text-white">System Settings & Stats</h1>
            <p className="text-gray-400 mb-8">Overview of system health and metrics</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Admins"
                    value={stats?.adminCount || 0}
                    icon={Shield}
                    color="purple"
                />
                <StatCard
                    title="Active Users"
                    value={stats?.activeUsers || 0}
                    icon={Activity}
                    color="green"
                />
                <StatCard
                    title="Total Tasks"
                    value={stats?.totalTasks || 0}
                    icon={CheckSquare}
                    color="pink"
                />
            </div>

            {/* Placeholder for actual settings */}
            <div className="mt-12 p-8 border border-gray-800 rounded-xl bg-gray-900/30">
                <h2 className="text-xl font-bold mb-4 text-gray-300">System Configuration</h2>
                <p className="text-gray-500">Global system settings will appear here...</p>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    const colorClasses = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        green: "bg-green-500/10 text-green-400 border-green-500/20",
        pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    };

    return (
        <div className={`p-6 rounded-xl border ${colorClasses[color]} backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium opacity-80">{title}</span>
                <Icon size={20} />
            </div>
            <div className="text-3xl font-bold">{value}</div>
        </div>
    );
}
