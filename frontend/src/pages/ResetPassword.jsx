import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (form.otp.length !== 6) {
      return toast.error('OTP must be 6 digits');
    }

    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        email,
        otp: form.otp,
        newPassword: form.newPassword
      });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">Reset Password</h1>
        <p className="text-center text-gray-500 mb-8">Enter the OTP sent to <strong>{email}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
            <input
              type="text"
              required
              maxLength={6}
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-indigo-600 font-medium"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Repeat new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
