import { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Button, Card, CardContent,
  Avatar, Chip, IconButton, CircularProgress, Divider, AppBar,
  Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  LinearProgress, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useWeather, useNDVI, useAnalysis } from '../hooks/useAgriData';
import WeatherPanel from '../components/WeatherPanel';
import NDVIPanel from '../components/NDVIPanel';
import AIRecommendations from '../components/AIRecommendations';
import InsightsPanel from '../components/InsightsPanel';
import Chatbot from '../components/Chatbot';
import NotificationsPanel from '../components/NotificationsPanel';
import type { Session } from '@supabase/supabase-js';
import type { Farmer } from '../types';

interface Props {
  session: Session;
  farmer: Farmer | null;
  onFarmerUpdate: (farmer: Farmer) => void;
}

export default function Dashboard({ session, farmer, onFarmerUpdate }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!farmer);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load farmer if not passed from App
  useEffect(() => {
    if (!farmer) {
      supabase.from('farmers').select('*').eq('user_id', session.user.id).maybeSingle()
        .then(({ data }) => {
          if (data) onFarmerUpdate(data as Farmer);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session.user.id, farmer, onFarmerUpdate]);

  const lat = farmer?.lat || 13.0827;
  const lon = farmer?.lon || 80.2707;

  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeather(lat, lon);
  const { ndvi, loading: ndviLoading, refetch: refetchNDVI } = useNDVI(lat, lon);
  const { analysis, loading: analysisLoading, refetch: refetchAnalysis } = useAnalysis(weather, ndvi, farmer?.crop_type || 'wheat');

  const handleRefresh = () => {
    refetchWeather(); refetchNDVI(); refetchAnalysis();
    setLastRefresh(new Date());
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#4CAF50', mb: 2 }} size={48} />
        <Typography sx={{ color: 'text.secondary' }}>Loading your farm data...</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="sticky" elevation={0} sx={{
        background: 'linear-gradient(90deg, rgba(10,22,40,0.98) 0%, rgba(27,94,32,0.1) 100%)',
        borderBottom: '1px solid rgba(46,125,50,0.2)',
        backdropFilter: 'blur(20px)',
      }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ color: '#4CAF50', mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <Box
              component="img" src="/agristack-logo.webp" alt="AgriStack"
              sx={{ height: 32, filter: 'drop-shadow(0 0 8px rgba(46,125,50,0.5))' }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>
                <Box component="span" sx={{ color: '#4CAF50' }}>Agri</Box>
                <Box component="span" sx={{ color: '#F9A825' }}>Stack</Box>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>Dashboard</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}>
              <IconButton onClick={handleRefresh} sx={{ color: '#4CAF50' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {/* Notifications Panel */}
            <NotificationsPanel weather={weather} ndvi={ndvi} analysis={analysis} />

            {/* Profile Avatar — navigates to /profile */}
            <Tooltip title="View Profile">
              <IconButton onClick={() => navigate('/profile')} sx={{ p: 0.5 }}>
                <Avatar
                  src={farmer?.profile_image_url || undefined}
                  sx={{ bgcolor: '#2E7D32', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', border: '2px solid rgba(76,175,80,0.4)' }}
                >
                  {!farmer?.profile_image_url && (farmer?.name?.charAt(0)?.toUpperCase() || 'F')}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { bgcolor: '#0D1F35', border: '1px solid rgba(46,125,50,0.2)', width: 260 } } }}>
        <Box sx={{ p: 3 }}>
          <Box component="img" src="/agristack-logo.webp" alt="AgriStack" sx={{ height: 40, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            <Box component="span" sx={{ color: '#4CAF50' }}>Agri</Box>
            <Box component="span" sx={{ color: '#F9A825' }}>Stack</Box>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Digital Agriculture Platform</Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(46,125,50,0.2)' }} />
        <List sx={{ px: 1 }}>
          {[
            { icon: <DashboardIcon />, label: 'Dashboard', action: () => { setDrawerOpen(false); } },
            { icon: <SatelliteAltIcon />, label: 'Live Farm Tracking', action: () => { navigate('/farm-tracking'); setDrawerOpen(false); } },
            { icon: <PersonIcon />, label: 'My Profile', action: () => { navigate('/profile'); setDrawerOpen(false); } },
            { icon: <SmartToyIcon />, label: 'AI Chatbot', action: () => { setDrawerOpen(false); } },
          ].map(item => (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton onClick={item.action}
                sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(46,125,50,0.15)' } }}>
                <ListItemIcon sx={{ color: '#4CAF50', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 500 } } }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button fullWidth startIcon={<LogoutIcon />} onClick={handleLogout}
            sx={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
            Sign Out
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Farmer Profile Header */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, rgba(27,94,32,0.2) 0%, rgba(13,31,53,0.9) 60%, rgba(249,168,37,0.05) 100%)', border: '1px solid rgba(46,125,50,0.25)' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid>
                {/* Clickable avatar → profile */}
                <Tooltip title="View Profile">
                  <Avatar
                    src={farmer?.profile_image_url || undefined}
                    onClick={() => navigate('/profile')}
                    sx={{
                      width: 72, height: 72,
                      bgcolor: '#2E7D32',
                      fontSize: '1.8rem', fontWeight: 800,
                      border: '3px solid rgba(76,175,80,0.5)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'scale(1.05)', boxShadow: '0 0 16px rgba(76,175,80,0.5)' },
                    }}
                  >
                    {!farmer?.profile_image_url && (farmer?.name?.charAt(0)?.toUpperCase() || 'F')}
                  </Avatar>
                </Tooltip>
              </Grid>
              <Grid size="grow">
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{farmer?.name || 'Farmer'}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 14, color: '#4CAF50' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{farmer?.location} — {farmer?.address}</Typography>
                </Box>
              </Grid>
              <Grid>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Chip
                    icon={<AgricultureIcon />}
                    label={`${farmer?.crop_type?.charAt(0).toUpperCase()}${farmer?.crop_type?.slice(1)} Farm`}
                    sx={{ bgcolor: 'rgba(46,125,50,0.2)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)', fontWeight: 700 }}
                  />
                  {analysis && (
                    <Chip
                      label={analysis.alert_level === 'critical' ? 'Critical Alert' : analysis.alert_level === 'warning' ? 'Needs Attention' : 'Farm Active'}
                      color={analysis.alert_level === 'critical' ? 'error' : analysis.alert_level === 'warning' ? 'warning' : 'success'}
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                  <Button variant="outlined" startIcon={<PersonIcon />}
                    onClick={() => navigate('/profile')}
                    sx={{ fontWeight: 600, borderColor: 'rgba(76,175,80,0.4)', color: '#4CAF50', '&:hover': { bgcolor: 'rgba(76,175,80,0.08)' } }}>
                    Profile
                  </Button>
                  <Button variant="contained" startIcon={<SatelliteAltIcon />}
                    onClick={() => navigate('/farm-tracking')}
                    sx={{ fontWeight: 700, px: 3 }}>
                    Track Live Farm
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Loading bar */}
        {(weatherLoading || ndviLoading || analysisLoading) && (
          <LinearProgress sx={{ mb: 2, borderRadius: 1, bgcolor: 'rgba(46,125,50,0.1)',
            '& .MuiLinearProgress-bar': { bgcolor: '#4CAF50' } }} />
        )}

        {/* Real-Time Insights */}
        <Card sx={{ mb: 3, border: '1px solid rgba(46,125,50,0.2)', bgcolor: 'rgba(13,31,53,0.6)' }}>
          <CardContent sx={{ p: 3 }}>
            <InsightsPanel weather={weather} ndvi={ndvi} analysis={analysis} cropType={farmer?.crop_type || 'wheat'} />
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Left column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Weather */}
            <Card sx={{ mb: 3, border: '1px solid rgba(46,125,50,0.2)', bgcolor: 'rgba(13,31,53,0.6)' }}>
              <CardContent sx={{ p: 3 }}>
                <WeatherPanel weather={weather} loading={weatherLoading} />
              </CardContent>
            </Card>

            {/* NDVI */}
            <Box sx={{ mb: 3 }}>
              <NDVIPanel ndvi={ndvi} loading={ndviLoading} />
            </Box>

            {/* AI Recommendations */}
            <AIRecommendations analysis={analysis} loading={analysisLoading} />
          </Grid>

          {/* Right column - Chatbot */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon sx={{ color: '#4CAF50' }} />
                AI Farm Advisor
              </Typography>
              <Chatbot farmer={farmer} weather={weather} ndvi={ndvi} analysis={analysis} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
