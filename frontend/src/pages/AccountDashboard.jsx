import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const addressStorageKey = 'digicart_saved_addresses';

const parseAddresses = () => {
  try {
    const raw = localStorage.getItem(addressStorageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const navItems = [
  { id: 'details', label: 'My Account', to: '/account/profile', icon: 'user' },
  { id: 'loyalty', label: 'Loyalty Program', to: '#', icon: 'star' },
  { id: 'vouchers', label: 'E-Vouchers', to: '#', icon: 'ticket' },
  { id: 'orders', label: 'Orders', to: '/account/orders', icon: 'box' },
  { id: 'address', label: 'Address', to: '/account/addresses', icon: 'location' },
  { id: 'logout', label: 'Logout', to: '/login', icon: 'logout' },
];

const Icon = ({ type }) => {
  if (type === 'dashboard') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
      </svg>
    );
  }

  if (type === 'star') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.071 3.293a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.294c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.782.57-1.837-.197-1.538-1.118l1.07-3.294a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.293z" />
      </svg>
    );
  }

  if (type === 'ticket') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16v3a2 2 0 010 4v3H4v-3a2 2 0 010-4V8z" />
      </svg>
    );
  }

  if (type === 'box') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    );
  }

  if (type === 'location') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  if (type === 'user') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
    </svg>
  );
};

const AccountDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [addresses] = useState(parseAddresses);

  const activeItem = useMemo(() => {
    if (location.pathname === '/account/orders') return 'orders';
    if (location.pathname === '/account/profile') return 'details';
    if (location.pathname === '/account/dashboard') return 'address';
    return 'dashboard';
  }, [location.pathname]);

  const handleNavClick = (item) => {
    if (item.id === 'logout') {
      logout();
      navigate('/login');
      return;
    }

    if (item.to !== '#') {
      navigate(item.to);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-160px)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
              {navItems.map((item) => {
                const isActive = item.id === activeItem;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`min-w-max lg:min-w-0 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                      isActive
                        ? 'text-[#ff3366] bg-pink-50'
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 min-h-[420px]">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Addresses</h1>
              <Link
                to="/account/addresses"
                className="bg-[#ff3366] hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                + Add Address
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-center">
                <p className="text-gray-500 text-sm sm:text-base">
                  No Address Set. Click Add Address button to set address.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-800">{address.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                    <p className="text-sm text-gray-600">{address.area}, {address.city}</p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountDashboard;
