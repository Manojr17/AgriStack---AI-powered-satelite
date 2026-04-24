# 🌾 AgriStack — AI-Powered Satellite Agriculture Platform

<div align="center">

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![MUI](https://img.shields.io/badge/Material_UI-v9-007FFF?logo=mui)](https://mui.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)

**Empowering Indian farmers with real-time satellite data, AI advisory, and smart crop management.**

</div>

---

## 💡 The Idea

Agriculture in India employs over 50% of the population, yet most farmers lack access to timely, data-driven insights about their crops. Decisions about irrigation, fertilization, and pest control are still made by intuition — leading to crop losses, water waste, and reduced yields.

**AgriStack** bridges this gap by combining:
- 🛰️ **Satellite NDVI data** to monitor crop health remotely
- 🌦️ **Real-time weather intelligence** from OpenWeather API
- 🤖 **Gemini 2.5 Flash AI** to give personalized, context-aware farming advice
- 📊 **Smart alerts** that notify farmers before problems become disasters

The platform is designed to be simple enough for any farmer to use on a smartphone, while being powerful enough to deliver professional-grade agricultural intelligence.

---

## 🚀 How It Works

### 1. Farmer Registration & Profile
- Farmer signs up with name, email, location, crop type, and GPS coordinates
- Optional profile photo upload (stored in Supabase Storage)
- GPS auto-detection fills in location and coordinates automatically

### 2. Real-Time Dashboard
Once logged in, the farmer sees a live dashboard with:

| Panel | Data Source | Refresh Rate |
|-------|------------|--------------|
| 🌡️ Weather | OpenWeather API | Every 60 seconds |
| 🌿 NDVI Crop Health | Satellite simulation + seasonal model | Every 120 seconds |
| 🧠 AI Recommendations | Gemini 2.5 Flash + rule engine | Every 120 seconds |
| 🔔 Smart Alerts | Derived from weather + NDVI | Every 30 seconds |

### 3. NDVI Analysis
The **Normalized Difference Vegetation Index (NDVI)** measures how healthy and dense the crop vegetation is, on a scale from -1 to 1:

- `< 0.3` → 🔴 **Stressed** — immediate action needed
- `0.3 – 0.6` → 🟡 **Moderate** — monitor closely
- `> 0.6` → 🟢 **Healthy** — optimal growth

### 4. AI Chatbot (AgriBot)
Powered by **Google Gemini 2.5 Flash**, AgriBot is a context-aware agricultural advisor that knows:
- The farmer's current weather conditions
- Their crop type and location
- Live NDVI health index
- Current AI recommendations

Ask it anything: *"Do I need irrigation today?"*, *"What are the pest risks?"*, *"Best fertilizer schedule?"*

### 5. Smart Notifications
The notification bell auto-generates alerts based on live data:
- 🌡️ **Temperature alerts** — warns when heat stress thresholds are crossed
- 🌿 **Crop stress alerts** — triggered by low NDVI readings
- 💧 **Irrigation recommendations** — based on humidity, rainfall, and NDVI
- Each alert is tagged as **Normal / Warning / Critical**

### 6. Live Farm Tracking
An interactive satellite map (Leaflet.js) shows the farmer's exact farm location with real-time overlays.

### 7. Editable Profile
Farmers can update their name, location, address, crop type, and profile photo at any time. Changes reflect instantly across the entire app.

---

## 🌍 Impact This Platform Can Create

### For Individual Farmers
- **Reduce crop losses** by catching stress signals early through NDVI monitoring
- **Save water** with AI-driven irrigation recommendations — irrigate only when needed
- **Increase yield** by following timely, crop-specific advice from AgriBot
- **Lower costs** by optimizing fertilizer and pesticide usage

### For Indian Agriculture at Scale
- **Food security** — better yields across millions of farms means more stable food supply
- **Water conservation** — India faces severe water scarcity; smart irrigation can save billions of liters annually
- **Climate resilience** — real-time alerts help farmers adapt to extreme weather events
- **Digital inclusion** — brings precision agriculture technology to small and marginal farmers who can't afford expensive equipment

### Economic Impact
- India loses an estimated **₹50,000 crore** annually to preventable crop damage
- Precision agriculture can improve farm income by **20–30%** according to ICAR studies
- Reducing water usage by even 15% in irrigation-heavy states like Punjab and Haryana would have massive environmental benefits

### Broader Vision
AgriStack can evolve into a full **AgriTech ecosystem**:
- Integration with government schemes (PM-KISAN, crop insurance)
- Marketplace for seeds, fertilizers, and equipment
- Farmer-to-farmer knowledge sharing
- Multilingual support for regional languages
- IoT sensor integration for soil moisture and pH

---

## 🛠️ Tech Stack

```
Frontend          React 19 + TypeScript + Vite 8
UI Library        Material UI v9
Routing           React Router v7
Maps              Leaflet.js + React-Leaflet
Backend           Supabase Edge Functions (Deno/TypeScript)
Database          Supabase (PostgreSQL) with Row Level Security
Auth              Supabase Auth (email/password)
Storage           Supabase Storage (profile images)
AI                Google Gemini 2.5 Flash API
Weather           OpenWeather API
Deployment        Netlify (frontend) + Supabase (backend)
```

---

## 📁 Project Structure

```
project/
├── public/
│   ├── agristack-logo.webp
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── AIRecommendations.tsx   # AI-generated crop advice panel
│   │   ├── Chatbot.tsx             # AgriBot — Gemini 2.5 Flash chatbot
│   │   ├── InsightsPanel.tsx       # Real-time KPI cards
│   │   ├── NDVIPanel.tsx           # Crop health visualization
│   │   ├── NotificationsPanel.tsx  # Smart alerts & notifications
│   │   └── WeatherPanel.tsx        # Live weather display
│   ├── hooks/
│   │   └── useAgriData.ts          # Data fetching hooks (weather, NDVI, AI)
│   ├── lib/
│   │   └── supabase.ts             # Supabase client
│   ├── pages/
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── FarmTracking.tsx        # Satellite map view
│   │   ├── LoginPage.tsx           # Auth + registration with image upload
│   │   └── ProfilePage.tsx         # Editable farmer profile
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   └── App.tsx                     # Routing + global state
├── supabase/
│   ├── functions/
│   │   └── agristack-api/
│   │       └── index.ts            # Edge function (weather, NDVI, AI, chatbot)
│   └── migrations/                 # PostgreSQL schema migrations
└── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Supabase account
- Google Gemini API key
- OpenWeather API key

### 1. Clone the repository
```bash
git clone https://github.com/Manojr17/AgriStack---AI-powered-satelite.git
cd AgriStack---AI-powered-satelite
cd project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file inside the `project/` folder:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

### 4. Run database migrations
```bash
supabase db push
```

### 5. Deploy the Edge Function
Set secrets in Supabase dashboard → Edge Functions → agristack-api → Secrets:
- `OPENWEATHER_KEY` = your OpenWeather API key
- `GEMINI_KEY` = your Google Gemini API key

Then deploy:
```bash
supabase functions deploy agristack-api
```

### 6. Start the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_OPENWEATHER_API_KEY` | OpenWeather API key for weather data |

---

## 📸 Features at a Glance

- ✅ Farmer registration with profile photo upload
- ✅ GPS-based location detection
- ✅ Real-time weather monitoring (auto-refresh every 60s)
- ✅ NDVI crop health index with visual gauge
- ✅ AI-powered recommendations (Gemini 2.5 Flash)
- ✅ Context-aware AgriBot chatbot
- ✅ Smart notification system (temperature, NDVI, irrigation alerts)
- ✅ Editable farmer profile with instant UI updates
- ✅ Interactive satellite farm map
- ✅ Secure auth with Row Level Security (RLS)
- ✅ Fully responsive — works on mobile and desktop

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ for Indian farmers

**AgriStack** — *Grow smarter, not harder.*

</div>
