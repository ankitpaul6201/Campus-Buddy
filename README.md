<div align="center">
  <img src="public/campus-buddy-CB-exact-vector.svg" width="100" height="100" alt="Campus Buddy Logo" />
  <h1>Campus Buddy</h1>
  <p><strong>The Student Campus Marketplace</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/Capacitor-8-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" />
    <img src="https://img.shields.io/badge/Android-APK-3DDC84?style=for-the-badge&logo=android&logoColor=white" />
    <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  </p>
</div>

---

## 📱 About

**Campus Buddy** is a mobile-first student marketplace app that lets college students **buy, sell, and discover** essentials within their campus community. Built as an Android app using React + Capacitor, with a Node.js + MongoDB backend.

> Trade textbooks, electronics, furniture, and more — only with verified students on your campus.

---

## ✨ Features

- 🔐 **Secure Auth** — Signup & Login with JWT tokens (must register first)
- 🛒 **Product Listings** — Browse and post campus buy/sell ads
- 📸 **Image Upload** — Cloudinary-powered product photo hosting
- 💬 **Chat** — Message sellers directly within the app
- 🔔 **Notifications** — Stay updated on your listings and offers
- ❤️ **Wishlist** — Save items you're interested in
- 👤 **Profile** — Manage your campus identity and ads
- 🌙 **Smooth Animations** — Framer Motion transitions throughout

---

## 🏗️ Project Structure

```
Campus Buddy/
├── src/                        # React frontend source
│   ├── components/             # All screen components
│   │   ├── WelcomeScreen.jsx   # Landing / auth entry
│   │   ├── SignupScreen.jsx     # User registration (required first)
│   │   ├── LoginScreen.jsx      # Login with email/username
│   │   ├── HomeScreen.jsx       # Main marketplace feed
│   │   ├── SellScreen.jsx       # Post a new listing
│   │   ├── ChatScreen.jsx       # Messaging
│   │   ├── ProfileScreen.jsx    # User profile
│   │   ├── WishlistScreen.jsx   # Saved items
│   │   ├── NotificationsScreen.jsx
│   │   └── MyAdsScreen.jsx      # Your active listings
│   ├── lib/
│   │   └── api.js              # API client (auto-selects local/production URL)
│   └── App.jsx                 # Root with navigation + auth state
├── server/                     # Node.js + Express backend
│   ├── middleware/auth.js       # JWT verification
│   ├── models/                 # Mongoose schemas (User, Product)
│   ├── routes/                 # API route handlers (auth, products)
│   ├── server.js               # Express app entry point
│   ├── railway.json            # Railway deployment config
│   └── README.md               # Backend-specific docs
├── public/                     # Static assets
├── .env.example                # Frontend environment variable template
├── capacitor.config.json       # Capacitor Android config
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Android Studio (for APK builds)
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free)
- A [Cloudinary](https://cloudinary.com) account (free)

---

### 1. Clone the Repository

```bash
git clone https://github.com/ankitpaul6201/Campus-Buddy.git
cd Campus-Buddy
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Set Up the Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials
```

### 4. Start the Backend Server

```bash
# From the server/ directory
npm run dev        # Development (nodemon auto-restart)
# or
npm start          # Production
```

### 5. Configure Frontend API URL

For **local development** (browser):
```bash
# No setup needed — defaults to http://localhost:5000/api
npm run dev
```

For **Android device** (same Wi-Fi):
- Edit `src/lib/api.js` → update the LAN IP to your machine's IP
- Get your IP: `ipconfig` → look for Wi-Fi IPv4

For **production** (deployed backend):
```bash
cp .env.example .env
# Edit .env:
VITE_API_URL=https://your-railway-url.up.railway.app/api
```

### 6. Build & Sync Android

```bash
npm run build
npx cap sync
# Then open Android Studio and run on device/emulator
```

---

## ☁️ Backend Deployment (Railway)

The backend can be deployed to [Railway](https://railway.app) for a **public URL** that works from any network:

1. Push `server/` to a GitHub repo (or use this monorepo)
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add your environment variables in Railway's **Variables** tab
4. Railway generates a public URL automatically
5. Set `VITE_API_URL` in your frontend `.env` to that URL, rebuild, and sync

See [`server/README.md`](./server/README.md) for detailed deployment steps.

---

## 🔒 Auth Flow

```
User opens app
      ↓
  Welcome Screen
  ┌──────┬──────┐
Sign In  Sign Up  ← Must register first
                        ↓
                   Fill details
                   (username, email, password, university)
                        ↓
                   Logged in → Home feed ✅
```

> Users **must sign up first** before they can sign in. No social login.

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | No | Register new student |
| `POST` | `/api/auth/login` | No | Login (username or email) |
| `GET` | `/api/auth/me` | ✅ JWT | Get current user |
| `GET` | `/api/products` | No | All active listings |
| `POST` | `/api/products` | ✅ JWT | Create listing |
| `POST` | `/api/products/upload-image` | ✅ JWT | Upload image to Cloudinary |
| `GET` | `/api/health` | No | Server health check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Mobile** | Capacitor 8 (Android) |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB Atlas (Mongoose) |
| **Auth** | JWT + bcryptjs |
| **Images** | Cloudinary CDN |
| **Deployment** | Railway (backend) |

---

## 📄 License

MIT © [Ankit Paul](https://github.com/ankitpaul6201)
