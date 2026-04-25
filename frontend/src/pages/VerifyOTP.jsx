import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error('Please enter a 6-digit OTP');
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/verify-otp', { email, otp });
      login(data);
      toast.success('Email verified successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await API.post('/auth/register', { email, resend: true }); // Need to update register to handle resend or just call same endpoint
      toast.success('New OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">Verify Email</h1>
        <p className="text-center text-gray-500 mb-8">Enter the 6-digit code sent to <strong>{email}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[1em] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button onClick={handleResend} className="text-indigo-600 font-semibold hover:underline">
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
