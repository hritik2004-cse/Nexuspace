require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        require('./models/Workspace');
        require('./models/Channel');

        
        const randomEmail = `user${Date.now()}@example.com`;
        const registerRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Bob', email: randomEmail, password: 'password123' })
        });
        const registerData = await registerRes.json();
        const token = registerData.token;
        console.log("REGISTER TOKEN:", token ? "YES" : "NO", registerData);

        const res = await fetch('http://localhost:5000/api/channels/findOrCreate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'general' })
        });
        
        const data = await res.json();
        console.log("HTTP STATUS:", res.status);
        console.log("RESPONSE:", data);
    } catch(err) {
        console.log("ERROR:", err.message);
    } finally {
        mongoose.disconnect();
    }
})();
