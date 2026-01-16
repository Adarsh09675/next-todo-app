import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const payload = await verifyToken(token);

        if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        let query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Populate user details to know who owns the task
        const tasks = await Task.find(query).sort({ createdAt: -1 }).populate('user', 'name email');

        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const payload = await verifyToken(token);

        if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Extract task ID from URL query or body? DELETE body is discouraged but Next.js supports it. 
        // actually, pure route.js for DELETE usually handles single resource or uses query params. 
        // Let's use body for bulk or ID, or better: use query param 'id'
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Task ID required' }, { status: 400 });
        }

        await dbConnect();
        await Task.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
