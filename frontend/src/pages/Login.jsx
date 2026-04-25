import { useState } from 'react';
import logoLight from '../assets/logo-light.jpeg';
import logoDark from '../assets/logo-dark.png';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data);
      toast.success('Login successful!');
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      if (error.response?.data?.message?.includes('not verified')) {
        toast.error('Account not verified. OTP sent to email.');
        navigate('/verify-otp', { state: { email: form.email } });
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_52%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)]">
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/70 dark:border-white/10 backdrop-blur-xl">
        <div className="flex justify-center mb-2">
          <img
            src={logoLight}
            alt="Logo"
            className="h-12 w-auto block dark:hidden"
          />
          <img
            src={logoDark}
            alt="Logo"
            className="h-12 w-auto hidden dark:block"
          />
        </div>
        <p className="text-center text-slate-500 dark:text-slate-300 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-14 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-[#2563eb] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link to="/forgot-password" size="sm" className="text-xs font-medium text-[#2563eb] dark:text-blue-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 rounded-xl font-semibold shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#2563eb] dark:text-blue-400 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
