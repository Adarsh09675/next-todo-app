const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { SignJWT } = require('jose');

const MONGODB_URI = 'mongodb://localhost:27017/todoNext';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
}, { timestamps: true });

async function diagnose() {
    console.log('--- START DIAGNOSIS ---');

    // 1. DB Connect
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('[PASS] DB Connection');
    } catch (e) {
        console.error('[FAIL] DB Connection', e.message);
        process.exit(1);
    }

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // 2. Test Admin Account
    const email = 'admin@example.com';
    const password = 'admin123';

    const user = await User.findOne({ email });
    if (!user) {
        console.error(`[FAIL] User ${email} NOT FOUND in DB`);
        process.exit(1);
    }
    console.log(`[PASS] User ${email} found (Role: ${user.role})`);

    // 3. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.error(`[FAIL] Password mismatch for ${email}. Resetting...`);
        // Attempt fix
        const newHash = await bcrypt.hash(password, 10);
        user.password = newHash;
        await user.save();
        console.log(`[FIX] Password reset to '${password}'`);
    } else {
        console.log('[PASS] Password hash matches');
    }

    // 4. Test Token Gen
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);
        console.log('[PASS] Token generation success');
    } catch (e) {
        console.error('[FAIL] Token generation', e.message);
    }

    // 5. Test HTTP Endpoint
    try {
        console.log('Testing HTTP Login API...');
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.status === 200) {
            console.log('[PASS] HTTP Login API returned 200 OK');
            const data = await res.json();
            console.log('Login Response:', JSON.stringify(data.user));
        } else {
            console.error(`[FAIL] HTTP Login API returned status: ${res.status}`);
            const text = await res.text();
            console.log('Response:', text);
        }
    } catch (e) {
        console.error('[FAIL] HTTP Check failed (Is server running?)', e.message);
    }

    console.log('--- END DIAGNOSIS ---');
    process.exit(0);
}

diagnose();
