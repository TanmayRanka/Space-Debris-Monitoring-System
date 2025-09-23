# 🌌 OrbitOPS - Space Debris Monitoring & Prediction Dashboard

A futuristic fullstack web application for monitoring, analyzing, and predicting space debris and rocket interactions.

## 🚀 Features

- **Real-time Space Debris Tracking** - Monitor 14,526+ tracked objects
- **3D Visualization** - Interactive Cesium globe with orbit trajectories
- **Collision Prediction** - AI-powered risk assessment and alerts
- **Mission Simulation** - Launch planning and orbit analysis
- **Professional Dashboard** - Futuristic neon UI with dark/light themes

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern component-based architecture
- **TailwindCSS** - Utility-first styling with custom neon theme
- **CesiumJS** - 3D globe and satellite visualization
- **Leaflet** - 2D mapping with heatmap overlays
- **Plotly.js** - Interactive charts and analytics
- **React Router** - Client-side routing

### Backend
- **Flask** - Python web framework
- **TLE Parser** - Two-Line Element data processing
- **SQLite** - Local database for caching
- **CORS** - Cross-origin resource sharing
- **JWT** - Authentication tokens

## 📁 Project Structure

```
OrbitOPS/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── services/       # API calls
│   │   ├── utils/          # Helper functions
│   │   └── styles/         # Custom CSS
│   ├── public/
│   └── package.json
├── backend/                 # Flask API
│   ├── app.py              # Main application
│   ├── tle_parser.py       # TLE data processing
│   ├── services/           # Business logic
│   ├── data/               # Sample data & cache
│   └── requirements.txt
└── README.md
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🌟 Key Pages

1. **Dashboard** - Real-time stats and 2D/3D map toggle
2. **3D Visualization** - Fullscreen Cesium globe
3. **Rockets** - Launch vehicle database and risk analysis
4. **Satellites** - Active satellite tracking and management
5. **Alerts** - Collision warnings and risk notifications
6. **Simulation** - Mission planning and orbit prediction
7. **Reports** - Analytics and data export
8. **Settings** - Theme customization and preferences

## 🔐 Authentication

- **Admin Role** - Full access to all features
- **Viewer Role** - Read-only access to data
- Mock authentication for demo purposes

## 📊 Data Sources

- **CelesTrak** - Public TLE data
- **Space-Track.org** - Official space object catalog
- **Sample Data** - Fallback for offline demo

## 🎨 UI/UX Features

- **Futuristic Neon Theme** - Glowing gradients and animations
- **Responsive Design** - Mobile-first approach
- **Live Status Indicators** - Real-time connection status
- **Smooth Transitions** - Page animations and micro-interactions
- **Dark/Light Themes** - Multiple color schemes

## 🔧 Development

Built for hackathons and professional demos with:
- Clean, modular code architecture
- Comprehensive error handling
- Performance optimizations
- Accessibility compliance
- Cross-browser compatibility

---

**OrbitOPS** - Monitoring the final frontier, one orbit at a time. 🛰️