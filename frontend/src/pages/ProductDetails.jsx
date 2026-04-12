import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import { useAuth } from '../context/AuthContext';

const ADDRESS_STORAGE_KEY = 'digicart_saved_addresses';

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsState, setReviewsState] = useState({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    canReview: false,
    currentUserReview: null,
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    image: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
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
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressTypeToSave, setAddressTypeToSave] = useState('Home');
  const orderFormRef = useRef(null);
  const productDetailsSectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
        const incomingImages = Array.isArray(data?.images)
          ? data.images.filter((item) => typeof item === 'string' && item.trim())
          : [];
        setActiveImage(incomingImages[0] || data?.image || '');
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
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const { data } = await API.get(`/products/${id}/reviews`);
        setReviewsState({
          reviews: Array.isArray(data?.reviews) ? data.reviews : [],
          averageRating: Number(data?.averageRating) || 0,
          totalReviews: Number(data?.totalReviews) || 0,
          canReview: Boolean(data?.canReview),
          currentUserReview: data?.currentUserReview || null,
        });

        if (data?.currentUserReview) {
          setReviewForm({
            rating: Number(data.currentUserReview.rating) || 5,
            comment: data.currentUserReview.comment || '',
            image: data.currentUserReview.image || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setReviewsState({
          reviews: [],
          averageRating: 0,
          totalReviews: 0,
          canReview: false,
          currentUserReview: null,
        });
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
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

  useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      setSelectedAddressId('');
      return;
    }

    try {
      const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
      const addresses = raw ? JSON.parse(raw) : [];
      const safeAddresses = Array.isArray(addresses) ? addresses : [];
      setSavedAddresses(safeAddresses);

      const homeAddress = safeAddresses.find(
        (item) => String(item?.label || '').toLowerCase() === 'home'
      );

      if (homeAddress) {
        setSelectedAddressId(homeAddress.id);
        setForm((prev) => ({
          ...prev,
          phone: homeAddress.phone || prev.phone,
          fullAddress: buildAddressText(homeAddress) || prev.fullAddress,
        }));
      } else {
        setSelectedAddressId('');
      }
    } catch {
      setSavedAddresses([]);
      setSelectedAddressId('');
    }

    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const candidates = [
      ...(Array.isArray(product.images) ? product.images : []),
      product.image,
    ]
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);

    return Array.from(new Set(candidates));
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
  const configuredCompareAtPrice = Number(product?.compareAtPrice) || 0;
  const oldPrice = configuredCompareAtPrice > productPrice
    ? configuredCompareAtPrice
    : (productPrice > 0 ? productPrice * 1.18 : 0);
  const discountLabel = String(product?.discountText || '').trim() || '15% OFF';
  const displayRatingValue = Math.min(5, Math.max(0, Number(product?.displayRating) || 4));
  const displayReviewsLabel = String(product?.displayReviewsText || '').trim()
    || (reviewsState.totalReviews > 0 ? `${reviewsState.totalReviews} reviews` : 'No reviews');
  const grandTotal = productPrice + deliveryCharge;

  const scrollToOrderForm = () => {
    orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToProductDetailsSection = () => {
    productDetailsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const buildAddressText = (addressItem) => {
    const segments = [addressItem?.address, addressItem?.area, addressItem?.city]
      .map((segment) => String(segment || '').trim())
      .filter(Boolean);

    return segments.join(', ');
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);

    if (!addressId) return;

    const selected = savedAddresses.find((item) => item.id === addressId);
    if (!selected) return;

    setForm((prev) => ({
      ...prev,
      phone: selected.phone || prev.phone,
      fullAddress: buildAddressText(selected) || prev.fullAddress,
    }));
  };

  const handleSaveCurrentAddressType = () => {
    if (!user) return;

    const phone = String(form.phone || '').trim();
    const fullAddress = String(form.fullAddress || '').trim();

    if (!phone || !fullAddress) {
      toast.error('Phone number and full address are required to save address');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      label: addressTypeToSave,
      city: '',
      area: '',
      address: fullAddress,
      phone,
    };

    const nextAddresses = [
      ...savedAddresses.filter((item) => String(item?.label || '').toLowerCase() !== addressTypeToSave.toLowerCase()),
      newEntry,
    ];

    setSavedAddresses(nextAddresses);
    setSelectedAddressId(newEntry.id);
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(nextAddresses));
    toast.success(`${addressTypeToSave} address saved`);
  };

  const selectedAddress = useMemo(
    () => savedAddresses.find((item) => item.id === selectedAddressId) || null,
    [savedAddresses, selectedAddressId]
  );

  const isUsingSavedAddress = Boolean(user && selectedAddress);

  const ratingLabel = reviewsState.totalReviews > 0
    ? `${reviewsState.averageRating.toFixed(1)} / 5`
    : 'No ratings yet';

  const renderStars = (rating, className = 'h-4 w-4') => (
    Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill={index < rating ? 'currentColor' : 'none'}
        stroke="currentColor"
        className={className}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.157c.969 0 1.371 1.24.588 1.81l-3.364 2.444a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.54 1.118l-3.364-2.444a1 1 0 00-1.175 0l-3.364 2.444c-.784.57-1.838-.197-1.54-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.074 9.382c-.783-.57-.38-1.81.588-1.81h4.157a1 1 0 00.95-.69l1.286-3.955z" />
      </svg>
    ))
  );

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please login first to write a review');
      navigate('/login');
      return;
    }

    if (!reviewsState.canReview) {
      toast.error('You can only review products that you have ordered');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await API.post(`/products/${id}/reviews`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        image: reviewForm.image,
      });

      setReviewsState({
        reviews: Array.isArray(data?.reviews) ? data.reviews : [],
        averageRating: Number(data?.averageRating) || 0,
        totalReviews: Number(data?.totalReviews) || 0,
        canReview: Boolean(data?.canReview),
        currentUserReview: data?.review || data?.currentUserReview || null,
      });

      toast.success(data?.message || 'Review saved successfully');
      setReviewForm((prev) => ({ ...prev, comment: '', image: '' }));
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login first to write a review');
        navigate('/login');
        return;
      }

      toast.error(error.response?.data?.message || 'Failed to save review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Review image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReviewForm((prev) => ({ ...prev, image: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmOrder = async (event) => {
    event.preventDefault();

    if (!product) return;

    const selectedAddressText = selectedAddress ? buildAddressText(selectedAddress) : '';

    const payload = {
      fullName: isUsingSavedAddress
        ? String(user?.name || form.fullName || '').trim()
        : form.fullName.trim(),
      phone: isUsingSavedAddress
        ? String(selectedAddress?.phone || user?.phone || form.phone || '').trim()
        : form.phone.trim(),
      fullAddress: isUsingSavedAddress
        ? String(selectedAddressText || '').trim()
        : form.fullAddress.trim(),
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
              {discountLabel}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-0.5 text-amber-500">{renderStars(Math.round(displayRatingValue), 'h-4 w-4')}</span>
            <span className="text-slate-500 dark:text-slate-400">({displayReviewsLabel})</span>
          </div>

          <div className="mt-5 border-t border-dashed border-slate-200 pt-5 dark:border-white/10">
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={scrollToOrderForm}
                className="w-full rounded-full bg-[#ff3366] py-3 font-semibold text-white shadow-[0_16px_40px_rgba(255,51,102,0.25)] transition-colors hover:bg-[#ff1f58]"
              >
                Order Now
              </button>
              <button
                onClick={scrollToProductDetailsSection}
                className="w-full rounded-full border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition-colors hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <section ref={productDetailsSectionRef} className="grid gap-6 lg:grid-cols-5 mb-10">
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

                <div className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="text-4xl font-black text-slate-900 dark:text-white">
                        {reviewsState.totalReviews > 0 ? reviewsState.averageRating.toFixed(1) : '0.0'}
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-amber-500">
                        {renderStars(Math.round(reviewsState.averageRating))}
                      </div>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {reviewsState.totalReviews > 0
                          ? `${reviewsState.totalReviews} customer review${reviewsState.totalReviews === 1 ? '' : 's'}`
                          : 'No reviews yet'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-pink-500/15 bg-pink-500/5 p-4 text-sm text-slate-600 dark:text-slate-300">
                      <p className="font-semibold text-slate-900 dark:text-white">Share your experience</p>
                      <p className="mt-2 leading-6">
                        Reviews are available for customers who have placed an order for this product.
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-pink-500 dark:text-pink-300">
                        {ratingLabel}
                      </p>
                    </div>
                  </div>

                  {reviewsLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                      Loading reviews...
                    </div>
                  ) : reviewsState.reviews.length > 0 ? (
                    <div className="grid gap-4">
                      {reviewsState.reviews.map((review) => (
                        <div key={review._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white">
                                {review.user?.name || 'Verified buyer'}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-yellow-400/15 px-3 py-1 text-sm font-semibold text-yellow-700 dark:text-yellow-200">
                              <span>{Number(review.rating).toFixed(1)}</span>
                              <span className="flex items-center text-yellow-500">{renderStars(Math.round(review.rating), 'h-3.5 w-3.5')}</span>
                            </div>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 break-words [overflow-wrap:anywhere]">
                            {review.comment}
                          </p>
                          {review.image ? (
                            <img
                              src={review.image}
                              alt="Review"
                              className="mt-3 h-28 w-28 rounded-lg object-cover border border-slate-200 dark:border-white/10"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                      This product does not have any reviews yet.
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Write a review</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {user
                            ? reviewsState.canReview
                              ? 'Your review helps other customers decide.'
                              : 'You can review this product after placing an order.'
                            : 'Login required to write a review.'}
                        </p>
                      </div>
                      {reviewsState.currentUserReview ? (
                        <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                          Your review is saved
                        </span>
                      ) : null}
                    </div>

                    {!user ? (
                      <div className="mt-4 rounded-2xl border border-pink-500/15 bg-pink-500/5 p-4 text-sm text-slate-600 dark:text-slate-300">
                        <p>Please log in to submit a product review.</p>
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="mt-3 rounded-full bg-[#ff3366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ff1f58]"
                        >
                          Go to Login
                        </button>
                      </div>
                    ) : reviewsState.canReview ? (
                      <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Rating</label>
                          <select
                            value={reviewForm.rating}
                            onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          >
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating} Star{rating > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Comment</label>
                          <textarea
                            rows={4}
                            value={reviewForm.comment}
                            onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            placeholder="Tell others what you liked or what could be better"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Upload Image (Optional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReviewImageChange}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                          {reviewForm.image ? (
                            <img
                              src={reviewForm.image}
                              alt="Review preview"
                              className="mt-2 h-24 w-24 rounded-lg object-cover border border-slate-200 dark:border-white/10"
                            />
                          ) : null}
                        </div>

                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="rounded-full bg-[#ff3366] px-5 py-3 font-semibold text-white shadow-[0_16px_40px_rgba(255,51,102,0.22)] transition-colors hover:bg-[#ff1f58] disabled:opacity-60"
                        >
                          {submittingReview ? 'Saving...' : reviewsState.currentUserReview ? 'Update Review' : 'Submit Review'}
                        </button>
                      </form>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-700 dark:text-amber-200">
                        You need to place an order for this product before leaving a review.
                      </div>
                    )}
                  </div>
                </div>
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
            {user && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-3 dark:border-white/10 dark:bg-white/5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Saved Address</label>
                  <select
                    value={selectedAddressId}
                    onChange={(event) => handleAddressSelect(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {savedAddresses.map((addressItem) => (
                      <option key={addressItem.id} value={addressItem.id}>
                        {addressItem.label || 'Saved'}
                      </option>
                    ))}
                    <option value="">Use a new address</option>
                  </select>
                </div>

                {!isUsingSavedAddress && (
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Save Current Address As</label>
                      <select
                        value={addressTypeToSave}
                        onChange={(event) => setAddressTypeToSave(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveCurrentAddressType}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-pink-400 hover:text-pink-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isUsingSavedAddress && (
              <>
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
              </>
            )}

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
