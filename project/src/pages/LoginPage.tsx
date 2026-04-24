import { useState, useRef } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, MenuItem,
  Select, FormControl, InputLabel, FormControlLabel, Checkbox,
  Tabs, Tab, Alert, CircularProgress, InputAdornment, IconButton,
  Divider, Chip, Stack, Avatar
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { supabase } from '../lib/supabase';
import { CROP_TYPES } from '../types';

export default function LoginPage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', location: '',
    address: '', crop_type: 'wheat', lat: 13.0827, lon: 80.2707,
  });

  const detectGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRegForm(prev => ({ ...prev, lat: pos.coords.latitude, lon: pos.coords.longitude }));
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`)
          .then(r => r.json())
          .then(d => setRegForm(prev => ({ ...prev, location: d.name || 'Detected Location' })))
          .catch(() => {})
          .finally(() => setGpsLoading(false));
      },
      () => { setGpsLoading(false); setError('GPS access denied. Please enter location manually.'); }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(loginForm);
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaChecked) { setError('Please complete the verification checkbox.'); return; }
    setError(''); setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: regForm.email,
      password: regForm.password,
    });

    if (authError) { setError(authError.message); setLoading(false); return; }

    if (data.user) {
      let profileImageUrl: string | null = null;

      // Upload profile image if provided
      if (profileImageFile) {
        const ext = profileImageFile.name.split('.').pop();
        const filePath = `${data.user.id}/profile.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, profileImageFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);
          profileImageUrl = urlData.publicUrl;
        }
      }

      const { error: dbError } = await supabase.from('farmers').insert({
        user_id: data.user.id,
        name: regForm.name,
        email: regForm.email,
        location: regForm.location,
        address: regForm.address,
        crop_type: regForm.crop_type,
        lat: regForm.lat,
        lon: regForm.lon,
        ...(profileImageUrl ? { profile_image_url: profileImageUrl } : {}),
      });
      if (dbError) console.error('DB error:', dbError);
    }

    setSuccess('Registration successful! You are now logged in.');
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A1628 0%, #0D2137 50%, #0A1628 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(46,125,50,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(249,168,37,0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm">
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              component="img"
              src="/agristack-logo.webp"
              alt="AgriStack Logo"
              sx={{ height: 64, width: 'auto', filter: 'drop-shadow(0 0 20px rgba(46,125,50,0.5))' }}
            />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
            <Box component="span" sx={{ color: '#4CAF50' }}>Agri</Box>
            <Box component="span" sx={{ color: '#F9A825' }}>Stack</Box>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            AI-Powered Digital Agriculture Platform
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, justifyContent: 'center' }}>
            {['Smart Farming', 'Real-time Insights', 'AI Advisory'].map((tag) => (
              <Chip key={tag} label={tag} size="small"
                sx={{ bgcolor: 'rgba(46,125,50,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)', fontSize: '0.7rem' }} />
            ))}
          </Stack>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: 'rgba(13,31,53,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(46,125,50,0.2)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); setSuccess(''); }}
            sx={{
              mb: 3,
              '& .MuiTab-root': { fontWeight: 600, color: 'text.secondary' },
              '& .Mui-selected': { color: '#4CAF50 !important' },
              '& .MuiTabs-indicator': { bgcolor: '#4CAF50' },
            }}>
            <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="Sign In" />
            <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Register" />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

          {tab === 0 ? (
            <Box component="form" onSubmit={handleLogin}>
              <TextField fullWidth label="Email Address" type="email" required
                value={loginForm.email} onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                sx={{ mb: 2 }} />
              <TextField fullWidth label="Password" required
                type={showPassword ? 'text' : 'password'}
                value={loginForm.password} onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 3 }} />
              <Button type="submit" fullWidth variant="contained" size="large"
                disabled={loading} sx={{ py: 1.5, fontSize: '1rem' }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Box component="span" sx={{ color: '#4CAF50', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setTab(1)}>Register now</Box>
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleRegister}>
              {/* Profile Image Upload */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', mb: 1 }}>
                  <Avatar
                    src={profileImagePreview || undefined}
                    sx={{
                      width: 80, height: 80, bgcolor: '#2E7D32',
                      fontSize: '2rem', fontWeight: 800,
                      border: '3px solid rgba(76,175,80,0.4)',
                      cursor: 'pointer',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {!profileImagePreview && <PersonIcon sx={{ fontSize: 36 }} />}
                  </Avatar>
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: 'absolute', bottom: 0, right: 0,
                      bgcolor: '#2E7D32', borderRadius: '50%',
                      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid rgba(13,31,53,0.9)', cursor: 'pointer',
                      '&:hover': { bgcolor: '#4CAF50' },
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 14, color: '#fff' }} />
                  </Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {profileImagePreview ? 'Photo selected ✓' : 'Upload profile photo (optional)'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                  JPG, PNG or WebP · Max 5MB
                </Typography>
              </Box>

              <TextField fullWidth label="Farmer Name" required
                value={regForm.name} onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mb: 2 }} />
              <TextField fullWidth label="Email Address" type="email" required
                value={regForm.email} onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                sx={{ mb: 2 }} />
              <TextField fullWidth label="Password (min 6 chars)" type={showPassword ? 'text' : 'password'} required
                value={regForm.password} onChange={e => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { minLength: 6 },
                }}
                sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField fullWidth label="Location / City" required
                  value={regForm.location} onChange={e => setRegForm(prev => ({ ...prev, location: e.target.value }))} />
                <Button variant="outlined" onClick={detectGPS} disabled={gpsLoading}
                  sx={{ minWidth: 120, borderColor: '#4CAF50', color: '#4CAF50' }}
                  startIcon={gpsLoading ? <CircularProgress size={16} /> : <MyLocationIcon />}>
                  GPS
                </Button>
              </Box>
              
              <TextField fullWidth label="Full Address" required multiline rows={2}
                value={regForm.address} onChange={e => setRegForm(prev => ({ ...prev, address: e.target.value }))}
                sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Crop Type</InputLabel>
                <Select value={regForm.crop_type} label="Crop Type"
                  onChange={e => setRegForm(prev => ({ ...prev, crop_type: e.target.value }))}>
                  {CROP_TYPES.map(c => (
                    <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(regForm.lat !== 13.0827 || regForm.lon !== 80.2707) && (
                <Alert severity="success" sx={{ mb: 2, py: 0.5, borderRadius: 2 }}>
                  GPS: {regForm.lat.toFixed(4)}, {regForm.lon.toFixed(4)}
                </Alert>
              )}

              <Divider sx={{ my: 2, borderColor: 'rgba(46,125,50,0.2)' }} />

              <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(46,125,50,0.15)', borderRadius: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox checked={captchaChecked} onChange={e => setCaptchaChecked(e.target.checked)}
                      sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }} />
                  }
                  label={
                    <Typography variant="body2">
                      I am not a robot. I agree to use AgriStack for legitimate farming purposes.
                    </Typography>
                  }
                />
              </Paper>

              <Button type="submit" fullWidth variant="contained" size="large"
                disabled={loading} sx={{ py: 1.5, fontSize: '1rem' }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
