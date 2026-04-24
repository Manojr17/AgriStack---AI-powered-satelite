import { Box, Card, CardContent, Typography, Grid, Skeleton, Chip } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import GrainIcon from '@mui/icons-material/Grain';
import type { WeatherData } from '../types';

interface Props { weather: WeatherData | null; loading: boolean; }

function StatCard({ icon, label, value, unit, color }: any) {
  return (
    <Card sx={{
      background: `linear-gradient(135deg, rgba(${color},0.12) 0%, rgba(${color},0.05) 100%)`,
      border: `1px solid rgba(${color},0.2)`,
      transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' }
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ color: `rgb(${color})`, display: 'flex' }}>{icon}</Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            {label}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: `rgb(${color})` }}>
          {value}<Typography component="span" variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>{unit}</Typography>
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function WeatherPanel({ weather, loading }: Props) {
  if (loading) return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Weather Conditions</Typography>
      <Grid container spacing={2}>
        {[1,2,3,4].map(i => <Grid size={{ xs: 6, sm: 3 }} key={i}><Skeleton variant="rounded" height={100} /></Grid>)}
      </Grid>
    </Box>
  );

  if (!weather) return null;

  const isHot = weather.temperature > 35;
  const isHumid = weather.humidity > 70;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Weather — {weather.cityName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isHot && <Chip label="Heat Alert" size="small" color="error" sx={{ fontWeight: 600 }} />}
          {isHumid && <Chip label="High Humidity" size="small" sx={{ bgcolor: 'rgba(41,182,246,0.15)', color: '#29B6F6', borderColor: '#29B6F6', border: '1px solid' }} />}
        </Box>
      </Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          component="img"
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          sx={{ width: 48, height: 48 }}
        />
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
          {weather.description}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<ThermostatIcon />} label="Temperature" value={weather.temperature} unit="°C" color={isHot ? '239,68,68' : '76,175,80'} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<WaterDropIcon />} label="Humidity" value={weather.humidity} unit="%" color="41,182,246" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<AirIcon />} label="Wind Speed" value={weather.windSpeed} unit="m/s" color="249,168,37" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<GrainIcon />} label="Rainfall" value={weather.rainfall.toFixed(1)} unit="mm" color="100,181,246" />
        </Grid>
      </Grid>
    </Box>
  );
}
