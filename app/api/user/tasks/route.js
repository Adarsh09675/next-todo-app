import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { verifyToken } from '@/lib/auth';
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

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        let query = { user: payload.userId };
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
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

        const { title, description, priority } = await req.json();

        // Validate priority (Robust normalization)
        const validPriorities = ['low', 'medium', 'high'];
        let normalizedPriority = priority;

        if (typeof priority === 'string') {
            normalizedPriority = priority.trim().toLowerCase();
        }

        const finalPriority = validPriorities.includes(normalizedPriority) ? normalizedPriority : 'medium';

        console.log('DEBUG PRIORITY:', { received: priority, normalized: normalizedPriority, final: finalPriority });

        if (!title) {
            return NextResponse.json({ message: "Title is required" }, { status: 400 });
        }

        await dbConnect();
        const newTask = await Task.create({
            title,
            description,
            priority: finalPriority,
            user: payload.userId,
        });

        return NextResponse.json({ task: newTask }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id, isCompleted, priority } = await req.json();

        await dbConnect();

        const updateData = {};
        if (typeof isCompleted !== 'undefined') updateData.isCompleted = isCompleted;
        if (priority) updateData.priority = priority;

        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user: payload.userId },
            updateData,
            { new: true }
        );

        if (!updatedTask) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ task: updatedTask }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
