const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Helper to run: node scripts/seed.js

const MONGODB_URI = 'mongodb://localhost:27017/todoNext';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Drop collection to clear old indexes (like unique username) if it exists
        try {
            await User.collection.drop();
            console.log('Dropped existing Users collection');
        } catch (e) {
            if (e.code === 26) console.log('Collection does not exist, skipping drop');
            else throw e;
        }

        // Create Superadmin
        const superAdminEmail = 'superadmin@example.com';
        const hashedPassword = await bcrypt.hash('supersecret', 10);
        await User.create({
            name: 'Super Admin',
            email: superAdminEmail,
            password: hashedPassword,
            role: 'superadmin',
        });
        console.log(`Superadmin created: ${superAdminEmail} / supersecret`);

        // Create Normal User
        const userEmail = 'user@example.com';
        const hashedUserPassword = await bcrypt.hash('user123', 10);
        await User.create({
            name: 'John Doe',
            email: userEmail,
            password: hashedUserPassword,
            role: 'user',
        });
        console.log(`User created: ${userEmail} / user123`);

        // Create Admin User
        const adminEmail = 'admin@example.com';
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: hashedAdminPassword,
            role: 'admin',
        });
        console.log(`Admin created: ${adminEmail} / admin123`);

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
