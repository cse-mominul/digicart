import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MyProfile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    const updatedUser = {
      ...user,
      name: form.name.trim(),
      email: form.email.trim(),
    };

    login(updatedUser);
    setForm((prev) => ({ ...prev, password: '' }));
    toast.success('Profile updated');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter new password"
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <button
            type="submit"
            className="bg-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
