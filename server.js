const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json()); 

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat_attachments',
        resource_type: 'auto' 
    },
});

// ROBUSTNESS ADDED: Limits and Security Filters
const parser = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Strict 10MB file size limit
    fileFilter: (req, file, cb) => {
        // Security check: Reject executable and script files
        if (file.originalname.match(/\.(exe|bat|cmd|sh|msi|apk|bin)$/i)) {
            return cb(new Error('Dangerous file types are not allowed.'));
        }
        cb(null, true); // File is safe to process
    }
});

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

app.get('/', (req, res) => {
    res.status(200).send('Render Server is Awake!');
});

// FILE UPLOAD ENDPOINT
app.post('/upload', (req, res) => {
    parser.single('file')(req, res, (err) => {
        if (err) {
            console.error("Upload Error:", err.message);
            // Specifically catch the 10MB limit error to tell the user
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ message: 'Upload failed', details: 'File is too large. Maximum size is 10MB.' });
            }
            // Catch our custom security filter error or Cloudinary errors
            return res.status(400).json({ message: 'Upload failed', details: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        
        res.status(200).json({
            url: req.file.path, 
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    });
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const ADMIN_PWD = process.env.ADMIN_PASSWORD || "admin123";

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('chat message', (data) => {
        const sanitizedText = escapeHTML(data.text);
        
        let fileInfo = null;
        if (data.file && data.file.url) {
            fileInfo = {
                url: escapeHTML(data.file.url),
                filename: escapeHTML(data.file.filename || 'unknown'),
                mimetype: escapeHTML(data.file.mimetype || 'application/octet-stream')
            };
        }

        if (data.isAdmin) {
            if (data.password !== ADMIN_PWD) {
                io.to(socket.id).emit('auth_error', 'Invalid Access Code');
                return;
            }
        }

        const safePayload = { 
            text: sanitizedText, 
            senderId: data.senderId, 
            isAdmin: data.isAdmin,
            file: fileInfo 
        };
        
        io.emit('chat message', safePayload);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
