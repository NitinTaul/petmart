import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('Verifying your magic link...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle magic link / OAuth callback — Supabase parses the URL hash automatically
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          login(session.user, session.access_token);
          setStatus('Login successful! Redirecting...');
          toast.success('Welcome to PetMart! 🐾');
          setTimeout(() => navigate('/'), 800);
        } else {
          // Wait a moment for Supabase to process the URL hash
          setStatus('Processing your link...');
          const { data, error: err2 } = await supabase.auth.exchangeCodeForSession(
            new URLSearchParams(window.location.search).get('code') || ''
          );

          if (data?.session) {
            login(data.session.user, data.session.access_token);
            toast.success('Welcome to PetMart! 🐾');
            navigate('/');
          } else {
            throw err2 || new Error('No session');
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <div className="text-center bg-white rounded-3xl shadow-xl p-8 sm:p-12 w-full max-w-sm">
        <div className="text-5xl sm:text-6xl mb-4 animate-bounce">🐾</div>
        <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2">{status}</h2>
        <p className="text-gray-500 text-sm mb-6">Please wait a moment...</p>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
