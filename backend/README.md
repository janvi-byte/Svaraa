# Speakora backend

This service provides the initial Express, MongoDB, and JWT foundation for Speakora. AI analysis is intentionally represented by a placeholder service and does not call an external provider.

Copy `.env.example` to `.env`, provide a MongoDB connection string and a long JWT secret, then run `npm install` followed by `npm start` from this directory.

Health check: `GET /api/health`
