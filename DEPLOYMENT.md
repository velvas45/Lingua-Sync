# Panduan Deploy Production - Lingua Sync

## Prerequisites
1. Akun Vercel (https://vercel.com)
2. Akun Turso (https://turso.tech)
3. Turso CLI terinstall

## Step 1: Setup Turso Database

### Install Turso CLI
```bash
# Windows (PowerShell)
irm get.turso.tech/install.ps1 | iex

# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash
```

### Login & Create Database
```bash
# Login ke Turso
turso auth login

# Buat database baru
turso db create lingua-sync

# Ambil URL database
turso db show lingua-sync --url

# Buat auth token
turso db tokens create lingua-sync
```

### Initialize Database Schema
```bash
# Jalankan migrasi schema ke Turso
turso db shell lingua-sync < scripts/init-turso-schema.sql
```

Atau jika ingin manual via shell:
```bash
turso db shell lingua-sync
```

Lalu copy-paste isi dari `scripts/init-turso-schema.sql`

## Step 2: Migrate Data dari SQLite Local (Opsional)

Jika Anda punya data lokal yang ingin dipindahkan:

```bash
# Export data dari database lokal
sqlite3 data/lingua_drill.db .dump > data/backup.sql

# Import ke Turso
turso db shell lingua-sync < data/backup.sql
```

## Step 3: Setup Vercel

### Install Vercel CLI (Opsional)
```bash
npm install -g vercel
```

### Deploy via Vercel CLI
```bash
# Login
vercel login

# Deploy
vercel

# Tambahkan environment variables
vercel env add TURSO_DATABASE_URL
# Paste URL dari: turso db show lingua-sync --url

vercel env add TURSO_AUTH_TOKEN
# Paste token dari: turso db tokens create lingua-sync

# Deploy production
vercel --prod
```

### Deploy via Vercel Dashboard

1. **Import Project**
   - Buka https://vercel.com/new
   - Import repository GitHub Anda
   - Framework Preset: Next.js (auto-detected)

2. **Configure Environment Variables**
   - Masuk ke Project Settings → Environment Variables
   - Tambahkan:
     ```
     TURSO_DATABASE_URL=libsql://lingua-sync-[your-org].turso.io
     TURSO_AUTH_TOKEN=[your-token-here]
     ```

3. **Deploy**
   - Klik "Deploy"
   - Vercel akan otomatis build dan deploy

## Step 4: Verifikasi Deployment

### Test API Endpoints
```bash
# Health check
curl https://your-app.vercel.app/api/data

# Test authentication
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","phone":"1234567890","password":"testpass"}'
```

### Monitor Database
```bash
# Lihat database metrics
turso db inspect lingua-sync

# Shell ke database
turso db shell lingua-sync
```

## Step 5: Database Initialization (First Deploy)

Setelah deploy pertama kali, database perlu diinisialisasi dengan data default:

1. **Via API Route** (rekomendasi)
   - Akses: `https://your-app.vercel.app/api/init-db`
   - Endpoint ini akan membuat schema dan data default

2. **Via Turso Shell**
   ```bash
   turso db shell lingua-sync
   ```
   Jalankan query dari `scripts/seed-data.sql`

## Troubleshooting

### Error: "Database is read-only"
- Pastikan `TURSO_AUTH_TOKEN` valid dan memiliki write access
- Generate token baru: `turso db tokens create lingua-sync`

### Error: "Connection failed"
- Periksa `TURSO_DATABASE_URL` format: `libsql://[db-name].turso.io`
- Verifikasi database masih aktif: `turso db list`

### Build Error di Vercel
- Pastikan `@libsql/client` ada di `dependencies` (bukan devDependencies)
- Clear cache: `vercel --force`

### Performance Issues
- Monitor query performance: `turso db inspect lingua-sync`
- Pertimbangkan menambahkan replicas: `turso db replicate lingua-sync to syd`
- Gunakan edge functions untuk response lebih cepat

## Development vs Production

### Local Development (.env.local)
```bash
# Tidak perlu Turso credentials
# Otomatis fallback ke local SQLite
```

### Production (.env)
```bash
TURSO_DATABASE_URL=libsql://lingua-sync-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
```

## Backup & Maintenance

### Backup Database
```bash
# Dump semua data
turso db shell lingua-sync ".dump" > backup-$(date +%Y%m%d).sql
```

### Update Schema
```bash
# Buat migration file
turso db shell lingua-sync < migrations/001-add-new-table.sql
```

### Monitor Usage
```bash
# Lihat usage dan billing
turso org show
turso db inspect lingua-sync
```

## Tips Production

1. **Environment Variables**: Jangan commit `.env` atau `.env.local` ke Git
2. **Database Replicas**: Untuk latency rendah, tambahkan replicas di region user: `turso db replicate`
3. **Monitoring**: Setup Vercel Analytics untuk monitor performance
4. **Rate Limiting**: Pertimbangkan rate limiting di API routes
5. **Edge Runtime**: Gunakan Edge Runtime di Vercel untuk response lebih cepat:
   ```typescript
   export const runtime = 'edge';
   ```

## Resources

- Turso Docs: https://docs.turso.tech
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Turso Pricing: https://turso.tech/pricing (Free tier: 8 GB storage, 1 billion row reads/month)
