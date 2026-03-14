import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';

const ADDRESS_STORAGE_KEY = 'digicart_saved_addresses';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const getStoredAddresses = () => {
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const emptyAddressForm = {
  label: '',
  city: '',
  area: '',
  address: '',
  phone: '',
};

const UserAccount = () => {
  const location = useLocation();
  const { user, login } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [addresses, setAddresses] = useState(getStoredAddresses);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);

  const section = useMemo(() => {
    if (location.pathname === '/account/orders') return 'orders';
    if (location.pathname === '/account/addresses') return 'addresses';
    return 'profile';
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const { data } = await API.get('/orders/myorders');
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };

    if (section === 'orders') {
      fetchOrders();
    }
  }, [section]);

  const handleProfileSave = (e) => {
    e.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    login({
      ...user,
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
    });

    setProfileForm((prev) => ({ ...prev, password: '' }));
    toast.success('Profile information updated');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();

    if (
      !addressForm.label.trim() ||
      !addressForm.city.trim() ||
      !addressForm.area.trim() ||
      !addressForm.address.trim() ||
      !addressForm.phone.trim()
    ) {
      toast.error('Please fill in all address fields');
      return;
    }

    const nextAddress = {
      id: Date.now().toString(),
      ...addressForm,
    };

    setAddresses((prev) => [...prev, nextAddress]);
    setAddressForm(emptyAddressForm);
    toast.success('Address added');
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    toast.success('Address removed');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-140px)] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-3">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
              <Link
                to="/account/profile"
                className={`min-w-max lg:min-w-0 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  section === 'profile'
                    ? 'text-[#ff3366] bg-pink-50 dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Profile Information
              </Link>
              <Link
                to="/account/orders"
                className={`min-w-max lg:min-w-0 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  section === 'orders'
                    ? 'text-[#ff3366] bg-pink-50 dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                My Orders
              </Link>
              <Link
                to="/account/addresses"
                className={`min-w-max lg:min-w-0 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  section === 'addresses'
                    ? 'text-[#ff3366] bg-pink-50 dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Addresses
              </Link>
            </nav>
          </div>
        </aside>

        <section className="lg:col-span-9">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-6 min-h-[460px]">
            {section === 'profile' && (
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h1>
                <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {section === 'orders' && (
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">My Orders</h1>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-center">
                    <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order._id}</p>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">Total: {formatPrice(order.totalAmount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {section === 'addresses' && (
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">Addresses</h1>

                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Label (Home/Office)"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="text"
                    placeholder="Area"
                    value={addressForm.area}
                    onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                    className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <textarea
                    rows={3}
                    placeholder="Full Address"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    className="sm:col-span-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 justify-self-start bg-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
                  >
                    Add Address
                  </button>
                </form>

                {addresses.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-center">
                    <p className="text-gray-500 dark:text-gray-400">No address added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((item) => (
                      <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{item.label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.phone}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{item.area}, {item.city}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{item.address}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(item.id)}
                            className="text-red-500 hover:text-red-600 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserAccount;
