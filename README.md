# Volcano Explorer API

Backend API for exploring volcano data, user authentication, profile management, and community comments.

## Why This Project

This service was built as a practical server-side application with:

- secure authentication (`JWT` + `bcrypt`)
- filtered volcano search endpoints
- user profile APIs
- comment and rating features
- production-ready deployment flow (Leapcell + Aiven MySQL)

## Tech Stack

- Node.js + Express
- Knex.js
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`)
- Swagger UI (`swagger-ui-express`)
- Pug (error/template views)

## Key Features

- `GET /countries`: list all available countries
- `GET /volcanoes?country=...&populatedWithin=...`: filter volcanoes by country and population radius
- `GET /volcano/:id`: public volcano details, with extra fields when valid Bearer token is provided
- `POST /user/register` and `POST /user/login`: account + token flow
- `GET/PUT /user/:email/profile`: user profile read/update with auth checks
- `POST /volcanoes/:id/comments`: add comment/rating (auth required)
- `GET /volcanoes/:id/comments` and `GET /volcanoes/:id/ratings`: community insights

## API Docs

Swagger UI is available at:

- `GET /`

## Project Structure

```text
bin/           # server bootstrap
routes/        # API routes
views/         # Pug templates
public/        # static assets
app.js         # express app setup
knexfile.js    # DB client config
swagger.json   # API schema
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set values:

- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`
- `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED`, `DB_SSL_CA_B64` (for Aiven)
- `JWT_SECRET`
- `USE_HTTPS` (`false` for cloud, optional `true` for local cert mode)

3. Start server:

```bash
npm start
```

4. Open:

- `http://localhost:3000/`

## Deployment (Leapcell + Aiven MySQL)

Recommended production setup:

- App hosting: Leapcell (Serverless)
- Database: Aiven MySQL

Service settings:

- Build command: `npm ci --omit=dev`
- Start command: `npm start`
- Serving port: `3000`
- Runtime: Node.js 20

Required env variables in Leapcell:

- `PORT=3000`
- `DB_HOST=<aiven-host>`
- `DB_PORT=<aiven-port>`
- `DB_DATABASE=defaultdb`
- `DB_USER=<aiven-user>`
- `DB_PASSWORD=<aiven-password>`
- `DB_SSL=true`
- `DB_SSL_REJECT_UNAUTHORIZED=true`
- `DB_SSL_CA_B64=<base64-of-ca.pem>`
- `JWT_SECRET=<long-random-secret>`
- `USE_HTTPS=false`

## Security Notes

- Never commit `.env`, secrets, or certificates.
- Rotate credentials immediately if leaked.
- Keep dependencies updated (`npm audit` should report `0 vulnerabilities`).

## Status

- Security-updated dependencies
- Cloud-ready HTTP runtime for platform TLS termination
- Aiven SSL-capable DB config in `knexfile.js`
