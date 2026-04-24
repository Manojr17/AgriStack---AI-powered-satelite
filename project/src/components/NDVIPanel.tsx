import { Box, Card, CardContent, Typography, Skeleton, Chip, Tooltip } from '@mui/material';
import GrassIcon from '@mui/icons-material/Grass';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { NDVIData } from '../types';

interface Props { ndvi: NDVIData | null; loading: boolean; }

export default function NDVIPanel({ ndvi, loading }: Props) {
  if (loading) return <Skeleton variant="rounded" height={160} />;
  if (!ndvi) return null;

  const healthColor = ndvi.ndvi < 0.3 ? '#EF4444' : ndvi.ndvi < 0.6 ? '#F9A825' : '#4CAF50';

  return (
    <Card sx={{
      background: `linear-gradient(135deg, rgba(46,125,50,0.08) 0%, rgba(27,94,32,0.04) 100%)`,
      border: '1px solid rgba(46,125,50,0.2)',
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GrassIcon sx={{ color: healthColor }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>NDVI Analysis</Typography>
            <Tooltip title="Normalized Difference Vegetation Index — measures crop health from satellite data">
              <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
            </Tooltip>
          </Box>
          <Chip
            label={ndvi.health}
            size="small"
            sx={{ bgcolor: `${healthColor}22`, color: healthColor, border: `1px solid ${healthColor}44`, fontWeight: 700 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: healthColor, lineHeight: 1 }}>
            {ndvi.ndvi.toFixed(3)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>NDVI</Typography>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#EF4444' }}>Stressed (&lt;0.3)</Typography>
            <Typography variant="caption" sx={{ color: '#F9A825' }}>Moderate (0.3–0.6)</Typography>
            <Typography variant="caption" sx={{ color: '#4CAF50' }}>Healthy (&gt;0.6)</Typography>
          </Box>
          <Box sx={{ position: 'relative', height: 10, borderRadius: 5, overflow: 'hidden',
            background: 'linear-gradient(to right, #EF4444 0%, #EF4444 23%, #F9A825 23%, #F9A825 46%, #4CAF50 46%, #4CAF50 100%)' }}>
            <Box sx={{
              position: 'absolute', top: -2, width: 14, height: 14,
              borderRadius: '50%', bgcolor: '#fff', border: `3px solid ${healthColor}`,
              left: `calc(${((ndvi.ndvi + 1) / 2) * 100}% - 7px)`,
              boxShadow: `0 0 8px ${healthColor}`,
            }} />
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
          {ndvi.classification}
        </Typography>
      </CardContent>
    </Card>
  );
}
