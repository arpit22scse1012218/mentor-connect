const express = require('express');
const mongoose = require('mongoose');
const http = require('http')
const path = require('path');
const socketIo = require('socket.io');
const app = express();
const port = 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/mentorship_platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Routes
// Example route for messages
app.post('/messages', async (req, res) => {
    try {
        const { content, userId } = req.body;
        const message = new Message({ content, userId });
        await message.save();
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Example route for users
app.post('/users', async (req, res) => {
    try {
        const { username } = req.body;
        const user = new User({ username });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Handle chat message event
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
