# Campus Buddy — Backend API Server

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-Image_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

> RESTful backend API for [Campus Buddy](https://github.com/your-username/campus-buddy) — a student campus marketplace app built with React + Capacitor (Android).

---

## 📋 Features

- 🔐 **JWT Authentication** — Signup, Login, and protected routes
- 🗄️ **MongoDB Atlas** — Cloud-hosted NoSQL database via Mongoose
- 🖼️ **Cloudinary CDN** — Product image upload and hosting
- 🛒 **Product Listings** — Create, read, and manage campus marketplace items
- 🌐 **CORS-enabled** — Works with mobile apps on any network
- ❤️ **Health Check** — `/api/health` endpoint for uptime monitoring

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| Image Storage | Cloudinary |
| Deployment | Railway |

---

## 📁 Project Structure

```
server/
├── middleware/
│   └── auth.js          # JWT token verification middleware
├── models/
│   ├── User.js          # User schema (username, email, password hash, university)
│   └── Product.js       # Product listing schema
├── routes/
│   ├── auth.js          # POST /api/auth/signup, /login, GET /api/auth/me
│   └── products.js      # GET/POST /api/products, POST /api/products/upload-image
├── .env.example         # Environment variable template (copy → .env)
├── .gitignore           # Excludes .env, node_modules, logs
├── railway.json         # Railway deployment config
├── package.json
└── server.js            # App entry point
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/campus-buddy-server.git
cd campus-buddy-server
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusbuddy?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here_change_this

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`

---

## 📡 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | `{ username, email, password, fullName, universityName }` | Register a new student |
| `POST` | `/api/auth/login` | `{ username, password }` | Login (username or email) |
| `GET` | `/api/auth/me` | — (JWT required) | Get current user profile |

### Product Routes — `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | No | Get all active listings |
| `POST` | `/api/products` | ✅ JWT | Create a new product listing |
| `POST` | `/api/products/upload-image` | ✅ JWT | Upload image to Cloudinary (multipart) |

### Health Check

```
GET /api/health
→ { "status": "ok", "app": "Campus Buddy API Server", "timestamp": "..." }
```

---

## ☁️ Deploy to Railway (Recommended)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select this repository
4. Go to **Variables** tab and add all keys from `.env.example` with your real values
5. Railway auto-generates a public URL (e.g. `https://campus-buddy-server-production.up.railway.app`)
6. Test it: `https://your-url.up.railway.app/api/health`

> **Important:** Never commit your `.env` file. Set variables directly in Railway's dashboard.

---

## 🔒 Security Notes

- Passwords are hashed using **bcryptjs** (salt rounds: 10) — never stored in plain text
- JWTs expire after **30 days**
- `.env` is excluded from git via `.gitignore`
- MongoDB IP whitelist: set to `0.0.0.0/0` in Atlas for Railway, or restrict to Railway's IPs for stricter security

---

## 🌐 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000, Railway sets this automatically) |
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | Secret key for signing JWTs (use a long random string) |
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Cloudinary API secret |

---

## 📱 Frontend

The frontend (React + Capacitor Android app) lives in a separate repository.  
Set `VITE_API_URL=https://your-railway-url.up.railway.app/api` in the frontend `.env` to connect.

---

## 📄 License

MIT © Ankit Paul
