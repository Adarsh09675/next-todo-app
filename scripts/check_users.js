const mongoose = require('mongoose');
const fs = require('fs');

const LOG_FILE = 'db_check.log';

function log(msg) {
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

log('STARTING CHECK at ' + new Date().toISOString());

const MONGODB_URI = 'mongodb://localhost:27017/todoNext';

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    isBlocked: Boolean,
}, { timestamps: true });

async function checkUsers() {
    try {
        log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        log('Connected to DB');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const users = await User.find({});
        log('--- Current Users ---');
        users.forEach(u => {
            log(`Email: ${u.email} | Name: ${u.name} | Role: ${u.role} | Blocked: ${u.isBlocked}`);
        });
        log('---------------------');

        process.exit(0);
    } catch (error) {
        log('Error: ' + error.message);
        process.exit(1);
    }
}

checkUsers();
