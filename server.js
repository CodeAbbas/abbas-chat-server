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
app.use(express.json()); // To parse JSON bodies (if needed for other routes)

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
        folder: 'chat_attachments', // Folder in Cloudinary
        format: async (req, file) => 'auto', // supports .png, .jpeg, .webp, etc.
        public_id: (req, file) => `attachment-${Date.now()}-${file.originalname.split('.')[0]}!`,
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
app.post('/upload', parser.single('file'), async (req, res) => {
    // Basic server-side authentication for upload:
    // This is still rudimentary. In a real app, you'd check a secure session token.
    // For now, only allow all for now, but this needs hardening.

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // You can add more validation here, e.g., file type, size
    // Multer already handles some limits, but you can add more logic
    
    // Respond with the Cloudinary URL and other info
    res.status(200).json({
        url: req.file.path, // This is the Cloudinary URL
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    });
});


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // IMPORTANT: In production, restrict this to "https://abbasuddin.dev"
        methods: ["GET", "POST"]
    }
});

const ADMIN_PWD = process.env.ADMIN_PASSWORD || "admin123";

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('chat message', (data) => {
        // data = { text: "...", senderId: "...", isAdmin: boolean, password: "...", file: { url: "...", filename: "...", mimetype: "..." } }

        // Server-Side Input Validation and Sanitization (CRITICAL)
        const sanitizedText = escapeHTML(data.text);
        
        let fileInfo = null;
        if (data.file && data.file.url) {
            // Basic validation for file data
            fileInfo = {
                url: escapeHTML(data.file.url), // Sanitize URL too
                filename: escapeHTML(data.file.filename || 'unknown'),
                mimetype: escapeHTML(data.file.mimetype || 'application/octet-stream')
            };
        }

        // 2. SECURITY CHECK for isAdmin
        if (data.isAdmin) {
            if (data.password !== ADMIN_PWD) {
                io.to(socket.id).emit('auth_error', 'Invalid Access Code');
                return;
            }
        }

        // 3. BROADCAST IF VALID (Remove password and ensure sanitized data)
        const safePayload = { 
            text: sanitizedText, 
            senderId: data.senderId, 
            isAdmin: data.isAdmin,
            file: fileInfo // Include file information if present
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