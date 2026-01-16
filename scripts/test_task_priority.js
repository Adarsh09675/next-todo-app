const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
    title: String,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
});

// Mock connection string if not present in env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/next-todo-app';

async function testPriority() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Note: We might define the model differently if it is already compiled in the app context, 
        // but here we are running standalone.
        // To strictly match the app, we should probably import the model file if we could use ES modules here,
        // but this script is CommonJS. Let's define a temporary model to see generic mongoose behavior
        // OR try to mimic the app logic.

        // Actually, let's use the actual collection.
        const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

        console.log('Creating High Priority Task...');
        const highTask = await Task.create({ title: 'Test High', priority: 'high' });
        console.log('High Task created:', highTask);

        console.log('Creating Low Priority Task...');
        const lowTask = await Task.create({ title: 'Test Low', priority: 'low' });
        console.log('Low Task created:', lowTask);

        if (highTask.priority === 'high' && lowTask.priority === 'low') {
            console.log('SUCCESS: Priorities are saved correctly.');
        } else {
            console.log('FAILURE: Priorities NOT saved correctly.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testPriority();
