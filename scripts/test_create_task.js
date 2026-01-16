const http = require('http');

function request(path, method, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.headers['set-cookie']) {
                    resolve({ headers: res.headers, body: JSON.parse(data || '{}') });
                } else {
                    try {
                        resolve({ headers: res.headers, body: JSON.parse(data || '{}') });
                    } catch (e) {
                        resolve({ headers: res.headers, body: data });
                    }
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testCreateTask() {
    try {
        console.log('1. Registering/Login...');
        const email = `test_prio_${Date.now()}@test.com`;
        const password = 'password123';

        await request('/api/auth/register', 'POST', { name: 'Prio Test', email, password });
        const loginRes = await request('/api/auth/login', 'POST', { email, password });

        const cookie = loginRes.headers['set-cookie'];
        if (!cookie) {
            console.error('Login failed (no cookie)');
            return;
        }

        console.log('2. Creating High Priority Task...');
        const createRes = await request('/api/user/tasks', 'POST', {
            title: 'High Prio HTTP',
            description: 'Testing via script',
            priority: 'high'
        }, { 'Cookie': cookie });

        console.log('Task:', createRes.body.task);

        if (createRes.body.task?.priority === 'high') {
            console.log('SUCCESS: Backend handles "high" correctly.');
        } else {
            console.log('FAILURE: Backend returned:', createRes.body.task?.priority);
        }

    } catch (e) {
        console.error(e);
    }
}

testCreateTask();
