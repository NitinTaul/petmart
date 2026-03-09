import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleButton = ({ onClick }) => (
  <button onClick={onClick}
    className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 font-medium hover:bg-gray-50 transition-colors">
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Continue with Google
  </button>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-4">
    <hr className="flex-1 border-gray-200" />
    <span className="text-xs text-gray-400">OR</span>
    <hr className="flex-1 border-gray-200" />
  </div>
);

// ── LOGIN PAGE ────────────────────────────────────────────────
export function LoginPage() {
  const [mode, setMode] = useState('password'); // 'password' | 'magic'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.data.user, data.data.token);
      toast.success('Welcome back! 🐾');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false, // login only, not register
        },
      });
      if (error) throw error;
      setMagicSent(true);
      toast.success('Magic link sent! Check your inbox 📧');
    } catch (err) {
      toast.error(err.message || 'Failed to send magic link');
    } finally { setLoading(false); }
  };

  if (magicSent) return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md text-center">
        <div className="text-5xl sm:text-6xl mb-4">📬</div>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Check your inbox!</h2>
        <p className="text-gray-500 text-sm mb-2">We sent a magic link to</p>
        <p className="font-semibold text-gray-800 text-sm sm:text-base break-all mb-6">{email}</p>
        <p className="text-xs text-gray-400 mb-6">Click the link in the email to log in instantly. No password needed!</p>
        <button onClick={() => { setMagicSent(false); setEmail(''); }}
          className="text-primary text-sm hover:underline">
          ← Try a different email
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-4xl sm:text-5xl mb-3">🐾</div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your PetMart account</p>
        </div>

        <GoogleButton onClick={handleGoogle} />
        <Divider />

        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          {[['password', '🔑 Password'], ['magic', '✨ Magic Link']].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${mode === m ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••" className="input pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-3 text-xs sm:text-sm text-blue-700">
              ✨ Enter your email and we'll send you a <strong>magic link</strong> to login instantly — no password needed!
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" className="input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Sending...' : '✨ Send Magic Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

// ── REGISTER PAGE ─────────────────────────────────────────────
export function RegisterPage() {
  const [step, setStep] = useState('form'); // 'form' | 'magic' | 'success'
  const [form, setForm] = useState({ username: '', full_name: '', email: '', mobile_number: '', password: '', confirm_password: '' });
  const [magicEmail, setMagicEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: form.username,
        full_name: form.full_name,
        email: form.email,
        mobile_number: form.mobile_number,
        password: form.password,
      });
      setStep('success');
      toast.success('Account created! Check your email 📧');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleMagicRegister = async (e) => {
    e.preventDefault();
    setMagicLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true, // create account if not exists
        },
      });
      if (error) throw error;
      setStep('magic');
      toast.success('Magic link sent! Check your inbox 📧');
    } catch (err) {
      toast.error(err.message || 'Failed to send magic link');
    } finally { setMagicLoading(false); }
  };

  if (step === 'magic') return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md text-center">
        <div className="text-5xl sm:text-6xl mb-4">📬</div>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Check your inbox!</h2>
        <p className="text-gray-500 text-sm mb-2">We sent a magic link to</p>
        <p className="font-semibold text-gray-800 text-sm break-all mb-4">{magicEmail}</p>
        <p className="text-xs text-gray-400 mb-6">Click the link to create your account and login instantly!</p>
        <Link to="/login" className="btn-primary inline-block">Back to Login</Link>
      </div>
    </div>
  );

  if (step === 'success') return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md text-center">
        <div className="text-5xl sm:text-6xl mb-4">🎉</div>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Almost there!</h2>
        <p className="text-gray-500 text-sm mb-6">We sent a verification email to <strong>{form.email}</strong>. Click the link to activate your account.</p>
        <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 w-full max-w-md">
        <div className="text-center mb-5 sm:mb-6">
          <div className="text-4xl sm:text-5xl mb-3">🐾</div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join PetMart and shop for your pets</p>
        </div>

        <GoogleButton onClick={handleGoogle} />

        {/* Magic link quick register */}
        <div className="mt-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4">
          <p className="text-xs sm:text-sm font-semibold text-purple-800 mb-2">✨ Quick Register with Magic Link</p>
          <p className="text-xs text-gray-500 mb-3">Just enter your email — no password needed!</p>
          <form onSubmit={handleMagicRegister} className="flex gap-2">
            <input type="email" value={magicEmail} onChange={e => setMagicEmail(e.target.value)}
              required placeholder="your@email.com" className="input flex-1 text-sm py-2" />
            <button type="submit" disabled={magicLoading}
              className="btn-primary px-3 py-2 text-sm shrink-0">
              {magicLoading ? '...' : 'Send →'}
            </button>
          </form>
        </div>

        <Divider />
        <p className="text-xs text-center text-gray-400 -mt-1 mb-4">Or register with full details below</p>

        <form onSubmit={handleRegister} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">Username *</label>
              <input value={form.username} onChange={e => set('username', e.target.value)}
                required placeholder="petlover123" className="input text-sm" minLength={3} maxLength={50} />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">Full Name *</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)}
                required placeholder="John Doe" className="input text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              required placeholder="you@example.com" className="input text-sm" />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">Mobile Number</label>
            <input type="tel" value={form.mobile_number} onChange={e => set('mobile_number', e.target.value)}
              placeholder="10-digit number" className="input text-sm" pattern="[0-9]{10}" maxLength={10} />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">Password *</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => set('password', e.target.value)}
                required placeholder="Min 6 characters" className="input text-sm pr-10" minLength={6} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">Confirm Password *</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} value={form.confirm_password}
                onChange={e => set('confirm_password', e.target.value)}
                required placeholder="Repeat password" className="input text-sm pr-10" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{showConfirm ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 sm:py-3 mt-1">
            {loading ? 'Creating Account...' : 'Create Account 🐾'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
