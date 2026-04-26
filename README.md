# Nexuspace

Nexuspace is a full-stack collaboration platform with workspaces, kanban tasks, channels, and real-time updates.

## Stack

- Frontend: Next.js (App Router), React, Tailwind CSS
- Backend: Node.js, Express, Socket.IO
- Database: MongoDB Atlas (Mongoose)
- Auth: Google OAuth credential flow + JWT

## Monorepo Structure

```text
nexuspace/
  client/    Next.js frontend
  server/    Express + Socket.IO backend
  package.json  Root scripts for local development
```

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas connection string
- Google OAuth client id

### Install

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### Environment Variables

Set frontend variables in `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

Set backend variables in `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Run

From repo root:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Overview

Base backend URL: `/api`

- Auth: `/auth/google`, `/auth/login`, `/auth/register`
- Workspaces: `/workspaces`
- Tasks: `/tasks`
- Channels: `/channels/findOrCreate`
- Messages: `/messages`

## Deployment

Recommended production split:

- Frontend on Vercel (root directory: `client`)
- Backend on Render (root directory: `server`)

### Frontend Env (Vercel)

```env
NEXT_PUBLIC_API_URL=https://nexuspace-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://nexuspace-backend.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend Env (Render)

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
CLIENT_URL=https://project-nexuspace.vercel.app
```

If you need multiple origins for backend CORS, set:

```env
CLIENT_URLS=http://localhost:3000,https://project-nexuspace.vercel.app
```

## Notes

- Do not commit `.env` or `.env.local` files.
- Keep secrets only in deployment platform environment settings.

## License

ISC
