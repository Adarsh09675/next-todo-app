import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const payload = await verifyToken(token);

        if (!payload || payload.role !== 'superadmin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
        const activeUsers = await User.countDocuments({ isBlocked: false });
        const totalTasks = await Task.countDocuments();

        return NextResponse.json({
            stats: {
                totalUsers,
                adminCount,
                activeUsers,
                totalTasks
            }
        }, { status: 200 });

    } catch (error) {
        console.error('System stats error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
