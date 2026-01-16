import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const payload = await verifyToken(token);

        if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { userId, newRole } = await req.json();

        if (!['user', 'admin'].includes(newRole)) {
            return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
        }

        await dbConnect();
        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (targetUser.role === 'superadmin') {
            return NextResponse.json({ message: 'Cannot modify Superadmin' }, { status: 403 });
        }

        // "admin can assign a user as admin... but the admin can not revert after making any user as a admin"
        // Case: Admin trying to Demote Admin -> User
        if (payload.role === 'admin' && targetUser.role === 'admin' && newRole === 'user') {
            return NextResponse.json({ message: 'Admins cannot demote other Admins' }, { status: 403 });
        }

        // Case: Admin trying to Promote User -> Admin (Allowed)

        targetUser.role = newRole;
        await targetUser.save();

        return NextResponse.json({ message: `User role updated to ${newRole}` }, { status: 200 });
    } catch (error) {
        console.error('Role update error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
