# Deploy Express App to Leapcell + Aiven MySQL

This guide is for this project (`Node.js + Express + Knex + mysql2`).

## 1) Create MySQL on Aiven (Free Tier)

1. Create an Aiven account and create **Aiven for MySQL (Free tier)**.
2. In the MySQL service page, copy:
   - `Host`
   - `Port`
   - `Database`
   - `User`
   - `Password`
3. Download the CA certificate from Aiven connection details (PEM file).
4. Convert CA PEM to base64 (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes(".\ca.pem"))
```

Copy the output for `DB_SSL_CA_B64`.

## 2) (Optional) Import your existing SQL data

From project root, import `dump.sql` into Aiven:

```powershell
mysql --host=<DB_HOST> --port=<DB_PORT> --user=<DB_USER> --password --ssl-mode=REQUIRED <DB_DATABASE> < dump.sql
```

## 3) Prepare repository

1. Push this project to GitHub/GitLab.
2. Ensure these files are committed:
   - `bin/www` (cloud-ready HTTP default)
   - `knexfile.js` (Aiven SSL support)
   - `.env.example`

## 4) Create service on Leapcell

1. In Leapcell, create a new service from your Git repository.
2. Runtime: Node.js.
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

5. Port: `3000`.
6. Mode:
   - Start with **Serverless** for free usage.
   - Switch to **Persistent** if you need no cold-start / background tasks.

## 5) Set environment variables in Leapcell

Add these variables in Leapcell service settings:

- `PORT=3000`
- `DB_HOST=...`
- `DB_PORT=...`
- `DB_DATABASE=...`
- `DB_USER=...`
- `DB_PASSWORD=...`
- `DB_SSL=true`
- `DB_SSL_REJECT_UNAUTHORIZED=true`
- `DB_SSL_CA_B64=<base64-of-ca.pem>`
- `JWT_SECRET=<long-random-secret>`
- `USE_HTTPS=false`

## 6) Deploy and verify

1. Trigger deployment.
2. Open the service URL:
   - `/` should show Swagger UI in this project.
3. Test API endpoints that require DB to confirm MySQL connection.

## Notes

- Cloud platforms terminate TLS at the edge. App-level HTTPS with self-signed cert is disabled by default (`USE_HTTPS=false`).
- Keep secrets only in Leapcell environment variables, never in source code.
