import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(payload.userId).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // ROLE SYNC CHECK
        // If the role in the DB is different from the token, refresh the token
        if (user.role !== payload.role) {
            console.log(`Role mismatch detected for ${user.email}. Token: ${payload.role}, DB: ${user.role}. Refreshing token.`);

            const newToken = await signToken({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            });

            cookieStore.set('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Profile error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
