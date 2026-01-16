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

        const { userId, isBlocked } = await req.json();

        await dbConnect();
        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Protection: Admin cannot block Superadmin or another Admin (optional, but good practice, though requirement says "any user")
        // Requirement: "admin ,admin and superadmin can block adn unblock any user"
        // Let's assume Admin shouldn't block Superadmin.
        if (targetUser.role === 'superadmin') {
            return NextResponse.json({ message: 'Cannot block Superadmin' }, { status: 403 });
        }

        targetUser.isBlocked = isBlocked;
        await targetUser.save();

        return NextResponse.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
