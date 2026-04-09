import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(80);
  const [deliveryArea, setDeliveryArea] = useState('inside');
  const [deliverySettings, setDeliverySettings] = useState({
    insideDhakaCharge: 80,
    outsideDhakaCharge: 120,
  });
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    fullAddress: '',
  });
  const orderFormRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
        setActiveImage(data?.image || '');
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        const { data } = await API.get('/settings');
        setDeliverySettings({
          insideDhakaCharge: Number(data?.insideDhakaCharge) || 80,
          outsideDhakaCharge: Number(data?.outsideDhakaCharge) || 120,
        });
      } catch (error) {
        console.error('Failed to fetch delivery settings:', error);
      }
    };

    fetchDeliverySettings();
  }, []);

  useEffect(() => {
    setDeliveryCharge(
      deliveryArea === 'inside'
        ? Number(deliverySettings.insideDhakaCharge) || 0
        : Number(deliverySettings.outsideDhakaCharge) || 0
    );
  }, [deliveryArea, deliverySettings]);

  const shortFeatures = useMemo(() => {
    if (!product) return [];

    const stockCount = product.countInStock ?? product.stock ?? 0;

    return [
      'Premium quality build with minimalist design',
      'Fast delivery and secure packaging',
      stockCount > 0 ? `${stockCount} units currently in stock` : 'Currently out of stock',
    ];
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    return [
      product.image,
      product.image,
      product.image,
    ];
  }, [product]);

  const additionalInfoRows = useMemo(() => {
    const info = product?.additionalInfo;

    if (Array.isArray(info)) {
      return info
        .map((item) => ({
          label: String(item?.label || '').trim(),
          value: String(item?.value || '').trim(),
        }))
        .filter((item) => item.label && item.value);
    }

    if (info && typeof info === 'object') {
      return Object.entries(info)
        .map(([label, value]) => ({
          label: String(label || '').trim(),
          value: String(value || '').trim(),
        }))
        .filter((item) => item.label && item.value);
    }

    return [];
  }, [product]);

  const productPrice = Number(product?.price) || 0;
  const oldPrice = productPrice > 0 ? productPrice * 1.18 : 0;
  const grandTotal = productPrice + deliveryCharge;

  const scrollToOrderForm = () => {
    orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleConfirmOrder = async (event) => {
    event.preventDefault();

    if (!product) return;

    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      fullAddress: form.fullAddress.trim(),
    };

    if (!payload.fullName || !payload.phone || !payload.fullAddress) {
      toast.error('Please fill in Full Name, Phone Number, and Full Address');
      return;
    }

    setPlacingOrder(true);
    try {
      await API.post('/orders', {
        items: [
          {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: 1,
          },
        ],
        totalAmount: grandTotal,
        deliveryCharge,
        deliveryArea: deliveryArea === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka',
        shippingAddress: {
          address: payload.fullAddress,
          city: deliveryArea === 'inside' ? 'Dhaka' : 'Outside Dhaka',
          postalCode: '',
          country: 'Bangladesh',
        },
        customer: {
          name: payload.fullName,
          phone: payload.phone,
          address: payload.fullAddress,
        },
      });

      setOrderSuccess(true);
      toast.success('Order confirmed successfully');
      setForm({ fullName: '', phone: '', fullAddress: '' });
      orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login first to place an order');
        navigate('/login');
        return;
      }

      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,51,102,0.08),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_52%,#eef2ff_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,_rgba(255,51,102,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)]">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-44 bg-white/80 dark:bg-white/10 rounded-full animate-pulse mb-6" />
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="h-[520px] rounded-[28px] bg-white/70 dark:bg-white/5 animate-pulse border border-white/60 dark:border-white/10" />
            <div className="h-[520px] rounded-[28px] bg-white/70 dark:bg-white/5 animate-pulse border border-white/60 dark:border-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,51,102,0.08),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_52%,#eef2ff_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,_rgba(255,51,102,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)]">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-pink-500"
        >
          ← Back to Home
        </Link>
        <div className="rounded-[28px] border border-white/60 bg-white/75 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-slate-600 dark:text-slate-300">Product not found.</p>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,51,102,0.08),_transparent_28%),radial-gradient(circle_at_right,_rgba(15,143,132,0.08),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_42%,#eef2ff_100%)] pb-24 md:pb-10 dark:bg-[radial-gradient(circle_at_top,_rgba(255,51,102,0.12),_transparent_28%),radial-gradient(circle_at_right,_rgba(15,143,132,0.12),_transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-pink-500"
      >
        ← Back to Home
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 items-start mb-10">
        <div className="rounded-[22px] border border-white/70 bg-white/75 p-2.5 shadow-[0_30px_120px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-pink-600 dark:bg-pink-500/15 dark:text-pink-300">
              Featured Product
            </span>
            <span className="inline-flex items-center rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
              {product.category}
            </span>
          </div>

          <div className="grid gap-2.5 xl:grid-cols-[68px_minmax(0,1fr)]">
            <div className="order-2 flex flex-row gap-2 overflow-x-auto xl:order-1 xl:flex-col xl:overflow-visible">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`group relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border transition-all duration-200 xl:h-14 xl:w-14 ${
                    activeImage === image
                      ? 'border-pink-500 ring-2 ring-pink-500/20'
                      : 'border-slate-200 bg-white hover:border-pink-300 dark:border-white/10 dark:bg-white/5'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = 'https://placehold.co/120x120?text=Preview';
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="order-1 rounded-[20px] border border-slate-200 bg-gradient-to-br from-[#fff8fb] via-white to-[#f8fbff] p-2 shadow-inner dark:border-white/10 dark:from-[#111827] dark:via-[#0f172a] dark:to-[#0b1220] xl:order-2">
              <div className="relative overflow-hidden rounded-[18px] bg-[#f3e3da] shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:bg-[#111827]">
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="h-[250px] w-full object-contain p-2.5 sm:h-[320px] lg:h-[420px] lg:p-5"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/800x800?text=No+Image';
                  }}
                />

                <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:bg-black/40 dark:text-white">
                  {product.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-white/70 bg-white/80 p-3.5 shadow-[0_30px_120px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-5 lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300 mb-3">
            {product.category}
            </span>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-pink-500 hover:text-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              aria-label="Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <h1 className="text-[1.65rem] font-bold leading-tight text-slate-900 dark:text-white sm:text-[1.5rem] lg:text-[1.65rem]">
            {product.name}
          </h1>

          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            <span className="text-2xl font-black text-pink-500 sm:text-[2.35rem]">{formatPrice(product.price)}</span>
            <span className="text-base text-slate-400 line-through sm:text-lg">{formatPrice(oldPrice)}</span>
            <span className="inline-flex rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-200">
              15% OFF
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-amber-500">
            <span>★★★★☆</span>
            <span className="text-slate-500 dark:text-slate-400">(11.78k reviews)</span>
          </div>

          <div className="mt-5 border-t border-dashed border-slate-200 pt-5 dark:border-white/10">
            <ul className="space-y-2.5">
              {shortFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={scrollToOrderForm}
                className="w-full rounded-full bg-[#ff3366] py-3 font-semibold text-white shadow-[0_16px_40px_rgba(255,51,102,0.25)] transition-colors hover:bg-[#ff1f58]"
              >
                Order Now
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full rounded-full border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition-colors hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5 mb-10">
        <div className="lg:col-span-3 rounded-[22px] border border-white/70 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Details</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Desktop tab view with backend-driven specs</p>
            </div>
            <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
              Premium selection
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 rounded-full bg-slate-100 p-1 dark:bg-white/5">
            {[
              { key: 'description', label: 'Description' },
              { key: 'additionalInfo', label: 'Additional Info' },
              { key: 'reviews', label: 'Reviews' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-pink-500 shadow-sm dark:bg-slate-900 dark:text-pink-300'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p className="leading-7 text-slate-600 dark:text-slate-300 break-words [overflow-wrap:anywhere]">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'additionalInfo' && (
              additionalInfoRows.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="grid grid-cols-1 divide-y divide-slate-200 dark:divide-white/10">
                    {additionalInfoRows.map((row, index) => (
                      <div key={`${row.label}-${index}`} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[220px_1fr] sm:items-center">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.label}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  No additional information available for this product.
                </div>
              )
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-pink-500/15 bg-pink-500/5 p-4 text-sm text-slate-600 dark:text-slate-300">
                  Reviews are not connected yet. This tab is ready for backend reviews when you add them.
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: 'Sarah H.', text: 'Clean product presentation and fast delivery.', rating: '5.0' },
                    { name: 'Rafiul K.', text: 'Looks premium and order flow feels smooth.', rating: '4.9' },
                  ].map((review) => (
                    <div key={review.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{review.name}</h3>
                        <span className="rounded-full bg-yellow-400/20 px-2.5 py-1 text-xs font-bold text-yellow-700 dark:text-yellow-200">{review.rating}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        <aside ref={orderFormRef} className="lg:col-span-2 h-fit rounded-[22px] border border-white/70 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Order Now</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Fill out the form and confirm your order instantly.</p>

          {orderSuccess && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Success! Your order has been placed.
            </div>
          )}

          <form onSubmit={handleConfirmOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Full Address</label>
              <textarea
                rows={4}
                value={form.fullAddress}
                onChange={(event) => setForm((prev) => ({ ...prev, fullAddress: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="House, road, area, city"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#fff8fb] p-4 space-y-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Delivery Area</p>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 cursor-pointer hover:border-pink-400/40 transition-colors dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'inside'}
                    onChange={() => setDeliveryArea('inside')}
                    className="accent-pink-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Inside Dhaka</span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-300">{deliverySettings.insideDhakaCharge} BDT</span>
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 cursor-pointer hover:border-pink-400/40 transition-colors dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'outside'}
                    onChange={() => setDeliveryArea('outside')}
                    className="accent-pink-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Outside Dhaka</span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-300">{deliverySettings.outsideDhakaCharge} BDT</span>
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Product Price</span>
                <span className="text-slate-700 dark:text-slate-200">{productPrice} BDT</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Delivery Charge</span>
                <span className="text-slate-700 dark:text-slate-200">{deliveryCharge} BDT</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="font-semibold text-slate-900 dark:text-white">Grand Total</span>
                <span className="font-black text-pink-500">{grandTotal} BDT</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="w-full rounded-full bg-[#0f8f84] py-3 font-semibold text-white shadow-[0_16px_40px_rgba(15,143,132,0.22)] transition-colors hover:bg-[#117b72] disabled:opacity-60"
            >
              {placingOrder ? 'Confirming...' : 'Confirm Order'}
            </button>
          </form>
        </aside>
      </section>

      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          type="button"
          onClick={scrollToOrderForm}
          className="w-full rounded-xl bg-pink-500 text-white py-3.5 font-semibold shadow-lg shadow-pink-500/30"
        >
          Order Now
        </button>
      </div>
      </div>
    </div>
  );
};

export default ProductDetails;
