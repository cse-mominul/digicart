import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { showOrderSuccess } from '../utils/showOrderSuccess';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const shippingMethods = [
  { id: 'free', label: 'Free Shipping', cost: 0 },
  { id: 'inside-dhaka', label: 'Inside Dhaka ৳৬০', cost: 60 },
  { id: 'outside-dhaka', label: 'Outside Dhaka ৳১২০', cost: 120 },
];

const defaultPaymentMethodLabels = {
  cod: 'Cash on Delivery',
  bkash: 'Bkash',
  nogod: 'Nagad',
  nagad: 'Nagad',
  upay: 'Upay',
  card: 'Card',
};

const paymentMethodThemes = {
  bkash: {
    card: 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10',
    text: 'text-blue-700 dark:text-blue-300',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  nogod: {
    card: 'border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-900/10',
    text: 'text-orange-700 dark:text-orange-300',
    button: 'bg-orange-600 hover:bg-orange-700',
  },
  nagad: {
    card: 'border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-900/10',
    text: 'text-orange-700 dark:text-orange-300',
    button: 'bg-orange-600 hover:bg-orange-700',
  },
  upay: {
    card: 'border-purple-200 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-900/10',
    text: 'text-purple-700 dark:text-purple-300',
    button: 'bg-purple-600 hover:bg-purple-700',
  },
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    area: '',
    address: '',
    email: '',
    orderNote: '',
  });
  const [errors, setErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [shippingMethod, setShippingMethod] = useState('inside-dhaka');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [mobileTrxId, setMobileTrxId] = useState('');
  const [mobileSenderNumber, setMobileSenderNumber] = useState('');
  const [submittingMobileTrx, setSubmittingMobileTrx] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentSettings, setPaymentSettings] = useState({
    bkash: { enabled: true, number: '', note: '' },
    nogod: { enabled: true, number: '', note: '' },
    cod: { enabled: true },
    card: { enabled: false },
  });

  const availablePaymentMethods = useMemo(() => {
    return Object.entries(paymentSettings)
      .filter(([, method]) => Boolean(method?.enabled))
      .map(([id, method]) => ({
        id,
        label: defaultPaymentMethodLabels[id] || String(id).replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
        type: method?.type || 'other',
        note: method?.note || '',
      }))
      .sort((left, right) => {
        if (left.id === 'cod') return 1;
        if (right.id === 'cod') return -1;
        return left.label.localeCompare(right.label);
      });
  }, [paymentSettings]);

  const resolvePaymentMethodConfig = (methodId) => {
    const normalized = String(methodId || '').trim().toLowerCase();
    if (!normalized) return null;

    if (paymentSettings?.[normalized]) {
      return paymentSettings[normalized];
    }

    // Handle common alias mismatch between nagad/nogod keys from settings.
    if (normalized === 'nagad' && paymentSettings?.nogod) {
      return paymentSettings.nogod;
    }

    if (normalized === 'nogod' && paymentSettings?.nagad) {
      return paymentSettings.nagad;
    }

    return null;
  };

  // Load saved addresses when user is logged in
  useEffect(() => {
    if (user) {
      try {
        const raw = localStorage.getItem('digicart_saved_addresses');
        const addresses = raw ? JSON.parse(raw) : [];
        setSavedAddresses(addresses);
      } catch {
        setSavedAddresses([]);
      }

      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const { data } = await API.get('/settings/payment');
        if (data?.paymentMethods) {
          setPaymentSettings(data.paymentMethods);
        }
      } catch (error) {
        console.error('Failed to fetch payment settings:', error);
      }
    };

    fetchPaymentSettings();
  }, []);

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        const { data } = await API.get('/coupons/active');
        setActiveCoupons(Array.isArray(data) ? data : []);
      } catch {
        setActiveCoupons([]);
      }
    };

    fetchActiveCoupons();
  }, []);

  useEffect(() => {
    // Validate selected payment method is still enabled
    if (!resolvePaymentMethodConfig(paymentMethod)?.enabled) {
      // Find first enabled payment method
      const enabledMethod = availablePaymentMethods[0];
      setPaymentMethod(enabledMethod?.id || 'cod');
    }
  }, [paymentSettings, availablePaymentMethods, paymentMethod]);

  // Handle address selection
  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);

    if (addressId) {
      const selected = savedAddresses.find((addr) => addr.id === addressId);
      if (selected) {
        setForm({
          ...form,
          name: form.name || '',
          phone: selected.phone || '',
          city: selected.city || '',
          area: selected.area || '',
          address: selected.address || '',
          email: form.email || '',
        });
      }
    } else {
      // Clear address fields when "Add new address" is selected
      setForm({
        ...form,
        phone: '',
        city: '',
        area: '',
        address: '',
      });
    }
  };

  const shippingCharge = useMemo(
    () => shippingMethods.find((method) => method.id === shippingMethod)?.cost || 0,
    [shippingMethod]
  );

  const finalTotal = Math.max(totalPrice - discount, 0) + shippingCharge;

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.phone.trim()) nextErrors.phone = 'Phone is required';
    if (!form.city) nextErrors.city = 'City is required';
    if (!form.area) nextErrors.area = 'Area is required';
    if (!form.address.trim()) nextErrors.address = 'Address is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code first');
      return;
    }

    const enteredCode = couponCode.trim().toUpperCase();
    const matchedCoupon = activeCoupons.find(
      (c) => String(c.code || '').trim().toUpperCase() === enteredCode
    );

    if (matchedCoupon && matchedCoupon.isActive) {
      const discountPercent = Number(matchedCoupon.discountPercent) || 0;
      const nextDiscount = totalPrice * (discountPercent / 100);
      setDiscount(nextDiscount);
      setAppliedCoupon(enteredCode);
      Swal.fire({
        icon: 'success',
        title: 'Coupon Applied!',
        html: `<span class="font-semibold">${discountPercent}% off</span> discount applied.`,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    setDiscount(0);
    setAppliedCoupon('');
    toast.error('Invalid or inactive coupon code');
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!validate()) return;

    setPlacingOrder(true);
    try {
      const orderItems = cartItems.map(({ _id, name, image, price, quantity }) => ({
        product: _id,
        name,
        image,
        price,
        quantity,
      }));

      const { data } = await API.post('/orders', {
        items: orderItems,
        totalAmount: finalTotal,
        shippingAddress: {
          address: form.address,
          city: form.city,
          postalCode: form.area,
          country: 'Bangladesh',
        },
        paymentMethod,
        appliedCoupon,
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          note: form.orderNote,
        },
      });

      const selectedPaymentConfig = resolvePaymentMethodConfig(paymentMethod) || {};
      const normalizedMethod = String(paymentMethod || '').trim().toLowerCase();
      const isMobileBankingMethod =
        ['bkash', 'nogod', 'nagad', 'upay'].includes(normalizedMethod) ||
        String(selectedPaymentConfig?.type || '').toLowerCase() === 'mobile_banking';

      if (isMobileBankingMethod) {
        if (data?._id) {
          setPendingPaymentOrder({
            orderId: data._id,
            totalAmount: Number(data?.totalAmount) || finalTotal,
            methodId: normalizedMethod,
            methodLabel:
              defaultPaymentMethodLabels[normalizedMethod] ||
              String(normalizedMethod).replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
          });
          setMobileTrxId('');
          setMobileSenderNumber('');
          setPaymentModalOpen(true);
          return;
        }
      }

      clearCart();
      await showOrderSuccess(navigate);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCopyMobileNumber = async () => {
    const number = String(resolvePaymentMethodConfig(pendingPaymentOrder?.methodId)?.number || '').trim();
    if (!number) {
      toast.error('Payment number not configured');
      return;
    }

    try {
      await navigator.clipboard.writeText(number);
      toast.success('Number copied');
    } catch {
      toast.error('Failed to copy number');
    }
  };

  const handleSubmitMobileTrx = async (event) => {
    event.preventDefault();

    if (!pendingPaymentOrder?.orderId) {
      toast.error('Order not found for transaction submission');
      return;
    }

    if (!mobileTrxId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    if (!mobileSenderNumber.trim()) {
      toast.error('Please enter sender number');
      return;
    }

    setSubmittingMobileTrx(true);
    try {
      const { data } = await API.put(`/orders/${pendingPaymentOrder.orderId}/transaction`, {
        trxId: mobileTrxId.trim(),
        senderNumber: mobileSenderNumber.trim(),
      });

      toast.success(data?.message || 'Transaction submitted');
      setPaymentModalOpen(false);
      setPendingPaymentOrder(null);
      clearCart();
      await showOrderSuccess(navigate);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit transaction');
    } finally {
      setSubmittingMobileTrx(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Checkout</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Your cart is empty. Add products before checkout.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const currentTheme = paymentMethodThemes[pendingPaymentOrder?.methodId] || {
    card: 'border-indigo-200 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10',
    text: 'text-indigo-700 dark:text-indigo-300',
    button: 'bg-indigo-600 hover:bg-indigo-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing & Shipping</h2>

          {user && savedAddresses.length > 0 && (
            <div className="mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Select Address</label>
              <div className="flex flex-wrap gap-3">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setForm({
                        ...form,
                        phone: addr.phone || '',
                        city: addr.city || '',
                        area: addr.area || '',
                        address: addr.address || '',
                      });
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedAddressId === addr.id
                        ? 'bg-blue-500 text-white border-2 border-blue-600'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    {addr.label || 'Unnamed'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Enter city"
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area *</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="Enter area"
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Note</label>
              <input
                type="text"
                value={form.orderNote}
                onChange={(e) => setForm({ ...form, orderNote: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <aside className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coupon / Voucher</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">
                Applied: {appliedCoupon}
              </div>
            )}
          </div>

          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Method</p>
            <div className="space-y-2">
              {shippingMethods.map((method) => (
                <label key={method.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === method.id}
                      onChange={() => setShippingMethod(method.id)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{method.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatPrice(method.cost)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</p>
            <div className="space-y-2">
              {availablePaymentMethods.map((method) => (
                <label key={method.id} className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="accent-blue-500"
                  />
                  <div>
                    <span className="block text-sm text-gray-700 dark:text-gray-300">{method.label}</span>
                    {method.note && (
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400">{method.note}</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total MRP</span>
              <span className="font-medium text-gray-800 dark:text-white">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Discount</span>
              <span className="font-medium text-green-600">- {formatPrice(discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Shipping</span>
              <span className="font-medium text-gray-800 dark:text-white">{formatPrice(shippingCharge)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white">Final Total Amount</span>
              <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={placingOrder}
            className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-bold tracking-wide hover:bg-blue-600 transition-colors disabled:opacity-60"
          >
            {placingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
          </button>
        </aside>
      </div>

      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pendingPaymentOrder?.methodLabel || 'Mobile Banking'} Payment</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Copy the number and submit TrxID to complete order.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPaymentModalOpen(false);
                  setPendingPaymentOrder(null);
                }}
                className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
              >
                Close
              </button>
            </div>

            <div className={`rounded-xl border p-3 ${currentTheme.card}`}>
              <p className={`text-[11px] uppercase tracking-wide ${currentTheme.text}`}>Payment Number</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className={`text-base font-black ${currentTheme.text}`}>{String(resolvePaymentMethodConfig(pendingPaymentOrder?.methodId)?.number || 'N/A')}</p>
                <button
                  type="button"
                  onClick={handleCopyMobileNumber}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60 ${currentTheme.button}`}
                  disabled={!String(resolvePaymentMethodConfig(pendingPaymentOrder?.methodId)?.number || '').trim()}
                >
                  Copy
                </button>
              </div>
            </div>

            {resolvePaymentMethodConfig(pendingPaymentOrder?.methodId)?.note && (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Important Note</p>
                <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">{String(resolvePaymentMethodConfig(pendingPaymentOrder?.methodId)?.note || '')}</p>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">Order ID</p>
                <p className="mt-1 font-mono font-semibold text-gray-800 dark:text-gray-100 break-all">{pendingPaymentOrder?.orderId || 'N/A'}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">Amount</p>
                <p className="mt-1 font-bold text-indigo-600 dark:text-indigo-300">{formatPrice(Number(pendingPaymentOrder?.totalAmount) || 0)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitMobileTrx} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Sender Number</label>
                <input
                  type="text"
                  value={mobileSenderNumber}
                  onChange={(event) => setMobileSenderNumber(event.target.value)}
                  placeholder="Enter number used to send money"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID (TrxID)</label>
                <input
                  type="text"
                  value={mobileTrxId}
                  onChange={(event) => setMobileTrxId(event.target.value)}
                  placeholder="Enter your transaction ID"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={submittingMobileTrx}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {submittingMobileTrx ? 'Submitting...' : 'Submit TrxID'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;


