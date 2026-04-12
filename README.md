<div align="center">
  <h1>💬 Abbas Chat Server</h1>
  <p>A production-ready real-time chat backend built with Node.js, Express, and Socket.IO — deployed on Render and powering <a href="https://abbasuddin.dev">abbasuddin.dev</a></p>

  <a href="https://render.com" target="_blank">
    <img src="https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render" />
  </a>
  <a href="https://github.com/CodeAbbas/abbas-chat-server/blob/main/package.json">
    <img src="https://img.shields.io/badge/Node.js-Express%205-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Express" />
  </a>
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Cloudinary-Image%20Uploads-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</div>

---

### 📖 Overview

**Abbas Chat Server** is the backend engine behind my personal portfolio's real-time chat feature. It handles persistent WebSocket connections via Socket.IO, stores messages in MongoDB through Mongoose, and manages image uploads to Cloudinary. The server is written in plain Node.js/CommonJS with Express 5 and is designed to be lightweight, self-contained, and easy to deploy.

---

### ✨ Features

- ⚡ **Real-time messaging** — bidirectional communication via Socket.IO 4
- 🖼️ **Image uploads** — file handling with Multer and cloud storage via Cloudinary
- 🗄️ **Persistent storage** — messages and users stored in MongoDB through Mongoose
- 🔐 **Secure config** — environment variables managed with dotenv
- 🔑 **Crypto utilities** — built-in Node.js `crypto` for hashing/token generation
- 🌐 **CORS-ready** — configured to accept cross-origin requests from the portfolio frontend

---

### 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (CommonJS) |
| Framework | Express 5 |
| WebSockets | Socket.IO 4 |
| Database | MongoDB + Mongoose |
| File Uploads | Multer + multer-storage-cloudinary |
| Image CDN | Cloudinary |
| Config | dotenv |
| CORS | cors |

---

### 📁 Project Structure

```
abbas-chat-server/
├── server.js          # Entry point — Express app, Socket.IO setup, routes
├── package.json       # Dependencies and scripts
├── .gitignore         # Ignored files (node_modules, .env)
└── .env               # Environment variables (not committed)
```

---

### 🚀 Getting Started

#### Prerequisites

- Node.js v18+
- A MongoDB connection URI (MongoDB Atlas recommended)
- A Cloudinary account (free tier works fine)

#### 1. Clone the repository

```bash
git clone https://github.com/CodeAbbas/abbas-chat-server.git
cd abbas-chat-server
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 4. Run the server

```bash
node server.js
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

---

### ☁️ Deployment

This server is deployed on **[Render](https://render.com)** as a Web Service. Render automatically detects the Node.js environment and runs `node server.js` as the start command.

> **Live instance:** Used in production at [abbasuddin.dev](https://abbasuddin.dev)

To deploy your own instance on Render:

1. Push the repo to GitHub
2. Create a new **Web Service** on Render
3. Set the **Start Command** to `node server.js`
4. Add your environment variables in the Render dashboard
5. Deploy 🚀

---

### 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | HTTP server and routing |
| `socket.io` | ^4.8.1 | Real-time WebSocket communication |
| `mongoose` | ^9.4.1 | MongoDB ODM |
| `multer` | ^1.4.5-lts.1 | Multipart file upload handling |
| `multer-storage-cloudinary` | ^4.0.0 | Cloudinary storage engine for Multer |
| `cloudinary` | ^1.41.3 | Cloud image hosting and CDN |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing |
| `dotenv` | ^16.6.1 | Environment variable management |
| `crypto` | ^1.0.1 | Hashing and token utilities |

---

### 🤝 Connect

<div align="center">
  <a href="https://abbasuddin.dev">
    <img src="https://img.shields.io/badge/Portfolio-abbasuddin.dev-00FFC2?style=for-the-badge&logo=googlechrome&logoColor=black" alt="Portfolio" />
  </a>
  <a href="https://www.linkedin.com/in/abbas-dev">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="https://github.com/CodeAbbas">
    <img src="https://img.shields.io/badge/GitHub-CodeAbbas-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</div>

---

<div align="center">
  <sub>Built by <a href="https://abbasuddin.dev">Abbas Uddin</a> · London, UK 🇬🇧</sub>
</div>
