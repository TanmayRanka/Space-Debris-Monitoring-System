# 🛰️ OrbitOPS - Space Debris Monitoring & Prediction Dashboard

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.158.0-orange.svg)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.5-cyan.svg)](https://tailwindcss.com/)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-1.111.0-purple.svg)](https://cesium.com/)

> **Advanced Space Debris Monitoring & Prediction Dashboard with Hyperrealistic 3D Visualization**

A cutting-edge space debris monitoring and prediction system featuring an immersive 3D visualization dashboard. Built for hackathons and real-world applications, it provides real-time tracking of space debris, satellites, and orbital predictions with stunning visual effects.

## ✨ Key Features

### 🌍 **Hyperrealistic 3D Visualization**
- **Glowing Sun**: Dynamic solar activity with corona effects and lens flares
- **Photorealistic Earth**: PBR materials with detailed surface textures
- **Advanced Atmosphere**: Real-time scattering with day/night transitions
- **Water Reflections**: Specular and roughness mapping for realistic oceans
- **Time-Synchronized Animation**: All celestial bodies move in real-time

### 🛰️ **Space Debris Tracking**
- **Real-time Monitoring** - Track 14,526+ space objects from CelesTrak
- **Interactive 3D Globe** - Cesium-powered visualization with orbit trajectories
- **Collision Prediction** - AI-powered risk assessment and alerts
- **Mission Simulation** - Launch planning and orbit analysis
- **Professional Dashboard** - Futuristic neon UI with dark/light themes

## 🚀 Technology Stack

### **Frontend**
- **React 18.2.0** - Modern UI framework with hooks and context
- **Three.js 0.158.0** - Advanced 3D graphics and hyperrealistic visualization
- **TailwindCSS 3.3.5** - Utility-first styling with custom neon theme
- **CesiumJS 1.111.0** - Geospatial 3D mapping and satellite visualization
- **Leaflet** - 2D mapping with heatmap overlays
- **Plotly.js** - Interactive charts and analytics
- **React Router** - Client-side routing
- **Heroicons** - Beautiful icon library

### **Backend**
- **Flask 2.3.3** - Python web framework with RESTful APIs
- **SGP4** - Satellite orbit propagation algorithms
- **Skyfield** - Astronomical calculations and celestial mechanics
- **NumPy & Pandas** - High-performance data processing
- **Matplotlib & Plotly** - Data visualization and charting
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

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ and Yarn
- Python 3.8+
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/orbitops-space-debris-dashboard.git
cd orbitops-space-debris-dashboard
```

### **2. Frontend Setup**
```bash
cd frontend
yarn install
yarn start
```
The frontend will run on `http://localhost:3000`

### **3. Backend Setup**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows | source venv/bin/activate # macOS/Linux
pip install -r requirements.txt
python app.py
```
The backend API will run on `http://localhost:5000`

## 🎯 Usage

1. **Launch the Application**: Open `http://localhost:3000` in your browser
2. **Explore 3D View**: Navigate the hyperrealistic Earth and space environment
3. **Track Debris**: View real-time positions of space debris and satellites
4. **Analyze Data**: Use the dashboard for statistics and predictions
5. **Interactive Features**: Click on objects for detailed information

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