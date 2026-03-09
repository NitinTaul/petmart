const { supabase, supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../services/activityService');
const logger = require('../config/logger');

// POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, username, full_name, mobile_number } = req.body;

    if (!email || !password || !username || !full_name) {
      return res.status(400).json({ success: false, message: 'email, password, username and full_name are required' });
    }

    // Validate mobile number format
    if (mobile_number && !/^\d{10}$/.test(mobile_number.replace(/\D/g, ''))) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number' });
    }

    // Create auth user in Supabase (sends OTP email automatically)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name, mobile_number },
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
      },
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    // Create profile row
    if (data.user) {
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: data.user.id,
        username,
        full_name,
        mobile_number,
      });
      if (profileError && profileError.code !== '23505') {
        logger.error('Profile creation error', { error: profileError.message });
      }

      await logActivity({ userId: data.user.id, email, eventType: 'register', req, authProvider: 'email_otp' });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: { user: { id: data.user?.id, email } },
    });
  } catch (err) { next(err); }
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      await logActivity({ email, eventType: 'login_failed', req, authProvider: 'email', metadata: { reason: error.message } });
      return res.status(401).json({ success: false, message: error.message });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single();

    await logActivity({ userId: data.user.id, email, eventType: 'login', req, authProvider: 'email', metadata: { session_id: data.session?.access_token?.slice(-10) } });

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: { ...data.user, profile }, token: data.session.access_token, refresh_token: data.session.refresh_token },
    });
  } catch (err) { next(err); }
};

// POST /api/v1/auth/logout
const logout = async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ success: false, message: error.message });

    if (req.user) {
      await logActivity({ userId: req.user.id, email: req.user.email, eventType: 'logout', req, authProvider: req.user.app_metadata?.provider });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

// POST /api/v1/auth/send-otp
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback` },
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) { next(err); }
};

// POST /api/v1/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) return res.status(400).json({ success: false, message: error.message });

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

    await logActivity({ userId: data.user.id, email, eventType: 'login', req, authProvider: 'email_otp' });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: { user: { ...data.user, profile }, token: data.session.access_token, refresh_token: data.session.refresh_token },
    });
  } catch (err) { next(err); }
};

// GET /api/v1/auth/me
const getMe = async (req, res, next) => {
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
    res.json({ success: true, data: { user: { ...req.user, profile } } });
  } catch (err) { next(err); }
};

module.exports = { register, login, logout, sendOtp, verifyOtp, getMe };
