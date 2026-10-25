# 🌐 LinguaSync — Platform Belajar Bahasa Harian & Komunitas Praktik

LinguaSync adalah platform pembelajaran bahasa modern dwibahasa (**Bahasa Inggris 🇺🇸 & Bahasa Jepang 🇯🇵**) yang menggabungkan metode **Hybrid Micro-Drill**, kurikulum berjenjang standar internasional (**JLPT & CEFR**), latihan lisan interaktif via Web Speech API, dan papan tulis kanvas aksara Jepang.

---

## 🌟 Fitur Unggulan

### 1. 🗂️ Hybrid Micro-Drill Flashcards
- **Furigana / Ruby Support**: Menampilkan furigana di atas kanji secara proporsional menggunakan HTML `<ruby>` (`<rt>`) tag.
- **Audio Pronunciation**: Pelafalan suara penutur asli via browser Web Speech Synthesis (`ja-JP` & `en-US`).
- **Pencarian & Kurasi Cerdas**: Rekomendasi 20 kata acak dari bank kosakata dengan eliminasi duplikasi (*silent background buffer*).
- **CRUD Mandiri**: Pengguna terdaftar dapat menambah, mengubah, dan menghapus kosakata pribadi.

### 2. 🎓 Kurikulum Berjenjang Standar Internasional (362+ Materi Tata Bahasa)
Setiap materi tata bahasa dilengkapi **Rumus Formula Monospace**, **Penjelasan Bahasa Indonesia**, **Contoh Kalimat Nyata**, dan **Tips Artikulasi Audio**:
- 🇯🇵 **Standar Resmi JLPT (213 Pelajaran)**:
  - **N5** (53 materi): Pemula Dasar (Partikel `は/が/を/に/で`, pola `〜です`, `〜があります/います`, `〜てください`, `〜たいです`).
  - **N4** (55 materi): Percakapan Harian (Pengalaman `〜たことがある`, saran `〜たほうがいい`, izin `〜てもいい`, pengandaian `〜たら/ても`).
  - **N3** (48 materi): Menengah Mandiri (Penyangkalan `〜わけではない`, rutinitas `〜ようにしている`, kepastian `〜に違いない`, aturan `〜ことになっている`).
  - **N2** (32 materi): Tingkat Mahir/Bisnis (Keterbatasan `〜にすぎない`, perdebatan `〜をめぐって`, keterpaksaan `〜ざるを得ない`, dasar data `〜に基づいて`).
  - **N1** (25 materi): Fasih Sempurna/Sastra (Keunikan khas `〜ならではの`, puncak kondisi `〜極まりない`, pembuka `〜を皮切りに`).
- 🇺🇸 **Standar Internasional CEFR (149 Pelajaran)**:
  - **A1** (29 materi): *Beginner Survival* (`Present Simple`, `To Be`, `There is/are`, `Can/Cannot`, preposisi).
  - **A2** (32 materi): *Elementary Routine* (`Past Simple vs Continuous`, `Going to vs Will`, `Comparatives`, `Have to/Must`).
  - **B1** (34 materi): *Intermediate Independent* (`First/Second Conditionals`, `Present Perfect`, `Used to`, `Passive Voice`).
  - **B2** (32 materi): *Upper Intermediate* (`Third Conditional`, `Mixed Conditionals`, `Passive with Reporting Verbs`, `Inversion`).
  - **C1** (18 materi): *Advanced Professional* (`Inverted Conditionals`, `Cleft Sentences`, `Nominalisation`, `Subjunctive`).
  - **C2** (4 materi): *Proficient Native-Level* (`Fixed Lexical Binomials`, `Antithesis & Parallelism`, `Diplomatic Hedging`).

### 3. ✍️ Pondasi Aksara Jepang & Canvas Writing Pad (`/japanese-basics`)
- **Dekonstruksi Anatomi Kalimat**: Visualisasi interaktif pembeda fungsi Kanji (makna), Hiragana (tata bahasa), Katakana (kata serapan), dan Romaji dalam satu kalimat utuh.
- **Tabel Aksara Lengkap**: 46 Huruf Hiragana, 46 Huruf Katakana (dengan aturan tanda vokal panjang `ー`), dan 20 Kanji Piktograf Alam N5.
- **HTML5 Canvas Writing Pad**: Papan tulis interaktif ber-grid tradisional `田` dengan resolusi tinggi (Retina DPR), watermark bayangan huruf untuk menjiplak (*tracing*), pemutar audio, dan panduan 4 aturan urutan goresan (*stroke order*).
- **Route Guard Proteksi**: Mengalihkan tamu secara aman kembali ke dashboard dengan prompt autentikasi instan.

### 4. 🎙️ Latihan Output Harian & Gamifikasi
- **Tantangan Harian Kontekstual**: Menjawab pertanyaan tematik harian dalam kalimat bahasa Inggris atau Jepang.
- **Web Speech Recognition**: Latihan berbicara langsung dengan transkripsi teks otomatis di browser.
- **XP Points & Daily Streak**: Gamifikasi pembiasaan harian (+15 XP tantangan harian, +5 XP latihan tambahan, pelacak streak berturut-turut).
- **Leaderboard & Community Feed**: Umpan aktivitas publik dan apresiasi sesama pembelajar melalui tombol *Like*.

---

## 🏗️ Arsitektur Perangkat Lunak (Clean Architecture)

Aplikasi ini dirancang mengikuti panduan resmi **Next.js 16 (App Router)** dan prinsip **Clean Architecture**:

```
src/
├── app/                      # Next.js 16 App Router (Rute Halaman & Server API)
│   ├── api/                  # Server-side REST Endpoints (Auth, Cards, Data, dll)
│   ├── japanese-basics/      # Halaman Aksara Jepang & Canvas Pad
│   ├── layout.tsx            # Root Layout dengan Global AuthProvider
│   └── page.tsx              # Main Dashboard
├── components/               # Komponen UI Presentasional & Fitur
│   ├── japanese/             # Japanese Canvas Pad & Aksara Components
│   ├── ui/                   # Primitif UI Desain Sistem (Button, Dialog, Card, Input)
│   └── Toast.tsx             # Sistem Notifikasi Toast Global (Auto-Dismiss)
├── contexts/                 # State Management Global (React 19 Native Context)
│   └── AuthContext.tsx       # AuthProvider (Sesi, Guest Status, Global Modals)
├── services/                 # Centralized Service Layer (Single Source of Truth)
│   ├── apiClient.ts          # Base HTTP Client & Error Handling
│   ├── authService.ts        # Endpoint Autentikasi & Profil
│   ├── cardsService.ts       # Endpoint Operasi Flashcard (CRUD)
│   ├── curriculumService.ts  # Endpoint Tingkatan Level & Tata Bahasa
│   ├── dataService.ts        # Endpoint Agregasi Data Dashboard
│   ├── communityService.ts   # Endpoint Tantangan & Interaksi Komunitas
│   ├── vocabBankService.ts   # Endpoint Bank Kosakata Acak
│   └── index.ts              # Barrel Export
└── lib/                      # Utilitas Server & Basis Data
    ├── db.ts                 # SQLite Engine (better-sqlite3) & Skema Tabel
    ├── furigana.ts           # Parser Hiragana & Katakana
    └── japaneseCharacters.ts # Kamus Aksara & Aturan Kaligrafi
```

---

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components)
- **Library UI**: [React 19](https://react.dev/)
- **Bahasa**: [TypeScript 5](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) (Mode WAL, Indeks Teroptimasi)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan dukungan Dark/Light Mode Adaptif
- **Komponen Primitif**: [Radix UI](https://www.radix-ui.com/)
- **Ikonografi**: [Lucide React](https://lucide.dev/)
- **Audio & Suara**: Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`)

---

## 🚀 Memulai Proyek (Local Development)

### Prasyarat
- **Node.js**: Versi `>= 20.0.0`
- **NPM**: Versi `>= 10.0.0`

### 1. Kloning Repositori & Instalasi Dependensi
```bash
git clone <repository-url>
cd language-app
npm install
```

### 2. Ingestion Kurikulum Berjenjang (JLPT & CEFR)
Jalankan script untuk mengagregasi 362+ materi tata bahasa ke basis data SQLite lokal:
```bash
npm run ingest:curriculum
```

### 3. Menjalankan Server Pengembangan (Dev Mode)
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 📜 Perintah NPM (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Next.js dengan Turbopack |
| `npm run build` | Melakukan kompilasi build produksi dan type-checking TypeScript |
| `npm run start` | Menjalankan server produksi |
| `npm run lint` | Menjalankan ESLint 9 Flat Config untuk memastikan nol error |
| `npm run ingest:curriculum` | Mengimpor dataset kurikulum resmi (JLPT N5–N1 & CEFR A1–C2) ke SQLite |

---

## 🛡️ Keamanan & Integritas Sesi

- **Autentikasi Aman**: Sesi login dikelola melalui HTTP-only cookie (`lingua_session`) dengan hashing kata sandi SHA-256 dan salt unik.
- **Route Guard**: Rute khusus pengguna (`/japanese-basics`) diproteksi otomatis dengan pengalihan rute ke `/` dan prompt dialog masuk instan.
- **Isolated SQLite Storage**: Database tersimpan di `data/lingua_drill.db` dengan konkurensi Write-Ahead Logging (WAL).
