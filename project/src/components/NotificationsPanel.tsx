import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, IconButton, Popover, Badge, List,
  ListItem, Divider, Tooltip, CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import GrassIcon from '@mui/icons-material/Grass';
import OpacityIcon from '@mui/icons-material/Opacity';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import CloseIcon from '@mui/icons-material/Close';
import type { WeatherData, NDVIData, AIAnalysis } from '../types';

interface Notification {
  id: string;
  type: 'temperature' | 'ndvi' | 'irrigation' | 'general';
  level: 'normal' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface Props {
  weather: WeatherData | null;
  ndvi: NDVIData | null;
  analysis: AIAnalysis | null;
}

function buildNotifications(
  weather: WeatherData | null,
  ndvi: NDVIData | null,
  analysis: AIAnalysis | null,
  existing: Notification[]
): Notification[] {
  const now = new Date();
  const newOnes: Notification[] = [];

  if (weather) {
    if (weather.temperature > 38) {
      newOnes.push({
        id: `temp-critical-${Math.floor(now.getTime() / 300000)}`,
        type: 'temperature', level: 'critical',
        message: `Extreme heat: ${weather.temperature}°C detected. Immediate irrigation and shade nets recommended.`,
        timestamp: now, read: false,
      });
    } else if (weather.temperature > 35) {
      newOnes.push({
        id: `temp-warn-${Math.floor(now.getTime() / 300000)}`,
        type: 'temperature', level: 'warning',
        message: `High temperature: ${weather.temperature}°C. Monitor crops for heat stress.`,
        timestamp: now, read: false,
      });
    } else {
      newOnes.push({
        id: `temp-ok-${Math.floor(now.getTime() / 300000)}`,
        type: 'temperature', level: 'normal',
        message: `Temperature ${weather.temperature}°C — within optimal range for crop growth.`,
        timestamp: now, read: false,
      });
    }
  }

  if (ndvi) {
    if (ndvi.ndvi < 0.3) {
      newOnes.push({
        id: `ndvi-critical-${Math.floor(now.getTime() / 300000)}`,
        type: 'ndvi', level: 'critical',
        message: `Critical crop stress: NDVI ${ndvi.ndvi.toFixed(3)}. Immediate action required — check soil and irrigation.`,
        timestamp: now, read: false,
      });
    } else if (ndvi.ndvi < 0.5) {
      newOnes.push({
        id: `ndvi-warn-${Math.floor(now.getTime() / 300000)}`,
        type: 'ndvi', level: 'warning',
        message: `Moderate crop health: NDVI ${ndvi.ndvi.toFixed(3)}. Consider nutrient supplementation.`,
        timestamp: now, read: false,
      });
    } else {
      newOnes.push({
        id: `ndvi-ok-${Math.floor(now.getTime() / 300000)}`,
        type: 'ndvi', level: 'normal',
        message: `Healthy vegetation: NDVI ${ndvi.ndvi.toFixed(3)} — ${ndvi.health} crop condition.`,
        timestamp: now, read: false,
      });
    }
  }

  if (analysis?.irrigation_needed) {
    newOnes.push({
      id: `irr-${Math.floor(now.getTime() / 300000)}`,
      type: 'irrigation', level: 'warning',
      message: 'Irrigation recommended: Soil moisture levels indicate watering is needed soon.',
      timestamp: now, read: false,
    });
  }

  // Merge: keep existing read state for same IDs, add new ones
  const existingMap = new Map(existing.map(n => [n.id, n]));
  return newOnes.map(n => existingMap.has(n.id) ? { ...n, read: existingMap.get(n.id)!.read } : n);
}

const levelConfig = {
  normal: { color: '#4CAF50', bg: 'rgba(76,175,80,0.12)', border: 'rgba(76,175,80,0.25)', icon: <CheckCircleIcon sx={{ fontSize: 18 }} /> },
  warning: { color: '#F9A825', bg: 'rgba(249,168,37,0.12)', border: 'rgba(249,168,37,0.25)', icon: <WarningAmberIcon sx={{ fontSize: 18 }} /> },
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: <ErrorOutlinedIcon sx={{ fontSize: 18 }} /> },
};

const typeIcon = {
  temperature: <ThermostatIcon sx={{ fontSize: 16 }} />,
  ndvi: <GrassIcon sx={{ fontSize: 16 }} />,
  irrigation: <OpacityIcon sx={{ fontSize: 16 }} />,
  general: <CheckCircleIcon sx={{ fontSize: 16 }} />,
};

export default function NotificationsPanel({ weather, ndvi, analysis }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setNotifications(prev => buildNotifications(weather, ndvi, analysis, prev));
    setTimeout(() => setRefreshing(false), 400);
  }, [weather, ndvi, analysis]);

  // Build on mount and whenever data changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, [refresh]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={e => { setAnchorEl(e.currentTarget); markAllRead(); }}
          sx={{ color: unreadCount > 0 ? '#F9A825' : 'text.secondary' }}
        >
          <Badge badgeContent={unreadCount} color="error">
            {refreshing ? <CircularProgress size={20} sx={{ color: '#4CAF50' }} /> : <NotificationsIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#0D1F35',
              border: '1px solid rgba(46,125,50,0.25)',
              borderRadius: 2,
              width: 360,
              maxHeight: 480,
              overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }
          }
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(46,125,50,0.15)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Alerts & Notifications</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Chip label="Live" size="small" sx={{ bgcolor: 'rgba(76,175,80,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)', fontSize: '0.65rem', height: 20 }} />
            <IconButton size="small" onClick={() => setAnchorEl(null)} sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Notification List */}
        <List sx={{ p: 0, overflowY: 'auto', maxHeight: 380,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(46,125,50,0.3)', borderRadius: 2 },
        }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 40, mb: 1 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No alerts at this time</Typography>
            </Box>
          ) : (
            notifications.map((n, idx) => {
              const cfg = levelConfig[n.level];
              return (
                <Box key={n.id}>
                  <ListItem
                    sx={{ px: 2, py: 1.5, alignItems: 'flex-start', bgcolor: n.read ? 'transparent' : 'rgba(255,255,255,0.02)' }}
                    secondaryAction={
                      <IconButton size="small" onClick={() => dismiss(n.id)} sx={{ color: 'text.disabled', mt: -0.5 }}>
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    }
                  >
                    <Box sx={{ display: 'flex', gap: 1.5, flex: 1, pr: 2 }}>
                      <Box sx={{
                        p: 0.75, borderRadius: 1.5, bgcolor: cfg.bg,
                        border: `1px solid ${cfg.border}`, color: cfg.color,
                        display: 'flex', alignItems: 'center', flexShrink: 0, height: 'fit-content',
                      }}>
                        {typeIcon[n.type]}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Box sx={{ color: cfg.color, display: 'flex' }}>{cfg.icon}</Box>
                          <Chip
                            label={n.level.charAt(0).toUpperCase() + n.level.slice(1)}
                            size="small"
                            sx={{ bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: '0.6rem', height: 18, fontWeight: 700 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.5, color: 'text.primary' }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                          {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                </Box>
              );
            })
          )}
        </List>

        {/* Footer */}
        <Box sx={{ p: 1.5, borderTop: '1px solid rgba(46,125,50,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Auto-refreshes every 30s
          </Typography>
          <Chip
            label="Refresh Now"
            size="small"
            onClick={refresh}
            sx={{ cursor: 'pointer', bgcolor: 'rgba(46,125,50,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)', fontSize: '0.65rem' }}
          />
        </Box>
      </Popover>
    </>
  );
}
