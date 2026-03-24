import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes placeholder
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lumina API is running' });
});

// Setup Port
const PORT = process.env.PORT || 5000;

// Socket.io connection handling
io.on('connection', (socket) => {
    socket.on('setup', (userId) => {
        socket.join(userId);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, content }, callback) => {
        try {
            const msg = await Message.create({ sender: senderId, receiver: receiverId, content });
            socket.in(receiverId).emit('receiveMessage', msg);
            if(callback) callback(msg);
        } catch (err) { }
    });

    socket.on('deleteMessage', async ({ messageId, receiverId }) => {
        try {
            await Message.findByIdAndDelete(messageId);
            socket.in(receiverId).emit('messageDeleted', messageId);
        } catch (err) { }
    });

    socket.on('clearChat', async ({ senderId, receiverId }) => {
        try {
            await Message.deleteMany({
                $or: [
                    { sender: senderId, receiver: receiverId },
                    { sender: receiverId, receiver: senderId }
                ]
            });
            socket.in(receiverId).emit('chatCleared', { senderId });
        } catch (err) { }
    });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lumina');
    console.log('MongoDB connection SUCCESS');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('MongoDB connection FAIL', error);
    process.exit(1);
  }
};

connectDB();
// Restart trigger
