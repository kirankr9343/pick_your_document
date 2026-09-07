# Production Deployment Guide

## Deploying with Docker Compose

1. Clone the repository and navigate to root directory.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update environment variables in `.env` (Secret key, Database credentials, AI provider API keys).
4. Run Docker Compose:
   ```bash
   docker compose up -d
   ```
5. Access frontend at `http://localhost:3000` and API docs at `http://localhost:8000/docs`.

## Cloud Hosting Recommendations

- **Frontend**: Deploy `frontend/` to Vercel, Netlify, or Cloudflare Pages.
- **Backend API**: Deploy `backend/` as a container service to Render, Fly.io, Railway, or AWS ECS.
- **Database**: Managed PostgreSQL (Supabase, Render Postgres, AWS RDS).
