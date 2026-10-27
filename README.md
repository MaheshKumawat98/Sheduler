# Social Media Automation Platform

An AI-powered social media automation platform to create, schedule, and publish posts seamlessly across multiple platforms.

## Project Structure

- `client/` - React frontend (Vite)
- `server/` - Node.js backend (Express + TypeScript)

## Running the Project

### 1. From the Root Directory (runs both frontend & backend concurrently):
```bash
npm run dev
```

Or individually:
```bash
# Frontend only
npm run dev:client

# Backend only
npm run dev:server
```

### 2. Environment Variables
Make sure to configure `server/.env` with your MongoDB connection string and API keys (see `server/.env.example`).

