import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FarmTracking from './pages/FarmTracking';
import ProfilePage from './pages/ProfilePage';
import type { Session } from '@supabase/supabase-js';
import type { Farmer } from './types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [farmer, setFarmer] = useState<Farmer | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setFarmer(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load farmer data once session is available
  useEffect(() => {
    if (session?.user?.id) {
      supabase.from('farmers').select('*').eq('user_id', session.user.id).maybeSingle()
        .then(({ data }) => { if (data) setFarmer(data as Farmer); });
    }
  }, [session?.user?.id]);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={session
            ? <Dashboard session={session} farmer={farmer} onFarmerUpdate={setFarmer} />
            : <Navigate to="/login" />}
        />
        <Route
          path="/farm-tracking"
          element={session ? <FarmTracking session={session} /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={session
            ? <ProfilePage session={session} farmer={farmer} onFarmerUpdate={setFarmer} />
            : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}
