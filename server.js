const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies

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
        folder: 'chat_attachments'
        // We removed the custom format and public_id rules. 
        // Cloudinary will now securely auto-generate a random, URL-safe filename.
    },
});

const parser = multer({ storage: storage });

// Helper function for server-side HTML escaping
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
    // Wrap the parser in a callback to catch Cloudinary errors gracefully
    parser.single('file')(req, res, (err) => {
        if (err) {
            console.error("Cloudinary Upload Error:", err);
            return res.status(500).json({ 
                message: 'Upload failed', 
                details: err.message || 'Unknown Cloudinary error' 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        
        // Respond with the Cloudinary URL and other info
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
    cors: {
        origin: "https://abbasuddin.dev",
        methods: ["GET", "POST"]
    }
});

const ADMIN_PWD = process.env.ADMIN_PASSWORD || "admin123";

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('chat message', (data) => {
        // Server-Side Input Validation and Sanitization
        const sanitizedText = escapeHTML(data.text);
        
        let fileInfo = null;
        if (data.file && data.file.url) {
            fileInfo = {
                url: escapeHTML(data.file.url),
                filename: escapeHTML(data.file.filename || 'unknown'),
                mimetype: escapeHTML(data.file.mimetype || 'application/octet-stream')
            };
        }

        // SECURITY CHECK for isAdmin
        if (data.isAdmin) {
            if (data.password !== ADMIN_PWD) {
                io.to(socket.id).emit('auth_error', 'Invalid Access Code');
                return;
            }
        }

        // BROADCAST IF VALID (Remove password and ensure sanitized data)
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
