import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';

const ADDRESS_STORAGE_KEY = 'digicart_saved_addresses';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', to: '/account/dashboard', icon: 'dashboard' },
  { id: 'orders', label: 'Orders', to: '/my-orders', icon: 'box' },
    { id: 'wishlist', label: 'Wishlist', to: '/account/wishlist', icon: 'heart' },
  { id: 'address', label: 'My Address', to: '/account/addresses', icon: 'location' },
  { id: 'profile', label: 'My Account', to: '/account/profile', icon: 'user' },
  { id: 'logout', label: 'Log Out', to: '/login', icon: 'logout' },
];

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

const UserAccount = () => {
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [addresses, setAddresses] = useState(getStoredAddresses);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const section = useMemo(() => {
    if (location.pathname === '/account/orders') return 'orders';
    if (location.pathname === '/account/wishlist') return 'wishlist';
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

  const handleAddressSave = (e) => {
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

    if (editingAddressId) {
      setAddresses((prev) =>
        prev.map((item) =>
          item.id === editingAddressId ? { ...item, ...addressForm } : item
        )
      );
      toast.success('Address updated');
    } else {
      setAddresses((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...addressForm,
        },
      ]);
      toast.success('Address added');
    }

    setAddressForm(emptyAddressForm);
    setAddressModalOpen(false);
    setEditingAddressId(null);
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    toast.success('Address removed');
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleNavClick = (item) => {
    if (item.id === 'logout') {
      logout();
      return;
    }

    window.location.href = item.to;
  };

  const openAddAddress = () => {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
    setAddressModalOpen(true);
  };

  const openEditAddress = (item) => {
    setAddressForm({
      label: item.label || '',
      city: item.city || '',
      area: item.area || '',
      address: item.address || '',
      phone: item.phone || '',
    });
    setEditingAddressId(item.id);
    setAddressModalOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-140px)] py-6 sm:py-8 dark:bg-gray-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:min-h-[620px]">
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 lg:pt-2">
              {navItems.map((item) => {
                const activeSectionId =
                  section === 'profile'
                    ? 'profile'
                    : section === 'orders'
                      ? 'orders'
                      : section === 'wishlist'
                        ? 'wishlist'
                        : 'address';
                const isActive = item.id === activeSectionId;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`flex min-w-max items-center gap-4 rounded-2xl px-4 py-4 text-left text-base font-medium transition-colors lg:min-w-0 lg:w-full ${
                      isActive
                        ? 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center justify-center text-current">
                      <Icon type={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="lg:col-span-9">
          {section === 'profile' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[460px]">
              <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Profile Information</h1>
              <form onSubmit={handleProfileSave} className="max-w-xl space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-[#ff3366] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#ff1f58]"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {section === 'orders' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[460px]">
              <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">My Orders</h1>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-center">
                  <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order._id}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Total: {formatPrice(order.totalAmount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'wishlist' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[620px]">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">Wishlist</h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your saved products are displayed here in the same card layout as Addresses.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-[#ff3366] dark:bg-gray-800 dark:text-pink-300">
                    {wishlistItems.length} item(s)
                  </span>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center rounded-full bg-[#ff3366] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition-colors hover:bg-[#ff1f58]"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {wishlistItems.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-center dark:border-gray-700 dark:bg-gray-900">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Your wishlist is empty.</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Save products while shopping to see them here.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {wishlistItems.map((item) => (
                    <article key={item._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-pink-50 dark:bg-gray-800">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/80x80?text=?';
                              }}
                            />
                          </span>
                          <div>
                            <p className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Saved Item</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item._id)}
                          className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-[#ff3366] hover:text-[#ff3366] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-2 py-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        <p className="font-semibold text-[#ff3366]">{formatPrice(item.price)}</p>
                        <p className="line-clamp-3">Stored in your wishlist for quick access later.</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="text-sm font-medium text-[#ff3366] transition-colors hover:text-[#ff1f58]"
                        >
                          Add to Cart
                        </button>
                        <Link
                          to="/products"
                          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-white"
                        >
                          Browse More
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'addresses' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[620px]">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">Addresses</h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage your saved delivery locations in one place.</p>
                </div>
                <button
                  type="button"
                  onClick={openAddAddress}
                  className="inline-flex items-center justify-center rounded-full bg-[#ff3366] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition-colors hover:bg-[#ff1f58]"
                >
                  Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-center dark:border-gray-700 dark:bg-gray-900">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">No address added yet.</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click Add New Address to create one.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {addresses.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-[#ff3366] dark:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.label}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">{item.city || 'Address'}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEditAddress(item)}
                          className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-[#ff3366] hover:text-[#ff3366] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          Change
                        </button>
                      </div>

                      <div className="space-y-2 py-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        <p>{item.phone}</p>
                        <p>{item.area}, {item.city}</p>
                        <p className="leading-7">{item.address}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => openEditAddress(item)}
                          className="text-sm font-medium text-[#ff3366] transition-colors hover:text-[#ff1f58]"
                        >
                          Edit Address
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(item.id)}
                          className="text-sm font-medium text-gray-500 transition-colors hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Make changes and save them immediately.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddressSave} className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <select
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#ff3366] focus:ring-2 focus:ring-[#ff3366]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'%3e%3c/path%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '20px',
                    paddingRight: '32px',
                  }}
                >
                  <option value="" disabled>
                    Select address type
                  </option>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Phone"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff3366] focus:ring-2 focus:ring-[#ff3366]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff3366] focus:ring-2 focus:ring-[#ff3366]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Area"
                  value={addressForm.area}
                  onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff3366] focus:ring-2 focus:ring-[#ff3366]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <textarea
                rows={5}
                placeholder="Full Address"
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                className="min-h-[170px] w-full rounded-[24px] border border-gray-200 bg-white px-4 py-3 text-sm leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff3366] focus:ring-2 focus:ring-[#ff3366]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#ff3366] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition-colors hover:bg-[#ff1f58]"
                >
                  {editingAddressId ? 'Save Changes' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccount;
