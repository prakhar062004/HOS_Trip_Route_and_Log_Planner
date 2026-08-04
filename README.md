# 🚚 HOS ELD Route & Log Planner

A premium, state-of-the-art SaaS logistics command center and Hours of Service (HOS) compliance manager. Built with a modern, high-contrast glassmorphic design system matching tools like Vercel, Linear, and Stripe.

---

### 🌐 Live Deployment Links
* **Live Web App (Frontend)**: [https://hos-trip-route-and-log-planner.vercel.app](https://hos-trip-route-and-log-planner.vercel.app) *(or your Vercel URL)*
* **Live API Service (Backend)**: [https://hos-trip-route-and-log-planner.onrender.com](https://hos-trip-route-and-log-planner.onrender.com)

---

## ✨ Features

### 🖥️ Premium SaaS Dashboard UI/UX
* **Apple Liquid Glass Design**: Capsule-styled sticky header with scrolled opacity bounds (80% transparency/20% opacity) and dynamic scroll padding.
* **Spotlight Hover Glows**: Cursor-following coordinate spotlights painted on summary cards.
* **Custom Metric Sparklines**: Embedded vector graphics inside summary cells to visualize fuel, distance, and sleeper patterns.
* **Spinning Theme Switcher**: Micro-animated exit/entry theme toggles using Framer Motion.
* **Telemetry Radar Loader**: Sweeping logistic radar animations with target grids, axis lines, and geolocator beacons to represent OSRM processing states.
* **Laser Input Connectors**: Glowing vertical timeline connector tracks tracing coordinates input flow.

### 📍 Compliant Interactive Logging
* **Zero-Scroll Auto-Fitting**: A smart paper log container that scales (`ResizeObserver`) to fit your viewport without requiring scrollbars, while restoring scroll controls during full-screen review.
* **FMCSA Compliant Daily Grid Log Sheets**: Digital grid drawing canvas supporting drag-and-paint log segments, recap tables, signatures, and browser print overrides.
* **HOS Auto-Resolver**: A one-click automated corrector that scans intervals backwards and shrinks violations (reducing driving to 11h and duty to 14h), instantly returning logs to a compliant state.
* **Dynamic Tab Favicon Sync**: The browser tab favicon dynamically toggles to a red warning icon (`⚠️ HOS VIOLATION`) and shifts titles when violations occur, reverting to a blue geopin when compliant.
* **Persistent Logs History**: A navbar drawer that saves planned hauls to `localStorage`, enabling instant reloading, single-item deletions, and signature auto-saves.

---

## 🛠️ Tech Stack
* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Leaflet Map, Lucide Icons.
* **Backend**: Django 5.x+, Django REST Framework, OSRM Routing API, Nominatim Geocoder.

---

## 🚀 Local Development Setup

### 1. Prerequisites
* **Python 3.10+**
* **Node.js 18+**

### 2. Backend Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Django server:
   ```bash
   python manage.py runserver
   ```
   *(Running locally on `http://localhost:8000`)*

### 3. Frontend Installation
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *(Running locally on `http://localhost:5173`)*

---

## 📦 Production Environment Configurations

### Vercel (Frontend) Env Variables
* `VITE_API_URL` = `https://hos-trip-route-and-log-planner.onrender.com`

### Render (Backend) Env Variables
* `SECRET_KEY` = `(Generate secure random string)`
* `DEBUG` = `False`
* `ALLOWED_HOSTS` = `*`
* **Root Directory** = `backend`
* **Start Command** = `gunicorn config.wsgi:application`
