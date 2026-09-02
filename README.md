# Vital — Clinical Physiological Health Analysis Platform

Vital is a next-generation clinical physiological health evaluation and diagnostics intelligence platform designed to analyze vitals, symptoms, live medical facilities, and longitudinal health activity.

---

## 🌟 Key Features

1. **Predict (Physiological Measurement Analysis)**:
   - Evaluates 9 physiological vitals (Heart Rate, SpO₂, Blood Pressure, Fahrenheit Body Temperature, Respiratory Rate, Blood Glucose, Thyroid TSH, Device Telemetry).
   - Generates overall Health Rate score (0–100) and Clinical Risk Classifications (`LOW / NORMAL`, `SEMI-RISK`, `RISK`, `EMERGENCY`).
   - Interactive visual parameter range analysis tracks, measurement variance bar charts, and status distribution donut charts.

2. **Symptom Analysis**:
   - Natural language symptom analysis for users without monitoring hardware.
   - Clinical insights, urgency assessments, home self-care recommendations, and specialty recommendations.

3. **Nearby Care & Doctors (Live GPS)**:
   - Real-time OpenStreetMap Overpass & Nominatim geospatial integration.
   - Discovers verified open 24/7 trauma hospitals, specialized clinics, and certified practitioners.
   - Operating hours, contact options, and one-click Google Maps turn-by-turn navigation.

4. **Health History & Activity Archive**:
   - Comprehensive timeline of past assessments with activity metrics.
   - Detailed past report inspection, JSON export, and record management.

5. **Juli Assistant**:
   - Ultra-concise, precision-driven clinical health companion.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**

### Installation
```bash
# Clone the repository
git clone https://github.com/Eswar5048/vital-health-analysis.git

# Navigate into project directory
cd vital-health-analysis

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_HEALTH_API_KEY=your_gemini_api_key_here
GEMINI_JULI_API_KEY=your_gemini_api_key_here
```

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

---

## 📄 License
MIT License. Built for clinical physiological research and health analytics.
