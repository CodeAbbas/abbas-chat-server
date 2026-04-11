const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json()); 

// --- MONGODB CONNECTION & SCHEMA ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const messageSchema = new mongoose.Schema({
    senderId: String,
    targetUser: String,
    isAdmin: Boolean,
    text: String,
    origin: String,
    file: Object,
    createdAt: { type: Date, default: Date.now, expires: 15 * 24 * 60 * 60 } 
});
const Message = mongoose.model('Message', messageSchema);

// --- CLOUDINARY & MULTER CONFIG ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'chat_attachments', resource_type: 'auto' },
});

const parser = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.originalname.match(/\.(exe|bat|cmd|sh|msi|apk|bin)$/i)) {
            return cb(new Error('Dangerous file types are not allowed.'));
        }
        cb(null, true);
    }
});

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

app.get('/', (req, res) => { res.status(200).send('Render Server is Awake!'); });

app.post('/upload', (req, res) => {
    parser.single('file')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Upload failed', details: 'File is too large. Max 10MB.' });
            return res.status(400).json({ message: 'Upload failed', details: err.message });
        }
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        res.status(200).json({ url: req.file.path, filename: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size });
    });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const ADMIN_PWD = process.env.ADMIN_PASSWORD;
let currentAdminToken = null;

io.on('connection', (socket) => {
    
    // --- ADMIN HANDSHAKE ---
    socket.on('admin login', async (password) => {
        if (password === ADMIN_PWD) {
            currentAdminToken = crypto.randomBytes(16).toString('hex');
            const history = await Message.find().sort({ createdAt: 1 }).lean();
            io.to(socket.id).emit('login success', { 
                token: currentAdminToken, 
                history: history 
            });
        } else {
            io.to(socket.id).emit('auth_error', 'Invalid Access Code');
        }
    });
    // --- MESSAGE ROUTER ---
    socket.on('chat message', async (data) => {
        const sanitizedText = escapeHTML(data.text);
        let fileInfo = null;
        if (data.file && data.file.url) {
            fileInfo = { url: escapeHTML(data.file.url), filename: escapeHTML(data.file.filename), mimetype: escapeHTML(data.file.mimetype) };
        }
        // 1. Admin Sending
        if (data.isAdmin) {
            if (data.token !== currentAdminToken || !currentAdminToken) {
                io.to(socket.id).emit('auth_error', 'Session Expired. Please reconnect.');
                return;
            }
            const safePayload = { 
                text: sanitizedText, senderId: 'ADMIN', targetUser: data.targetUser,
                isAdmin: true, file: fileInfo, origin: 'Dashboard'
            };
            // Save to DB
            await new Message(safePayload).save();
            if (data.targetUser) io.to(data.targetUser).emit('chat message', safePayload);
            else io.emit('chat message', safePayload);
        } 
        // 2. Visitor Sending
        else {
            const originStr = data.origin ? escapeHTML(data.origin) : 'Direct Link';
            const safePayload = { 
                text: sanitizedText, senderId: socket.id, 
                isAdmin: false, file: fileInfo, origin: originStr
            };
            // Save to DB
            await new Message(safePayload).save();

            io.emit('chat message', safePayload);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });