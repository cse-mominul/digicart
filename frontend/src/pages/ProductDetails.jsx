import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
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

  const productPrice = Number(product?.price) || 0;
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-[420px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-pink-500"
        >
          ← Back to Home
        </Link>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-10 text-center">
          <p className="text-gray-600 dark:text-gray-300">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] min-h-screen pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-pink-500"
      >
        ← Back to Home
      </Link>

      <section className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-10">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="rounded-xl overflow-hidden bg-[#020617]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[280px] sm:h-[360px] lg:h-[420px] object-cover"
              onError={(e) => {
                e.target.src = 'https://placehold.co/800x800?text=No+Image';
              }}
            />
          </div>
        </div>

        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-lg">
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#1f2937] text-gray-200 mb-3">
            {product.category}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {product.name}
          </h1>

          <div className="mt-4">
            <span className="text-3xl font-bold text-pink-400">{formatPrice(product.price)}</span>
          </div>

          <ul className="mt-6 space-y-3">
            {shortFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-gray-200 text-sm">
                <span className="mt-1 h-2 w-2 rounded-full bg-pink-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 grid sm:grid-cols-2 gap-3">
            <button
              onClick={scrollToOrderForm}
              className="w-full rounded-xl bg-pink-500 text-white py-3 font-semibold hover:bg-pink-600 transition-colors"
            >
              Order Now
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full rounded-xl py-3 font-semibold border border-white/20 text-gray-200 hover:border-pink-400 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-5 gap-6 mb-10">
        <div className="lg:col-span-3 bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-3">Product Details</h2>
          <p className="text-gray-300 leading-relaxed mb-6">{product.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {galleryImages.map((image, index) => (
              <div key={`${image}-${index}`} className="rounded-xl overflow-hidden border border-white/10 bg-[#0b1220]">
                <img
                  src={image}
                  alt={`${product.name} preview ${index + 1}`}
                  className="h-52 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = 'https://placehold.co/600x400?text=Preview';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <aside ref={orderFormRef} className="lg:col-span-2 bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-lg h-fit lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold text-white mb-1">Order Now</h2>
          <p className="text-sm text-gray-400 mb-5">Fill out the form and confirm your order instantly.</p>

          {orderSuccess && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Success! Your order has been placed.
            </div>
          )}

          <form onSubmit={handleConfirmOrder} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                className="w-full rounded-xl border border-white/15 bg-[#0b1220] text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-xl border border-white/15 bg-[#0b1220] text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Full Address</label>
              <textarea
                rows={4}
                value={form.fullAddress}
                onChange={(event) => setForm((prev) => ({ ...prev, fullAddress: event.target.value }))}
                className="w-full rounded-xl border border-white/15 bg-[#0b1220] text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="House, road, area, city"
              />
            </div>

            <div className="bg-[#1e293b] rounded-lg border border-white/10 p-4 space-y-3">
              <p className="text-sm font-medium text-gray-200">Delivery Area</p>

              <label className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 cursor-pointer hover:border-pink-400/40 transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'inside'}
                    onChange={() => setDeliveryArea('inside')}
                    className="accent-pink-500"
                  />
                  <span className="text-sm text-gray-200">Inside Dhaka</span>
                </div>
                <span className="text-sm text-gray-300">{deliverySettings.insideDhakaCharge} BDT</span>
              </label>

              <label className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 cursor-pointer hover:border-pink-400/40 transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'outside'}
                    onChange={() => setDeliveryArea('outside')}
                    className="accent-pink-500"
                  />
                  <span className="text-sm text-gray-200">Outside Dhaka</span>
                </div>
                <span className="text-sm text-gray-300">{deliverySettings.outsideDhakaCharge} BDT</span>
              </label>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#1e293b] p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Product Price</span>
                <span className="text-gray-200">{productPrice} BDT</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Delivery Charge</span>
                <span className="text-gray-200">{deliveryCharge} BDT</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="font-semibold text-gray-100">Grand Total</span>
                <span className="font-bold text-pink-400">{grandTotal} BDT</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="w-full rounded-xl bg-pink-500 text-white py-3 font-semibold hover:bg-pink-600 transition-colors disabled:opacity-60"
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
