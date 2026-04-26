# Nexuspace Frontend

Next.js frontend for Nexuspace.

## Requirements

- Node.js 18+

## Setup

```bash
npm install
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Run

```bash
npm run dev
```

App runs at http://localhost:3000

## Build

```bash
npm run build
npm run start
```

## Production (Vercel)

- Set project root directory to `client`
- Add these environment variables:

```env
NEXT_PUBLIC_API_URL=https://nexuspace-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://nexuspace-backend.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Notes

- Frontend expects backend endpoints under `/api`
- Frontend expects Socket.IO server at backend base URL
