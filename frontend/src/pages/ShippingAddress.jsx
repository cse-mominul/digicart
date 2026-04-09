import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', to: '/my-account', icon: 'dashboard' },
  { id: 'orders', label: 'Orders', to: '/my-orders', icon: 'box' },
  { id: 'wishlist', label: 'Wishlist', to: '/wishlist', icon: 'heart' },
  { id: 'address', label: 'My Address', to: '/shipping-address', icon: 'location' },
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

const emptyAddress = {
  label: '',
  city: '',
  area: '',
  address: '',
  phone: '',
};

const ShippingAddress = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);
  const [deliveryType, setDeliveryType] = useState('home');
  const formRef = useRef(null);

  const canAdd = useMemo(
    () => form.label.trim() && form.city.trim() && form.area.trim() && form.address.trim() && form.phone.trim(),
    [form]
  );

  const handleNavClick = (item) => {
    if (item.id === 'logout') {
      logout();
      navigate('/login');
      return;
    }

    navigate(item.to);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();

    if (!canAdd) {
      toast.error('Please fill in all address fields');
      return;
    }

    setAddresses((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    setForm(emptyAddress);
    toast.success('Address added');
  };

  const handleDelete = (id) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    toast.success('Address removed');
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
          <span className="text-gray-400">Address</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm lg:min-h-[620px]">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 lg:pt-2">
                {navItems.map((item) => {
                  const isActive = item.id === 'address';

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
            <div className="mb-8 flex items-center gap-5">
              <button
                type="button"
                onClick={() => navigate('/my-account')}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Add New Address</h1>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm min-h-[620px] overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-5 sm:px-6 sm:py-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Shipping Address</h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-500">Add and manage your delivery details.</p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <form ref={formRef} onSubmit={handleAddAddress} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                    <input
                      type="text"
                      placeholder="Country / Region"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      className="rounded-full border border-gray-200 bg-white px-5 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="rounded-full border border-gray-200 bg-white px-5 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      className="rounded-full border border-gray-200 bg-white px-5 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="rounded-full border border-gray-200 bg-white px-5 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>

                  <textarea
                    placeholder="Apartments, suit, unit, etc ( Optional)"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={5}
                    className="min-h-[190px] w-full rounded-[28px] border border-gray-200 bg-white px-5 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Delivery Schedule</h2>
                    <div className="mt-5 flex flex-wrap gap-6 sm:gap-8">
                      {[
                        { value: 'home', label: 'Home Address' },
                        { value: 'office', label: 'Office Address' },
                        { value: 'other', label: 'Others' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-3 text-base text-gray-900 cursor-pointer">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${deliveryType === option.value ? 'border-teal-600' : 'border-gray-300'}`}>
                            <span className={`h-3.5 w-3.5 rounded-full ${deliveryType === option.value ? 'bg-teal-600' : 'bg-transparent'}`} />
                          </span>
                          <input
                            type="radio"
                            name="deliveryType"
                            value={option.value}
                            checked={deliveryType === option.value}
                            onChange={() => setDeliveryType(option.value)}
                            className="sr-only"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setForm(emptyAddress)}
                      className="rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-[#0f8e8e] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-700/10 transition-colors hover:bg-[#0c7d7d]"
                    >
                      Save
                    </button>
                  </div>
                </form>

                <div className="mt-8 space-y-3">
                  {addresses.length > 0 && addresses.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-800">{item.label}</p>
                          <p className="text-sm text-gray-600 mt-1">{item.phone}</p>
                          <p className="text-sm text-gray-600">{item.area}, {item.city}</p>
                          <p className="text-sm text-gray-600">{item.address}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-sm font-medium text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddress;
