# Presetify Admin Dashboard

> Modern, responsive management portal for **Presetify** — the curated Adobe Lightroom (.DNG) mobile presets platform.

---

## 📸 Overview

The **Presetify Admin Dashboard** provides full administrative control over presets, categories, OneSignal push campaigns, Google AdMob monetization parameters, and backend configurations.

Built with **React 19**, **Vite**, **Tailwind CSS**, and **Lucide Icons** for a fast, intuitive desktop and tablet experience.

---

## ⚡ Core Features

- **📊 Dashboard & Metrics**:
  - Real-time preset counter, total categories, and quick platform health checks.
  - Recent uploads and fast management table.
- **🎨 Preset Management**:
  - Multi-file upload for `.DNG` presets and `.webp` thumbnails.
  - Automatic EXIF metadata extraction via `exifreader`.
  - Edit titles, categorize, and delete presets instantly.
- **📁 Category Management**:
  - Create, reorder, update, and manage preset categories (e.g. *Moody, Vintage, Travel, Golden Hour*).
- **📢 Push Notifications (OneSignal)**:
  - Broadcast notification alerts directly to Android app users with deep links and custom banners.
- **💰 AdMob & Monetization Controls**:
  - Live toggles for banner ads, interstitial ad intervals, native ad placements, and rewarded video ads without rebuilding the mobile app.
- **🔐 Secure Access**:
  - Authenticated sessions with popup modal authentication and local state preservation.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Metadata**: [ExifReader](https://github.com/mattiasw/ExifReader)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **yarn** / **pnpm**

### 2. Installation
```bash
# Clone the repository (Private)
git clone https://github.com/bloggerkhurshid/presetify-admin.git
cd presetify-admin

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_API_URL=https://api.devkayy.in/api/
```

### 4. Running Locally
```bash
npm run dev
```
The application will launch on `http://localhost:5173` (or next available port).

### 5. Production Build
```bash
npm run build
```
Generates production-ready, minified static assets in the `dist/` folder.

---

## 📂 Project Structure

```text
admin-panel/
├── public/                 # Static assets & icons
├── src/
│   ├── components/         # Reusable UI widgets & forms
│   ├── pages/
│   │   ├── Dashboard.jsx   # Metrics & preset data table
│   │   ├── Categories.jsx  # Category CRUD operations
│   │   ├── PushNotifications.jsx # OneSignal campaign sender
│   │   ├── AdMob.jsx       # Monetization toggles & ad IDs
│   │   ├── Settings.jsx    # System preferences & API config
│   │   └── Login.jsx       # Authentication modal
│   ├── Layout.jsx          # Sidebar & navigation wrapper
│   ├── App.jsx             # Route definitions & auth gate
│   ├── index.css           # Tailwind base styles
│   └── main.jsx            # React root entry
├── .env                    # Environment endpoints
├── tailwind.config.js      # Design tokens & color palette
├── vite.config.js          # Vite build configuration
└── package.json
```

---

## 🔒 Confidentiality & License

This software and repository are **Private & Proprietary** to **ProjuktiSoft / Presetify**. Unauthorized copying, distribution, or commercial reuse of any part of this repository is strictly prohibited.

&copy; 2026 Presetify. All rights reserved.
