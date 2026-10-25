# 🧠 LinguaSync — AI Agent Base Knowledge & Architectural Guidelines

> **Tujuan Dokumen**: Dokumen ini adalah *Single Source of Truth* panduan arsitektur bagi AI Agent pengembang (Gemini CLI, Cursor, Claude Code, Windsurf, Copilot, Cline, OpenAI Codex, dll) yang berkontribusi pada repositori **LinguaSync**. Dokumen ini mengacu pada struktur standar dokumentasi resmi **Next.js 16 (App Router)** dan **React 19**.

---

## 1. 📐 Prinsip Filosofi & Nilai Inti Arsitektur

1. **Locality of Behavior & Clean Separation**:
   - Komponen UI (`src/components/`) **hanya menangani presentasi visual dan interaksi pengguna**.
   - Komponen UI **DILARANG memanggil `fetch('/api/...')` mentah secara langsung**. Seluruh panggilan jaringan wajib melalui **Service Layer (`src/services/`)**.
2. **Zero-Bloat & Minimum Dependency**:
   - Hindari memasang dependensi pihak ketiga jika browser primitive atau React 19 sudah menyediakannya (contoh: Canvas Writing Pad menggunakan HTML5 Canvas murni; State autentikasi menggunakan Native React Context; Notifikasi menggunakan custom `Toast.tsx`).
3. **Hydration & SSR Invariant Safety**:
   - Selalu asumsikan kode berjalan di lingkungan Server (SSR) terlebih dahulu sebelum Browser. Jangan pernah mengakses `window`, `document`, atau `localStorage` tanpa pemeriksaan `typeof window !== 'undefined'` atau `useSyncExternalStore`.

---

## 2. 🗂️ Struktur Direktori Proyek (Next.js Documentation Alignment)

```
language-app/
├── src/
│   ├── app/                      # Next.js App Router (Routing, Layouts, API Routes)
│   │   ├── api/                  # Route Handlers (Server-Side Nitro/Node.js endpoints)
│   │   │   ├── auth/             # Sesi, login, register, logout, profile
│   │   │   ├── cards/            # CRUD kosakata pengguna
│   │   │   ├── curriculum/       # Kueri level tracks & grammar lessons
│   │   │   ├── data/             # Agregasi data landing page
│   │   │   ├── like/             # Pemberian apresiasi tulisan komunitas
│   │   │   ├── submissions/      # Pengiriman jawaban latihan harian
│   │   │   └── vocabulary-bank/  # Bank kosakata acak terkurasi
│   │   ├── japanese-basics/      # Halaman interaktif Aksara Jepang & Canvas Pad
│   │   ├── globals.css           # Styling dasar, CSS variables, Dark/Light tokens
│   │   ├── layout.tsx            # Root Layout (Membungkus AuthProvider & HTML body)
│   │   └── page.tsx              # Main Dashboard Page
│   │
│   ├── components/               # Komponen Presentasional & Domain UI
│   │   ├── ui/                   # Desain sistem primitif headless (Radix UI + Tailwind)
│   │   │   ├── badge.tsx, button.tsx, card.tsx, dialog.tsx, input.tsx, tabs.tsx
│   │   ├── japanese/             # Modul aksara (JapaneseCanvasPad.tsx)
│   │   ├── Toast.tsx             # Global Toast system (toast.success, error, info)
│   │   └── ConfirmDialog.tsx     # Pengganti window.confirm untuk aksi destruktif
│   │
│   ├── contexts/                 # Global Client State Providers (React 19)
│   │   └── AuthContext.tsx       # AuthProvider & useAuth hook
│   │
│   ├── services/                 # Centralized Service Layer (HTTP Client)
│   │   ├── apiClient.ts          # Base request helper & ApiError class
│   │   ├── authService.ts        # Layanan API Auth
│   │   ├── cardsService.ts       # Layanan API Cards CRUD
│   │   ├── curriculumService.ts  # Layanan API Kurikulum
│   │   ├── dataService.ts        # Layanan API Dashboard Data
│   │   ├── communityService.ts   # Layanan API Tantangan & Like
│   │   ├── vocabBankService.ts   # Layanan API Bank Kosakata
│   │   └── index.ts              # Barrel Export
│   │
│   └── lib/                      # Database & Utilitas Server
│       ├── db.ts                 # SQLite Engine (better-sqlite3), Migrasi & Seeding
│       ├── furigana.ts           # Parser kana/kanji HTML ruby generator
│       └── japaneseCharacters.ts # Data 46 Hiragana, 46 Katakana, 20 Kanji, Stroke rules
│
├── data/
│   ├── lingua_drill.db           # SQLite database file (Local, WAL mode)
│   └── seeds/
│       ├── grammar_curriculum.json # 362+ materi kurikulum resmi (JLPT & CEFR)
│       ├── vocab_en.json         # Bank kosakata bahasa Inggris
│       └── vocab_ja.json         # Bank kosakata bahasa Jepang
│
└── scripts/
    └── ingest_level_curriculum.ts # Script ekstraksi dataset terbuka ke SQLite
```

---

## 3. 🌐 Next.js Route Handlers (`src/app/api/**/route.ts`)

### Konvensi & Aturan Mutlak:
1. **Dynamic Execution**: Rute yang membaca *cookie* (`lingua_session`) atau *searchParams* wajib mengekspor:
   ```typescript
   export const dynamic = 'force-dynamic';
   ```
2. **Standardized Response**: Selalu kembalikan `NextResponse.json({ ... }, { status })`.
3. **Session Verification**: Ekstrak sesi pengguna menggunakan utilitas internal di `src/lib/db.ts`:
   ```typescript
   const cookieStore = await cookies();
   const token = cookieStore.get('lingua_session')?.value;
   const user = getSessionUser(token);
   ```
4. **Security Invariant**: Password disimpan menggunakan hashing SHA-256 ber-salt. Jangan pernah mengembalikan field `password_hash` atau `salt` ke respons client.

---

## 4. 🔌 Service Layer Standards (`src/services/`)

### Mengapa Service Layer Wajib Digunakan?
- Seluruh komunikasi HTTP browser terpusat di `src/services/`.
- Komponen UI tidak boleh memiliki string URL API mentah.

### Cara Menulis Service Baru:
```typescript
import { request } from './apiClient';

export interface MyFeaturePayload {
  name: string;
}

export const myFeatureService = {
  async performAction(payload: MyFeaturePayload): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/my-endpoint', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
```

### Cara Memanggil di Komponen:
```tsx
import { cardsService } from '@/services';

// Di dalam handler komponen:
try {
  await cardsService.deleteCard(cardId);
  toast.success('Kartu berhasil dihapus');
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : 'Gagal menghapus kartu';
  toast.error(msg);
}
```

---

## 5. ⚛️ State Management & React 19 Patterns

### A. Autentikasi Global (`useAuth()`)
Gunakan hook `useAuth()` di komponen Client mana pun untuk menghindari *props drilling*:
```tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, isGuest, isLoading, openAuthModal, logout } = useAuth();
  
  if (isGuest) {
    return <button onClick={openAuthModal}>Masuk</button>;
  }

  return <div>Halo, {user?.username}</div>;
}
```

### B. `useSyncExternalStore` & Referential Equality Invariant
Ketika menghubungkan state eksternal (seperti `ToastContainer` atau tema), **`getServerSnapshot` DILARANG mengembalikan array/object literal baru secara inline**:
```typescript
// ❌ SALAH (Memicu infinite re-render loop di React 19)
const getServerSnapshot = () => [];

// ✅ BENAR (Gunakan single immutable cached reference)
const EMPTY_SNAPSHOT = [];
const getServerSnapshot = () => EMPTY_SNAPSHOT;
```

---

## 6. 🗄️ Database Standards (`src/lib/db.ts`)

- **Engine**: SQLite via `better-sqlite3` berjalan lokal dan sinkron di Node.js runtime.
- **Konkurensi**: Berjalan dalam mode **WAL (Write-Ahead Logging)**:
  ```typescript
  db.pragma('journal_mode = WAL');
  ```
- **Transaksi Batch**: Setiap mutasi lebih dari 1 baris wajib dibungkus dalam transaksi atomik:
  ```typescript
  const insertTx = db.transaction((items) => {
    for (const item of items) insertStmt.run(item);
  });
  insertTx(items);
  ```
- **Foreign Keys**: Ditegakkan dengan `PRAGMA foreign_keys = ON;`. Pastikan data referensi induk (`level_tracks`, `users`) ada sebelum memasukkan baris anak (`grammar_lessons`, `cards`).

---

## 7. 🛡️ Route Guard & Access Control Pattern

1. **Dashboard Level Filter & Tab Tata Bahasa**:
   - Jika `isGuest === true`, tampilkan efek blur (`blur-[3px] opacity-35`) dan kartu overlay terkunci dengan tombol pemicu `openAuthModal()`.
2. **Halaman Khusus (`/japanese-basics`)**:
   - Dilindungi *Client Route Guard*: Jika pengunjung dalam status tamu, sistem otomatis me-redirect ke `/` via `router.replace('/')` dan memunculkan notifikasi serta dialog login.

---

## 8. 🔍 Quality Gate & Verifikasi (Pre-Commit Checklist)

Sebelum menandai tugas selesai atau mengusulkan perubahan kode, AI Agent **WAJIB menjalankan dan memverifikasi kedua perintah ini**:

1. **Linter Check**:
   ```bash
   npm run lint
   ```
   *Target: 0 error, 0 warning (ESLint 9 Flat Config).*

2. **Kompilasi Turbopack**:
   ```bash
   npm run build
   ```
   *Target: Seluruh 14 rute terkompilasi sukses tanpa error TypeScript.*
