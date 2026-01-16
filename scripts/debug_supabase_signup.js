
const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const supabaseUrl = 'https://dhjrmzqawdzahuyscwjg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoanJtenFhd2R6YWh1eXNjd2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NTQxMzIsImV4cCI6MjA4NDEzMDEzMn0.foEQhaTTK4ZcCqoMdejgM44kaxc9daiKQvm73rUAxcY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
    console.log('Attempting signup...');
    const email = `test_debug_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: 'Debug User'
                }
            }
        });

        if (error) {
            console.error('Signup FAILED:');
            console.error(error);
        } else {
            console.log('Signup SUCCESS!');
            console.log('User ID:', data.user?.id);
        }
    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

testSignup();
