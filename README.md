# 🚚 HOS ELD Route & Log Planner

> A modern SaaS-based logistics dashboard for **route planning**, **Hours of Service (HOS) compliance**, and **electronic driver log management**, built with a premium glassmorphic UI inspired by Vercel, Linear, and Stripe.

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Django-5.x-green?logo=django" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-38BDF8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Framer_Motion-Animation-black?logo=framer" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-success?logo=leaflet" />
  <img src="https://img.shields.io/badge/License-MIT-blue" />
</p>

---

## 🌐 Live Demo

### 🚀 Frontend
https://hos-trip-route-and-log-planner.vercel.app

### ⚙️ Backend API
https://hos-trip-route-and-log-planner.onrender.com

---

# 📖 Overview

HOS ELD Route & Log Planner is a full-stack logistics management platform that enables drivers and fleet operators to efficiently plan routes while maintaining FMCSA Hours of Service compliance.

The application combines modern UI design, route optimization, digital driver logs, compliance validation, and trip history into a single intuitive dashboard.

---

# ✨ Key Features

## 🎨 Premium SaaS Dashboard

- Apple-inspired Liquid Glass UI
- Sticky capsule navigation
- Dark & Light mode
- Framer Motion animations
- Cursor-follow spotlight cards
- Interactive metric cards
- Sparkline charts
- Responsive layout

---

## 🗺️ Smart Route Planning

- Add multiple destinations
- Interactive Leaflet Map
- Route visualization
- Address geocoding using Nominatim
- Optimized routes using OSRM Routing API
- Live route processing animation

---

## 📋 FMCSA Compliant ELD Logs

- Digital Daily Log Sheets
- Drag-and-paint log editor
- Automatic recap calculations
- Driver signatures
- Printable log sheets
- Responsive paper scaling

---

## ✅ HOS Compliance Engine

The application continuously validates driver logs against FMCSA regulations.

It automatically checks for:

- Driving Hour Violations
- Duty Hour Violations
- Compliance Status

If a violation occurs:

- Browser tab icon changes
- Warning title appears
- Violated intervals are highlighted

---

## ⚡ One Click Auto Resolver

The HOS Auto Resolver automatically:

- Detects violations
- Adjusts driving hours
- Fixes duty limits
- Restores legal compliance

without requiring manual edits.

---

## 💾 Persistent Storage

Trips are automatically stored using Local Storage.

Supports:

- Reload previous trips
- Delete saved trips
- Restore signatures
- Persistent log history

---

# 🖼️ Screenshots

> Replace these images with actual screenshots.

## Dashboard

```
assets/dashboard.png
```

## Route Planner

```
assets/map.png
```

## Driver Log

```
assets/logsheet.png
```

## Dark Theme

```
assets/dark-mode.png
```

---

# 🏗️ Tech Stack

## Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Leaflet
- Lucide Icons

---

## Backend

- Django 5
- Django REST Framework
- OSRM Routing API
- Nominatim Geocoder

---

# ⚙️ System Architecture

```
               User
                 │
                 ▼
        React + TypeScript
                 │
        REST API Requests
                 │
                 ▼
        Django REST Backend
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
 Nominatim API        OSRM Routing API
      │                     │
      └──────────┬──────────┘
                 ▼
          Optimized Route
                 │
                 ▼
          Leaflet Map UI
```

---

# 📂 Project Structure

```
HOS-Trip-Route-and-Log-Planner/

│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── assets/
│   └── styles/
│
├── backend/
│   ├── api/
│   ├── config/
│   ├── models/
│   ├── serializers/
│   ├── views/
│   └── urls.py
│
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/prakhar062004/HOS_Trip_Route_and_Log_Planner.git

cd HOS_Trip_Route_and_Log_Planner
```

---

# Backend Setup

```bash
cd backend

python -m venv venv
```

Windows

```bash
venv\Scripts\activate
```

Linux / Mac

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run server

```bash
python manage.py runserver
```

Backend

```
http://localhost:8000
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend

```
http://localhost:5173
```

---

# 🌍 Environment Variables

## Frontend (.env)

```env
VITE_API_URL=https://hos-trip-route-and-log-planner.onrender.com
```

---

## Backend (.env)

```env
SECRET_KEY=your_secret_key

DEBUG=False

ALLOWED_HOSTS=*
```

---

# 🚀 Deployment

## Frontend

- Vercel

## Backend

- Render

---

# 🎯 Core Functionalities

✔ Route Planning

✔ Route Optimization

✔ Leaflet Interactive Maps

✔ HOS Compliance

✔ Driver Daily Logs

✔ Auto Violation Detection

✔ Auto HOS Correction

✔ Local Storage

✔ Responsive Design

✔ Dark Mode

✔ Glassmorphism UI

✔ Animated Dashboard

---

# 📈 Future Improvements

- Authentication & Authorization
- Fleet Management
- Driver Profiles
- Multi-Vehicle Support
- PDF Report Export
- Cloud Database
- Real-time GPS Tracking
- Driver Analytics
- Fuel Consumption Analytics
- Notification System

---

# 👨‍💻 Author

**Prakhar Harnaiya**

GitHub

https://github.com/prakhar062004

LinkedIn

https://www.linkedin.com/in/prakharharnaiya

---

# ⭐ Support

If you found this project helpful,

⭐ Star this repository

🍴 Fork the project

🛠️ Contributions are welcome!

---

## 📜 License

This project is licensed under the MIT License.
