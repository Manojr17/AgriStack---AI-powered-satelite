import { useState, useEffect, useCallback } from 'react';
import { EDGE_FUNCTION_URL } from '../lib/supabase';
import type { WeatherData, NDVIData, AIAnalysis } from '../types';

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const headers = { 'Authorization': `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' };

export function useWeather(lat: number, lon: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = useCallback(async () => {
    if (!lat || !lon) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}/weather?lat=${lat}&lon=${lon}`, { headers });
      const data = await res.json();
      if (data.weather) {
        setWeather({
          temperature: Math.round(data.weather.main?.temp ?? 0),
          humidity: data.weather.main?.humidity ?? 0,
          description: data.weather.weather?.[0]?.description ?? '',
          windSpeed: data.weather.wind?.speed ?? 0,
          rainfall: data.weather.rain?.['1h'] ?? data.forecast?.list?.[0]?.rain?.['3h'] ?? 0,
          icon: data.weather.weather?.[0]?.icon ?? '01d',
          cityName: data.weather.name ?? '',
        });
      }
    } catch (e) { setError('Failed to fetch weather'); }
    setLoading(false);
  }, [lat, lon]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);
  useEffect(() => { const timer = setInterval(fetchWeather, 60000); return () => clearInterval(timer); }, [fetchWeather]);
  return { weather, loading, error, refetch: fetchWeather };
}

export function useNDVI(lat: number, lon: number) {
  const [ndvi, setNdvi] = useState<NDVIData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNDVI = useCallback(async () => {
    if (!lat || !lon) return;
    setLoading(true);
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}/ndvi?lat=${lat}&lon=${lon}`, { headers });
      const data = await res.json();
      setNdvi(data);
    } catch (e) {}
    setLoading(false);
  }, [lat, lon]);

  useEffect(() => { fetchNDVI(); }, [fetchNDVI]);
  useEffect(() => { const timer = setInterval(fetchNDVI, 120000); return () => clearInterval(timer); }, [fetchNDVI]);
  return { ndvi, loading, refetch: fetchNDVI };
}

export function useAnalysis(weather: WeatherData | null, ndvi: NDVIData | null, cropType: string) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    if (!weather || !ndvi) return;
    setLoading(true);
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}/analyze`, {
        method: 'POST', headers,
        body: JSON.stringify({
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall,
          ndvi: ndvi.ndvi,
          crop_type: cropType,
        }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (e) {}
    setLoading(false);
  }, [weather, ndvi, cropType]);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);
  useEffect(() => { const timer = setInterval(fetchAnalysis, 120000); return () => clearInterval(timer); }, [fetchAnalysis]);
  return { analysis, loading, refetch: fetchAnalysis };
}
