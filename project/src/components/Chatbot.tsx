import { useState, useRef, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, IconButton,
  CircularProgress, Avatar, Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { EDGE_FUNCTION_URL } from '../lib/supabase';
import type { ChatMessage, WeatherData, NDVIData, AIAnalysis, Farmer } from '../types';

interface Props {
  farmer: Farmer | null;
  weather: WeatherData | null;
  ndvi: NDVIData | null;
  analysis: AIAnalysis | null;
}

const SUGGESTIONS = [
  'Do I need irrigation today?',
  'What are the pest risks?',
  'Best fertilizer schedule?',
  'How is my crop health?',
];

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function Chatbot({ farmer, weather, ndvi, analysis }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0', role: 'bot',
    content: `Hello ${farmer?.name || 'Farmer'}! I'm AgriBot, your AI agricultural advisor. I have access to your current weather and crop data. Ask me anything about your ${farmer?.crop_type || 'crop'}!`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            farmer_name: farmer?.name,
            crop_type: farmer?.crop_type,
            location: farmer?.location,
            temperature: weather?.temperature,
            humidity: weather?.humidity,
            ndvi: ndvi?.ndvi,
            ndvi_health: ndvi?.health,
            recommendations: analysis?.recommendations?.slice(0, 2),
          },
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'bot',
        content: data.reply, timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'bot',
        content: 'Sorry, I could not connect. Please try again.',
        timestamp: new Date(),
      }]);
    }
    setLoading(false);
  };

  return (
    <Card sx={{
      background: 'linear-gradient(135deg, rgba(13,31,53,0.95) 0%, rgba(10,22,40,0.95) 100%)',
      border: '1px solid rgba(46,125,50,0.2)',
      display: 'flex', flexDirection: 'column', height: 480,
    }}>
      <CardContent sx={{ p: 2, pb: 1, borderBottom: '1px solid rgba(46,125,50,0.15)', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: '#2E7D32', width: 36, height: 36 }}><SmartToyIcon fontSize="small" /></Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>AgriBot</Typography>
            <Typography variant="caption" sx={{ color: '#4CAF50' }}>● Online — AI Advisory</Typography>
          </Box>
        </Box>
      </CardContent>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(46,125,50,0.3)', borderRadius: 2 },
      }}>
        {messages.map((msg) => (
          <Box key={msg.id} sx={{ display: 'flex', gap: 1, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <Avatar sx={{ width: 28, height: 28, flexShrink: 0,
              bgcolor: msg.role === 'bot' ? '#2E7D32' : 'rgba(249,168,37,0.2)',
              border: msg.role === 'user' ? '1px solid rgba(249,168,37,0.5)' : 'none',
            }}>
              {msg.role === 'bot' ? <SmartToyIcon sx={{ fontSize: 16 }} /> : <PersonIcon sx={{ fontSize: 16, color: '#F9A825' }} />}
            </Avatar>
            <Box sx={{
              maxWidth: '75%', p: 1.5, borderRadius: 2,
              bgcolor: msg.role === 'bot' ? 'rgba(46,125,50,0.12)' : 'rgba(249,168,37,0.12)',
              border: `1px solid ${msg.role === 'bot' ? 'rgba(46,125,50,0.2)' : 'rgba(249,168,37,0.2)'}`,
            }}>
              <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: '#2E7D32' }}><SmartToyIcon sx={{ fontSize: 16 }} /></Avatar>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(46,125,50,0.12)', border: '1px solid rgba(46,125,50,0.2)', borderRadius: 2, display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <CircularProgress size={14} sx={{ color: '#4CAF50' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Analyzing...</Typography>
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 1.5, pt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, borderTop: '1px solid rgba(46,125,50,0.1)', flexShrink: 0 }}>
        {SUGGESTIONS.map(s => (
          <Chip key={s} label={s} size="small" onClick={() => sendMessage(s)}
            sx={{ cursor: 'pointer', fontSize: '0.7rem',
              bgcolor: 'rgba(46,125,50,0.08)', color: '#A5D6A7',
              border: '1px solid rgba(46,125,50,0.2)',
              '&:hover': { bgcolor: 'rgba(46,125,50,0.2)' } }} />
        ))}
      </Box>

      <Box sx={{ p: 1.5, pt: 0, display: 'flex', gap: 1, flexShrink: 0 }}>
        <TextField
          fullWidth size="small" placeholder="Ask about your crops..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          disabled={loading}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.2)' } }}
        />
        <IconButton onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
          sx={{ bgcolor: '#2E7D32', color: '#fff', borderRadius: 3, width: 40, height: 40, '&:hover': { bgcolor: '#4CAF50' }, '&:disabled': { bgcolor: 'rgba(46,125,50,0.2)' } }}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
}
