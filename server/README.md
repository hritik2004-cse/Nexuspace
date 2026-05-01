# Nexuspace Server

The backend engine powering the Nexuspace real-time platform.

## 🚀 Key Technologies
- **Node.js & Express**: Core API framework.
- **MongoDB & Mongoose**: Persistent data storage with strict schema validation.
- **Socket.io**: Real-time bidirectional communication mesh.
- **Redis**: session management, rate limiting, and idempotency locking.
- **JWT & Google OAuth**: Robust multi-stage authentication.

## 📁 Structure
- `/controllers`: Logic for handling API requests.
- `/models`: Mongoose schemas for Users, Workspaces, Tasks, and Messages.
- `/routes`: Endpoint definitions and middleware mapping.
- `/sockets`: WebSocket event handlers for real-time collaboration.
- `/services`: Business logic abstractions (Auth, Email, etc.).
- `/middleware`: Auth guards, rate limiters, and error handlers.
- `/scripts`: Administrative and utility scripts (e.g., `check_user.js`).

## 🛠️ Administrative Scripts
The `/scripts` folder contains useful tools for managing the platform:
- `node scripts/check_user.js`: Validates a specific user's existence and properties in the database.

## 🔐 Environment Variables
Requires a `.env` file with:
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for token signing.
- `GOOGLE_CLIENT_ID`: OAuth client ID.
- `REDIS_URL`: Connection string for Redis.

---
*Nexuspace Server - Built for extreme performance and reliability.*
