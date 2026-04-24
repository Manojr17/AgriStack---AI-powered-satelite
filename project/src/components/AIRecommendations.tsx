import { Box, Card, CardContent, Typography, Skeleton, Chip, Divider } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import OpacityIcon from '@mui/icons-material/Opacity';
import type { AIAnalysis } from '../types';

interface Props { analysis: AIAnalysis | null; loading: boolean; }

export default function AIRecommendations({ analysis, loading }: Props) {
  if (loading) return <Skeleton variant="rounded" height={200} />;
  if (!analysis) return null;

  const alertConfig = {
    normal: { color: '#4CAF50', icon: <CheckCircleIcon />, label: 'All Good' },
    warning: { color: '#F9A825', icon: <WarningAmberIcon />, label: 'Warning' },
    critical: { color: '#EF4444', icon: <ErrorOutlinedIcon />, label: 'Critical Alert' },
  };

  const cfg = alertConfig[analysis.alert_level];

  return (
    <Card sx={{
      background: `linear-gradient(135deg, rgba(${analysis.alert_level === 'critical' ? '239,68,68' : analysis.alert_level === 'warning' ? '249,168,37' : '46,125,50'},0.08) 0%, rgba(0,0,0,0.1) 100%)`,
      border: `1px solid ${cfg.color}33`,
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon sx={{ color: cfg.color }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>AI Recommendations</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={cfg.icon}
              label={cfg.label}
              size="small"
              sx={{ bgcolor: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44`, fontWeight: 700 }}
            />
            {analysis.irrigation_needed && (
              <Chip icon={<OpacityIcon />} label="Irrigate Now" size="small"
                sx={{ bgcolor: 'rgba(41,182,246,0.15)', color: '#29B6F6', border: '1px solid rgba(41,182,246,0.3)', fontWeight: 700 }} />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{analysis.score}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Crop Score</Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Health Status</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: cfg.color }}>{analysis.health_status}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderColor: `${cfg.color}22` }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {analysis.recommendations.map((rec, i) => (
            <Box key={i} sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5,
              bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <Box sx={{ color: cfg.color, mt: 0.2, flexShrink: 0, fontSize: 18 }}>{cfg.icon}</Box>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{rec}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
