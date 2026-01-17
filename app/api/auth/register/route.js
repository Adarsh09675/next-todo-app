import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Use supabaseAdmin (service role) to key user creation if we want to bypass email confirmation 
        // or just use public client if we want flow. Standard is public client usually, 
        // but let's use the one we set up. 
        // Actually, for normal signup, we should use the anon key client usually, 
        // but here we are in an API route. 
        // Let's use the standard `signUp` from the anon client if possible, 
        // but if we want to avoid email confirmation blocking login immediately 
        // (if that's how the old app worked), we might need auto-confirm or similar.
        // The old app just created the user and let them log in. Supabase defaults to "Confirm Email".
        // Use supabaseAdmin.auth.admin.createUser if we want to pre-verify, 
        // OR just rely on project settings.
        // Let's use the standard signUp and if they need email confirm, they need it.
        // BUT, better user experience matches the old app: auto-login or immediate access.
        // I will use `supabaseAdmin` to create use with email_confirm: true if available, 
        // or just use standard signUp and assume user handles it.
        // Safest migration path: Use admin to create user so verified is true.

        // Note: We need to import supabase from lib, but we might need a fresh client or admin client.
        // I'll reuse the export.

        if (!supabaseAdmin) {
            return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
        }

        const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role: 'user' }
        });

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        return NextResponse.json(
            { message: 'User created successfully', user: { id: user.user.id, email: user.user.email, name: user.user.user_metadata.name } },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
