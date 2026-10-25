# Lingua Sync - Quick Deploy Guide

## 🚀 Quick Start (5 Menit)

### 1. Install Turso CLI
```bash
# Windows PowerShell
irm get.turso.tech/install.ps1 | iex

# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2. Setup Turso Database
```bash
# Login
turso auth login

# Buat database
turso db create lingua-sync

# Initialize schema
turso db shell lingua-sync < scripts/init-turso-schema.sql

# Dapatkan credentials
turso db show lingua-sync --url
turso db tokens create lingua-sync
```

### 3. Deploy ke Vercel

**Via Dashboard:**
1. Push code ke GitHub
2. Import project di https://vercel.com/new
3. Tambahkan environment variables:
   - `TURSO_DATABASE_URL`: URL dari step 2
   - `TURSO_AUTH_TOKEN`: Token dari step 2
4. Deploy!

**Via CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login dan deploy
vercel login
vercel

# Set environment variables
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN

# Deploy production
vercel --prod
```

### 4. Verify
Buka: `https://your-app.vercel.app/api/init-db` untuk initialize database

## 📝 Development Lokal

```bash
# Install dependencies
npm install

# Run development server (otomatis pakai local SQLite)
npm run dev
```

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap.

## 🔧 Perubahan dari SQLite Lokal

- ✅ Database client: `better-sqlite3` → `@libsql/client` (Turso)
- ✅ API routes: sync → async/await pattern
- ✅ Local dev: fallback ke SQLite file otomatis
- ✅ Production: Turso cloud database
- ✅ No native compilation required (better-sqlite3 removed)

## 📚 Resources

- Turso Free Tier: 8GB storage, 1B row reads/month
- Docs: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Turso Docs: https://docs.turso.tech
- Vercel Docs: https://vercel.com/docs
