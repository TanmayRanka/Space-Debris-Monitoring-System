# 🌌 PROJECT GENESIS: OrbitOPS - The Ultimate Space Traffic Control System

**ROLE**: You are a Tier-1 Chief Architect and Lead Full-Stack Engineer at a top-secret space agency. Your mission is to build "OrbitOPS" — a mission-critical, futuristic Space Debris Monitoring & Prediction Dashboard.

**OBJECTIVE**: Build a high-performance, visually stunning web application that tracks over 14,000 space objects (satellites, debris, rocket bodies) in real-time. This is NOT a boring admin panel. This is a Sci-Fi "Mission Control" interface that looks like it belongs in a Marvel movie or a high-end video game, but with real-world scientific accuracy.

---

## 🛠️ THE TECH STACK (Non-Negotiable)

*   **Frontend**: React 18 (Functional Components, Hooks), Vite/CRA.
*   **Styling**: TailwindCSS (Utility-first), Framer Motion (Complex Animations).
*   **3D Visualization**: CesiumJS (Primary Globe) OR Three.js (WebGL rendering).
*   **Backend**: Flask (Python 3.9+) with RESTful API architecture.
*   **Science/Math**: SGP4 (Orbital propagation), Skyfield (Astronomy), TLE (Two-Line Element) parsing.
*   **Data Visualization**: Recharts or Plotly.js for high-speed analytics.
*   **State Management**: React Context API.

---

## 🎨 DESIGN LANGUAGE: "NEON COSMOS"

*   **Vibe**: Cyberpunk meets NASA. Dark, immersive, glowing.
*   **Palette**: Deep Space Black (`#0a0a1a`), Neon Cyan (`#00ffff`), Plasma Purple (`#8b5cf6`), Warning Red (`#ff0000`).
*   **UI Elements**:
    *   **Glassmorphism**: Translucent panels with background blur (`backdrop-blur-xl`).
    *   **HUD Interface**: Thin grid lines, technical markers, monospace data readouts (`Orbitron` font).
    *   **Micro-Interactions**: Hover glows, magnetic buttons, smooth staggered animations.
    *   **Performance**: ALL animations must hit 60fps. No lag allowed.

---

## 🚀 CORE FEATURES TO BUILD

### 1. 🌍 The Holo-Globe (Home/Dashboard)
*   A fully interactive 3D Earth.
*   Render thousands of orbital paths in real-time.
*   Color-code objects: Green (Active Satellites), Red (Debris), Yellow (Rocket Bodies).
*   **Click-to-Inspect**: Clicking a dot opens a holographic detail card with live telemetry (Altitude, Velocity, Country).

### 2. ⚠️ Collision Prediction Engine (AI-Powered)
*   **The Problem**: Space is crowded. Things hit each other.
*   **The Solution**: An algorithm that calculates "Conjunction Assessments" (close approaches).
*   **UI**: A "Threat Level" dashboard showing objects with high collision probability in the next 24 hours.

### 3. 🚀 Launch Mission Planner
*   A tool for rocket scientists to find a safe "Launch Window."
*   User inputs trajectory; System simulates the path and checks for debris intersections.
*   Visual output: A safe tunnel vs. a red "GO/NO-GO" warning.

### 4. 📊 Analytics & Intel
*   Interactive charts showing the growth of space debris over decades.
*   Heatmaps of "High Traffic Zones" (LEO vs. GEO).
*   Breakdown by country (Who is polluting space the most?).

---

## 📝 IMPLEMENTATION STRATEGY

**Step 1: The Backend Core (Flask)**
*   Set up a robust API structure.
*   Implement `tle_parser.py` to fetch data from CelesTrak/Space-Track.org.
*   Create endpoints: `/api/debris`, `/api/predict`, `/api/stats`.

**Step 2: The Visual Frontend (React)**
*   Build the `Layout` shell (Sidebar, Navbar) with the "Neon Cosmos" theme.
*   Integrate the 3D Globe component.
*   Fetch live data and render points on the globe.

**Step 3: The Intelligence**
*   Connect the frontend charts to backend analytics.
*   Implement the collision prediction logic using SGP4.

---

## ⚡ YOUR INSTRUCTIONS

1.  **Initialize**: Give me the folder structure and `package.json` / `requirements.txt`.
2.  **Scaffold**: Write the core React components (Globe, Layout) and Flask app entry point.
3.  **Style**: Provide the `tailwind.config.js` and global CSS for the neon effects.
4.  **Execute**: Write the critical code for TLE parsing and 3D rendering.

**GO! Build the future of Space Traffic Management.**
