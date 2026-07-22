# Backend Setup and Deployment Guide

This `backend/` folder contains a lightweight Node.js + Express API server with SQLite storage.

## 1) Install dependencies

```bash
cd backend
npm install
```

## 2) Run locally

```bash
npm start
```

The server starts on `http://localhost:5000` by default (or `PORT` if provided).

## 3) Environment variables

Create a `.env` file inside `backend/` if needed:

```env
PORT=5000
```

## 4) Deploy on Render

1. Push this repository to GitHub.
2. In Render, create a **New Web Service** from the repository.
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (such as `PORT`) in Render dashboard if required.
5. Deploy.

## 5) Deploy on Vercel

Vercel is optimized for serverless functions. For this Express app:

1. Import the repository in Vercel.
2. Set **Root Directory** to `backend`.
3. Add a `vercel.json` configuration if you want Node server routing behavior.
4. Install dependencies during build (`npm install`) and set start entry to `server.js`.
5. Deploy and verify endpoints.

> Note: Persistent SQLite file storage may be ephemeral on serverless platforms. For production, use an external database service.

## 6) Available API endpoints

- `POST /api/auth/register`
  - Body: `{ "email": "user@example.com", "password": "yourPassword" }`
- `POST /api/reports/submit`
  - Body: `{ "title": "Issue title", "description": "Issue details" }`
