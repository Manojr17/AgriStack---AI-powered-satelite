import { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip, CircularProgress, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useWeather, useNDVI } from '../hooks/useAgriData';
import type { Session } from '@supabase/supabase-js';
import type { Farmer } from '../types';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props { session: Session; }

export default function FarmTracking({ session }: Props) {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLayer, setMapLayer] = useState<'satellite' | 'terrain'>('satellite');

  useEffect(() => {
    supabase.from('farmers').select('*').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => { setFarmer(data); setLoading(false); });
  }, [session.user.id]);

  const lat = farmer?.lat || 13.0827;
  const lon = farmer?.lon || 80.2707;
  const { weather } = useWeather(lat, lon);
  const { ndvi } = useNDVI(lat, lon);

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <CircularProgress sx={{ color: '#4CAF50' }} />
    </Box>
  );

  const ndviColor = ndvi ? (ndvi.ndvi < 0.3 ? '#EF4444' : ndvi.ndvi < 0.6 ? '#F9A825' : '#4CAF50') : '#4CAF50';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: 2, display: 'flex', alignItems: 'center', gap: 2,
        background: 'linear-gradient(90deg, rgba(13,31,53,0.98) 0%, rgba(27,94,32,0.15) 100%)',
        borderBottom: '1px solid rgba(46,125,50,0.2)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 1000,
      }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}
          sx={{ color: '#4CAF50', '&:hover': { bgcolor: 'rgba(46,125,50,0.1)' } }}>
          Dashboard
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Live Farm Tracking</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {farmer?.location} — {lat.toFixed(4)}, {lon.toFixed(4)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip icon={<SatelliteAltIcon />} label={mapLayer === 'satellite' ? 'Satellite View' : 'Terrain View'}
            onClick={() => setMapLayer(prev => prev === 'satellite' ? 'terrain' : 'satellite')}
            sx={{ cursor: 'pointer', bgcolor: 'rgba(46,125,50,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)' }} />
          {ndvi && (
            <Chip label={`NDVI: ${ndvi.ndvi.toFixed(3)}`}
              sx={{ bgcolor: `${ndviColor}22`, color: ndviColor, border: `1px solid ${ndviColor}44`, fontWeight: 700 }} />
          )}
        </Box>
      </Box>

      {/* Map */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[lat, lon]} zoom={14} style={{ height: 'calc(100vh - 70px)', width: '100%' }}>
          {mapLayer === 'satellite' ? (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri &mdash; Source: Esri, DigitalGlobe'
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
          )}

          <Circle center={[lat, lon]} radius={500}
            pathOptions={{ color: ndviColor, fillColor: ndviColor, fillOpacity: 0.15, weight: 2, dashArray: '5,5' }} />

          <Marker position={[lat, lon]}>
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{farmer?.name}'s Farm</Typography>
                <Typography variant="body2">{farmer?.crop_type?.toUpperCase()}</Typography>
                {weather && <Typography variant="body2">🌡️ {weather.temperature}°C | 💧 {weather.humidity}%</Typography>}
                {ndvi && <Typography variant="body2" sx={{ color: ndviColor }}>NDVI: {ndvi.ndvi.toFixed(3)} — {ndvi.health}</Typography>}
              </Box>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating info cards */}
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {weather && (
            <Paper sx={{ p: 1.5, bgcolor: 'rgba(10,22,40,0.92)', border: '1px solid rgba(46,125,50,0.3)', borderRadius: 2, backdropFilter: 'blur(12px)' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>WEATHER</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50', lineHeight: 1 }}>{weather.temperature}°C</Typography>
              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{weather.description}</Typography>
            </Paper>
          )}
          {ndvi && (
            <Paper sx={{ p: 1.5, bgcolor: 'rgba(10,22,40,0.92)', border: `1px solid ${ndviColor}44`, borderRadius: 2, backdropFilter: 'blur(12px)' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>NDVI</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: ndviColor, lineHeight: 1 }}>{ndvi.ndvi.toFixed(3)}</Typography>
              <Typography variant="caption">{ndvi.health}</Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
