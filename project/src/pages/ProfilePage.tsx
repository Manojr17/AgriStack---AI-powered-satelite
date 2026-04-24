import { useState, useRef } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Avatar, Button,
  TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress,
  Alert, Chip, IconButton, Divider, AppBar, Toolbar, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Farmer } from '../types';
import { CROP_TYPES } from '../types';

interface Props {
  session: Session;
  farmer: Farmer | null;
  onFarmerUpdate: (farmer: Farmer) => void;
}

export default function ProfilePage({ session, farmer, onFarmerUpdate }: Props) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editForm, setEditForm] = useState({
    name: farmer?.name || '',
    location: farmer?.location || '',
    address: farmer?.address || '',
    crop_type: farmer?.crop_type || 'wheat',
  });

  const handleEdit = () => {
    setEditForm({
      name: farmer?.name || '',
      location: farmer?.location || '',
      address: farmer?.address || '',
      crop_type: farmer?.crop_type || 'wheat',
    });
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!editForm.name.trim() || !editForm.location.trim()) {
      setError('Name and location are required.');
      return;
    }
    setSaving(true);
    setError('');

    const { data, error: dbError } = await supabase
      .from('farmers')
      .update({
        name: editForm.name.trim(),
        location: editForm.location.trim(),
        address: editForm.address.trim(),
        crop_type: editForm.crop_type,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
    } else if (data) {
      onFarmerUpdate(data as Farmer);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImage(true);
    setError('');

    const ext = file.name.split('.').pop();
    const filePath = `${session.user.id}/profile.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError('Image upload failed: ' + uploadError.message);
      setUploadingImage(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;

    const { data, error: dbError } = await supabase
      .from('farmers')
      .update({ profile_image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (dbError) {
      setError('Failed to save image URL: ' + dbError.message);
    } else if (data) {
      onFarmerUpdate(data as Farmer);
      setSuccess('Profile photo updated!');
    }
    setUploadingImage(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{
        background: 'linear-gradient(90deg, rgba(10,22,40,0.98) 0%, rgba(27,94,32,0.1) 100%)',
        borderBottom: '1px solid rgba(46,125,50,0.2)',
        backdropFilter: 'blur(20px)',
      }}>
        <Toolbar>
          <Tooltip title="Back to Dashboard">
            <IconButton edge="start" onClick={() => navigate('/dashboard')} sx={{ color: '#4CAF50', mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <Box component="img" src="/agristack-logo.webp" alt="AgriStack"
              sx={{ height: 32, filter: 'drop-shadow(0 0 8px rgba(46,125,50,0.5))' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>
                <Box component="span" sx={{ color: '#4CAF50' }}>Agri</Box>
                <Box component="span" sx={{ color: '#F9A825' }}>Stack</Box>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>Farmer Profile</Typography>
            </Box>
          </Box>
          {!editing && (
            <Button startIcon={<EditIcon />} variant="outlined" onClick={handleEdit}
              sx={{ borderColor: '#4CAF50', color: '#4CAF50', '&:hover': { bgcolor: 'rgba(76,175,80,0.1)' } }}>
              Edit Profile
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Profile Card */}
        <Card sx={{
          mb: 3,
          background: 'linear-gradient(135deg, rgba(27,94,32,0.2) 0%, rgba(13,31,53,0.9) 60%, rgba(249,168,37,0.05) 100%)',
          border: '1px solid rgba(46,125,50,0.25)',
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src={farmer?.profile_image_url || undefined}
                  sx={{
                    width: 120, height: 120,
                    bgcolor: '#2E7D32',
                    fontSize: '3rem', fontWeight: 800,
                    border: '4px solid rgba(76,175,80,0.5)',
                    boxShadow: '0 0 24px rgba(46,125,50,0.4)',
                  }}
                >
                  {!farmer?.profile_image_url && (farmer?.name?.charAt(0)?.toUpperCase() || 'F')}
                </Avatar>
                <Tooltip title="Upload profile photo">
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    sx={{
                      position: 'absolute', bottom: 0, right: 0,
                      bgcolor: '#2E7D32', color: '#fff', width: 36, height: 36,
                      border: '2px solid rgba(13,31,53,0.9)',
                      '&:hover': { bgcolor: '#4CAF50' },
                    }}
                  >
                    {uploadingImage ? <CircularProgress size={16} color="inherit" /> : <PhotoCameraIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                JPG, PNG or WebP · Max 5MB
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(46,125,50,0.2)', mb: 3 }} />

            {editing ? (
              /* Edit Form */
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#4CAF50' }}>
                  Edit Profile Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth label="Farmer Name" required
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    slotProps={{ input: { startAdornment: <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} /> } }}
                  />
                  <TextField
                    fullWidth label="Location / City" required
                    value={editForm.location}
                    onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    slotProps={{ input: { startAdornment: <LocationOnIcon sx={{ color: 'text.secondary', mr: 1 }} /> } }}
                  />
                  <TextField
                    fullWidth label="Full Address" multiline rows={2}
                    value={editForm.address}
                    onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    slotProps={{ input: { startAdornment: <HomeIcon sx={{ color: 'text.secondary', mr: 1, alignSelf: 'flex-start', mt: 1 }} /> } }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Crop Type</InputLabel>
                    <Select
                      value={editForm.crop_type}
                      label="Crop Type"
                      onChange={e => setEditForm(prev => ({ ...prev, crop_type: e.target.value }))}
                    >
                      {CROP_TYPES.map(c => (
                        <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave} disabled={saving}
                    sx={{ flex: 1, py: 1.5, fontWeight: 700 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined" startIcon={<CancelIcon />}
                    onClick={handleCancel} disabled={saving}
                    sx={{ flex: 1, py: 1.5, borderColor: 'rgba(239,68,68,0.5)', color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              /* View Mode */
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
                  {farmer?.name || 'Farmer'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
                  {farmer?.email || session.user.email}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid rgba(46,125,50,0.15)' }}>
                    <LocationOnIcon sx={{ color: '#4CAF50', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Location</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{farmer?.location || '—'}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid rgba(46,125,50,0.15)' }}>
                    <HomeIcon sx={{ color: '#4CAF50', flexShrink: 0, mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Address</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{farmer?.address || '—'}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid rgba(46,125,50,0.15)' }}>
                    <AgricultureIcon sx={{ color: '#4CAF50', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Crop Type</Typography>
                      <Chip
                        label={farmer?.crop_type ? farmer.crop_type.charAt(0).toUpperCase() + farmer.crop_type.slice(1) : '—'}
                        sx={{ bgcolor: 'rgba(46,125,50,0.2)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)', fontWeight: 700 }}
                      />
                    </Box>
                  </Box>

                  {farmer?.lat && farmer?.lon && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid rgba(46,125,50,0.15)' }}>
                      <LocationOnIcon sx={{ color: '#F9A825', flexShrink: 0 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>GPS Coordinates</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          {Number(farmer.lat).toFixed(4)}, {Number(farmer.lon).toFixed(4)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained" startIcon={<EditIcon />} onClick={handleEdit}
                    sx={{ px: 4, py: 1.5, fontWeight: 700 }}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
