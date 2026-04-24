import { Box, Card, CardContent, Typography, Grid, Chip, LinearProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import GrassIcon from '@mui/icons-material/Grass';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import OpacityIcon from '@mui/icons-material/Opacity';
import type { WeatherData, NDVIData, AIAnalysis } from '../types';

interface Props {
  weather: WeatherData | null;
  ndvi: NDVIData | null;
  analysis: AIAnalysis | null;
  cropType: string;
}

function InsightCard({ icon, title, value, sub, color, progress }: any) {
  return (
    <Card sx={{
      background: `linear-gradient(135deg, rgba(${color},0.1) 0%, rgba(13,31,53,0.9) 100%)`,
      border: `1px solid rgba(${color},0.2)`, height: '100%',
      transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px rgba(${color},0.2)` }
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box sx={{ color: `rgb(${color})`, display: 'flex', p: 0.75, bgcolor: `rgba(${color},0.15)`, borderRadius: 1.5 }}>
            {icon}
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: `rgb(${color})`, mb: 0.5 }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: progress !== undefined ? 1 : 0 }}>{sub}</Typography>
        {progress !== undefined && (
          <LinearProgress variant="determinate" value={progress} sx={{
            height: 4, borderRadius: 2, bgcolor: `rgba(${color},0.1)`,
            '& .MuiLinearProgress-bar': { bgcolor: `rgb(${color})`, borderRadius: 2 }
          }} />
        )}
      </CardContent>
    </Card>
  );
}

export default function InsightsPanel({ weather, ndvi, analysis, cropType }: Props) {
  if (!weather && !ndvi && !analysis) return null;

  const temp = weather?.temperature;
  const humidity = weather?.humidity;
  const ndviVal = ndvi?.ndvi;
  const healthStatus = analysis?.health_status || ndvi?.health || 'Unknown';
  const alertLevel = analysis?.alert_level || 'normal';

  const alertColor = alertLevel === 'critical' ? '239,68,68' : alertLevel === 'warning' ? '249,168,37' : '76,175,80';
  const ndviColor = ndviVal !== undefined ? (ndviVal < 0.3 ? '239,68,68' : ndviVal < 0.6 ? '249,168,37' : '76,175,80') : '76,175,80';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon sx={{ color: '#4CAF50' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Real-Time Insights</Typography>
        </Box>
        <Chip
          label={`${cropType.charAt(0).toUpperCase() + cropType.slice(1)} Farm`}
          size="small"
          sx={{ bgcolor: 'rgba(46,125,50,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)', fontWeight: 600 }}
        />
      </Box>

      <Grid container spacing={2}>
        {temp !== undefined && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <InsightCard
              icon={<ThermostatIcon fontSize="small" />}
              title="Temperature"
              value={`${temp}°C`}
              sub={temp > 35 ? 'Heat stress risk!' : temp > 25 ? 'Warm conditions' : 'Optimal range'}
              color={temp > 35 ? '239,68,68' : temp > 25 ? '249,168,37' : '76,175,80'}
              progress={Math.min(100, (temp / 45) * 100)}
            />
          </Grid>
        )}
        {ndviVal !== undefined && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <InsightCard
              icon={<GrassIcon fontSize="small" />}
              title="Crop Health"
              value={ndvi?.health}
              sub={`NDVI: ${ndviVal.toFixed(3)}`}
              color={ndviColor}
              progress={(ndviVal + 0.2) / 1.2 * 100}
            />
          </Grid>
        )}
        {humidity !== undefined && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <InsightCard
              icon={<OpacityIcon fontSize="small" />}
              title="Humidity"
              value={`${humidity}%`}
              sub={humidity > 80 ? 'Disease risk high' : humidity < 40 ? 'Too dry' : 'Good moisture'}
              color="41,182,246"
              progress={humidity}
            />
          </Grid>
        )}
        {analysis && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <InsightCard
              icon={<LightbulbOutlinedIcon fontSize="small" />}
              title="Overall Status"
              value={analysis.irrigation_needed ? 'Irrigate!' : healthStatus}
              sub={`Score: ${analysis.score}/100`}
              color={alertColor}
              progress={analysis.score}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
