import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENWEATHER_KEY = Deno.env.get("OPENWEATHER_KEY") ?? "";
const GEMINI_KEY = Deno.env.get("GEMINI_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/agristack-api", "");

    if (path === "/weather" || path === "/weather/") {
      const lat = url.searchParams.get("lat") || "13.0827";
      const lon = url.searchParams.get("lon") || "80.2707";
      const city = url.searchParams.get("city") || "Chennai";

      let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric&cnt=8`;
      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();

      return new Response(JSON.stringify({ weather: weatherData, forecast: forecastData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/ndvi" || path === "/ndvi/") {
      const lat = parseFloat(url.searchParams.get("lat") || "13.0827");
      const lon = parseFloat(url.searchParams.get("lon") || "80.2707");

      // Simulate NDVI based on location and season
      const month = new Date().getMonth();
      const baseNdvi = 0.4 + Math.sin(month * 0.5) * 0.15;
      const ndvi = Math.min(0.85, Math.max(0.1, baseNdvi + (Math.random() - 0.5) * 0.1));

      let health = "Moderate";
      let color = "#F59E0B";
      if (ndvi < 0.3) { health = "Stressed"; color = "#EF4444"; }
      else if (ndvi >= 0.6) { health = "Healthy"; color = "#22C55E"; }

      return new Response(JSON.stringify({
        ndvi: parseFloat(ndvi.toFixed(3)),
        health,
        color,
        lat,
        lon,
        timestamp: new Date().toISOString(),
        classification: ndvi < 0.3 ? "Crop Stress" : ndvi < 0.6 ? "Moderate Growth" : "Healthy Vegetation",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/analyze" || path === "/analyze/") {
      const body = await req.json();
      const { temperature, humidity, rainfall, ndvi, crop_type } = body;

      const recommendations: string[] = [];
      let alert_level = "normal";
      let irrigation_needed = false;
      let health_status = "Good";

      if (temperature > 35 && ndvi < 0.3) {
        recommendations.push("HIGH ALERT: Extreme heat combined with low vegetation index detected. Immediate irrigation required.");
        alert_level = "critical";
        irrigation_needed = true;
        health_status = "Critical";
      } else if (temperature > 35) {
        recommendations.push("Heat stress warning: Temperature exceeds 35°C. Consider providing shade nets or misting.");
        alert_level = "warning";
        health_status = "Stressed";
      } else if (ndvi < 0.3) {
        recommendations.push("Low NDVI detected: Crop shows signs of stress. Check soil moisture and nutrient levels.");
        alert_level = "warning";
        health_status = "Stressed";
        irrigation_needed = true;
      } else if (ndvi >= 0.6) {
        recommendations.push("Excellent crop health: NDVI indicates strong vegetation. Maintain current irrigation schedule.");
        health_status = "Excellent";
      }

      if (humidity < 40) {
        recommendations.push("Low humidity: Consider increasing irrigation frequency to prevent moisture stress.");
        irrigation_needed = true;
      } else if (humidity > 80) {
        recommendations.push("High humidity: Monitor for fungal diseases. Ensure proper air circulation.");
      }

      if (rainfall > 20) {
        recommendations.push("Significant rainfall: Skip irrigation for next 48 hours to prevent waterlogging.");
        irrigation_needed = false;
      }

      if (crop_type === "rice" || crop_type === "paddy") {
        recommendations.push("Rice-specific: Maintain 5-10cm water level in paddy fields for optimal growth.");
      } else if (crop_type === "wheat") {
        recommendations.push("Wheat-specific: Ensure proper drainage after any irrigation event.");
      } else if (crop_type === "cotton") {
        recommendations.push("Cotton-specific: Watch for bollworm activity during high humidity periods.");
      }

      if (recommendations.length === 0) {
        recommendations.push("Conditions are optimal. Continue current agricultural practices.");
      }

      return new Response(JSON.stringify({
        recommendations,
        alert_level,
        irrigation_needed,
        health_status,
        score: ndvi >= 0.6 ? 85 : ndvi >= 0.3 ? 60 : 30,
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/chatbot" || path === "/chatbot/") {
      const body = await req.json();
      const { message, context } = body;

      const systemPrompt = `You are AgriBot, an expert AI agricultural advisor for the AgriStack platform. 
You help Indian farmers with crop management, irrigation, pest control, and weather-related decisions.
Current farmer context:
- Farmer: ${context?.farmer_name || "Unknown"}
- Crop: ${context?.crop_type || "Unknown"}  
- Location: ${context?.location || "Unknown"}
- Temperature: ${context?.temperature || "N/A"}°C
- Humidity: ${context?.humidity || "N/A"}%
- NDVI (Crop Health Index): ${context?.ndvi || "N/A"} (${context?.ndvi_health || "Unknown"})
- Recommendations: ${context?.recommendations?.join("; ") || "None"}

Provide concise, practical advice in 2-3 sentences. Be specific to the farmer's current conditions.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: systemPrompt + "\n\nFarmer's question: " + message }] }
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
          }),
        }
      );

      const geminiData = await geminiRes.json();
      const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 
        "I'm having trouble connecting right now. Please check your crop conditions manually.";

      return new Response(JSON.stringify({ reply, timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found", path }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
