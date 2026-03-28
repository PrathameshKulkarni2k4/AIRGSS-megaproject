# 🏛️ AIRGSS — AI Powered Rural Governance Support System

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`)

---

### 1. Setup Backend

```bash
cd backend
npm install
```

#### Configure environment (already set in .env):
```
MONGODB_URI=mongodb://localhost:27017/airgss
JWT_SECRET=airgss_super_secret_jwt_key_2024
FRONTEND_URL=http://localhost:3000
ANTHROPIC_API_KEY=your_key_here   ← Add this for AI chatbot
```

#### Seed the database (REQUIRED — creates users + schemes):
```bash
cd scripts
node seed.js
cd ..
```

#### Start backend:
```bash
npm run dev
```
Backend runs on: http://localhost:5000

---

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start
```
Frontend runs on: http://localhost:3000

---

## 🔐 Demo Login Credentials

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@airgss.gov     | password123 |
| Officer | officer@airgss.gov   | password123 |
| Citizen | citizen@test.com     | password123 |

---

## ✅ Fixes Applied

| # | Issue | Fix |
|---|-------|-----|
| 1 | Login broken (admin + citizen) | Fixed seed script — was double-hashing passwords |
| 2 | Seed script failed silently | Fixed `.env` path: `path.join(__dirname, '../.env')` |
| 3 | Schemes not displaying | Seed creates 8 government schemes in DB |
| 4 | File upload crashed (ENOENT) | Auto-create `uploads/` dir on startup; use absolute paths |
| 5 | Uploaded files not retrievable | Store `/uploads/filename` URL path instead of OS path |
| 6 | CORS errors blocked all requests | Configured CORS with proper origin + credentials |
| 7 | Token expiry not handled | AuthContext verifies token on app load; clears if expired |
| 8 | Multer errors swallowed | Global error handler now handles MulterError codes |
| 9 | Role escalation possible | register() ignores role field from request body |
| 10 | JWT secret inconsistency | Removed fallback hardcoded string; always use .env |

---

## 📁 Project Structure

```
airgss/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/       # auth.js, upload.js
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── scripts/         # seed.js
│   ├── services/        # AI, OCR, chatbot
│   ├── uploads/         # Uploaded files (auto-created)
│   ├── .env             # Environment config
│   └── server.js
└── frontend/
    ├── src/
    │   ├── context/     # AuthContext.js
    │   ├── pages/       # citizen/, officer/, admin/
    │   ├── services/    # api.js
    │   └── App.js
    └── .env
```
