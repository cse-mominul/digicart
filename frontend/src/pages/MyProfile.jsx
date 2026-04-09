import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', to: '/my-account', icon: 'dashboard' },
  { id: 'orders', label: 'Orders', to: '/my-orders', icon: 'box' },
  { id: 'wishlist', label: 'Wishlist', to: '/wishlist', icon: 'heart' },
  { id: 'address', label: 'My Address', to: '/account/addresses', icon: 'location' },
  { id: 'profile', label: 'My Account', to: '/my-profile', icon: 'user' },
  { id: 'logout', label: 'Log Out', to: '/login', icon: 'logout' },
];

const Icon = ({ type }) => {
  if (type === 'dashboard') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 5h7v2h-7v-2z" />
      </svg>
    );
  }

  if (type === 'box') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    );
  }

  if (type === 'heart') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }

  if (type === 'location') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  if (type === 'user') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M17 16l4-4m0 0l-4-4m4 4H7" />
    </svg>
  );
};

const MyProfile = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  const activeItem = useMemo(() => 'profile', []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    login({
      ...user,
      name: form.name.trim(),
      email: form.email.trim(),
    });

    setForm((prev) => ({ ...prev, password: '' }));
    toast.success('Profile updated');
  };

  const handleNavClick = (item) => {
    if (item.id === 'logout') {
      logout();
      navigate('/login');
      return;
    }

    navigate(item.to);
  };

  return (
    <div className="bg-white min-h-[calc(100vh-160px)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="mb-8 flex items-center gap-3 text-sm sm:text-base text-gray-500">
          <Link to="/" className="flex items-center gap-2 text-gray-800 transition-colors hover:text-teal-600">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5 10.5V20h14v-9.5" />
                <path d="M9 20v-6h6v6" />
              </svg>
            </span>
            <span>Home</span>
          </Link>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">User Dashboard</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">My Profile</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm lg:min-h-[620px]">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 lg:pt-2">
                {navItems.map((item) => {
                  const isActive = item.id === activeItem;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`min-w-max lg:min-w-0 w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium transition-colors text-left ${
                        isActive
                          ? 'text-white bg-[#0f8e8e]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center justify-center text-current"><Icon type={item.icon} /></span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <section className="lg:col-span-9">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm min-h-[620px]">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">My Profile</h1>
                  <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-500">
                    Update your personal details and secure your account from a single place.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="self-start rounded-full bg-[#0f8e8e] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-700/10 transition-colors hover:bg-[#0c7d7d]"
                >
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <form onSubmit={handleSubmit} className="rounded-[28px] border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Profile Information</h2>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                      Editable
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="rounded-full bg-[#0f8e8e] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0c7d7d]"
                    >
                      Update Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/my-account')}
                      className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </form>

                <div className="rounded-[28px] border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Account Preview</h2>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-[#0f8e8e]">
                      Live
                    </span>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0f8e8e] text-white text-lg font-semibold">
                        {(user?.name || 'U').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{user?.name || 'Your Name'}</p>
                        <p className="text-sm text-gray-500">{user?.email || 'your@email.com'}</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Member Since</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">2026</p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Account Status</p>
                        <p className="mt-2 text-sm font-semibold text-[#0f8e8e]">Active</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                      Keep your profile details updated to make checkout and order support faster.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
