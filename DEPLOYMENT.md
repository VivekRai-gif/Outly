# Outly Production Deployment & Infrastructure Guide

Complete production deployment documentation for **Outly** (Email outreach, follow-up, and tracking platform).

---

## 🏗 Architecture & Cloud Targets

| Component | Target Platform | Description |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** | React + Vite Single Page Application (SPA) |
| **Backend** | **Render / Railway** | Node.js + Express REST API & BullMQ Background Queue Worker |
| **Database** | **MongoDB Atlas** | Managed Cloud Document Database |
| **Queue Store** | **Upstash Redis** | Serverless Redis for BullMQ jobs |

---

## 1. MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write permissions.
3. Network Access: Add IP Access Rule (`0.0.0.0/0` or Render/Railway outbound IPs).
4. Copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/outly?retryWrites=true&w=majority
   ```

---

## 2. Upstash Redis Setup

1. Create a Redis Database at [upstash.com](https://upstash.com).
2. Copy `UPSTASH_REDIS_HOST`, `UPSTASH_REDIS_PORT` (6379), and `UPSTASH_REDIS_PASSWORD`.

---

## 3. Google OAuth 2.0 Client Credentials

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Authorize JavaScript origins:
   - `https://your-outly-frontend.vercel.app`
4. Authorize Redirect URIs:
   - `https://your-outly-backend.onrender.com/api/auth/google/callback`
5. Enable Gmail API (`gmail.send`, `gmail.readonly`).

---

## 4. Backend Deployment (Render / Railway)

1. Connect your GitHub repository to **Render** or **Railway**.
2. Select **Web Service** using Node environment.
3. Build Command: `npm install`
4. Start Command: `npm run start`
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=<Atlas Connection String>`
   - `REDIS_HOST=<Upstash Redis Host>`
   - `REDIS_PORT=6379`
   - `REDIS_PASSWORD=<Upstash Redis Password>`
   - `CLIENT_URL=https://your-outly-frontend.vercel.app`
   - `SERVER_URL=https://your-outly-backend.onrender.com`
   - `GOOGLE_CLIENT_ID=<Google Client ID>`
   - `GOOGLE_CLIENT_SECRET=<Google Client Secret>`
   - `GOOGLE_REDIRECT_URI=https://your-outly-backend.onrender.com/api/auth/google/callback`

---

## 5. Frontend Deployment (Vercel)

1. Connect repository to **Vercel** ([vercel.com](https://vercel.com)).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variable:
   - `VITE_API_URL=https://your-outly-backend.onrender.com/api`

---

## ⚡ Startup Commands & Health Checks

### Local & Production Startup Commands
```bash
# Backend Server
cd backend
npm run start

# Frontend Production Build Test
cd frontend
npm run build
npm run preview
```

### Health Check Verification Endpoints
```bash
# Express API Server Health Check
curl https://your-outly-backend.onrender.com/api/health

# MongoDB Database Connection Health Check
curl https://your-outly-backend.onrender.com/api/health/db
```

---

## 📋 Environment Variables Reference Table

| Variable | Scope | Location | Secret? | Description |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Frontend | `frontend/.env` | No | Full URL to backend Express API (`.../api`) |
| `PORT` | Backend | `backend/.env` | No | Server port (default 5000) |
| `NODE_ENV` | Backend | `backend/.env` | No | Mode (`production` or `development`) |
| `MONGO_URI` | Backend | `backend/.env` | **YES** | MongoDB Atlas connection string |
| `REDIS_HOST` | Backend | `backend/.env` | No | Redis host address |
| `REDIS_PORT` | Backend | `backend/.env` | No | Redis port (6379) |
| `REDIS_PASSWORD` | Backend | `backend/.env` | **YES** | Redis password credential |
| `CLIENT_URL` | Backend | `backend/.env` | No | Frontend Vercel URL (CORS & OAuth redirect) |
| `SERVER_URL` | Backend | `backend/.env` | No | Backend Render URL (Tracking pixels & clicks) |
| `GOOGLE_CLIENT_ID` | Backend | `backend/.env` | No | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Backend | `backend/.env` | **YES** | Google OAuth 2.0 Client Secret |
| `GOOGLE_REDIRECT_URI` | Backend | `backend/.env` | No | Google OAuth callback redirect URL |

---

## ✅ Complete Production Readiness Checklist

- [x] **Zero Raw Passwords**: No email passwords requested or stored.
- [x] **Secret Isolation**: OAuth client secrets and refresh tokens stored 100% server-side.
- [x] **NoSQL Injection Protection**: `express-mongo-sanitize` strips `$` and `.` operators.
- [x] **Security Headers**: `helmet` and disabled `x-powered-by` header.
- [x] **Rate Limiting**: `express-rate-limit` global and strict limiters active.
- [x] **Duplicate Send Safeguards**: Idempotent email checks before dispatches.
- [x] **File Upload Controls**: UUID filenames, 10MB PDF size limit, strict MIME filter.
- [x] **Error Sanitization**: Redacted bearer tokens and passwords in error logs.
- [x] **Health Checks**: `/api/health` and `/api/health/db` responding cleanly.
- [x] **Production Builds**: Frontend Vite build passing in 2.88s without warnings.
