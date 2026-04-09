import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';

const discountSteps = [10, 15, 20, 25, 30];

const pad = (value) => String(Math.max(0, value)).padStart(2, '0');

const getCountdownParts = (remainingMs) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
};

const LimitedTimeDealsSection = ({ products = [], loading = false }) => {
  const trackRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const countdownTarget = useMemo(() => Date.now() + (7 * 24 * 60 * 60 * 1000), []);
  const [remaining, setRemaining] = useState(countdownTarget - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(countdownTarget - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownTarget]);

  if (loading) {
    return (
      <section className="mb-10 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:rounded-[30px] sm:p-5 dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
          <div className="rounded-3xl bg-slate-100 p-4 sm:p-5 dark:bg-slate-900">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="mt-3 h-8 w-48 animate-pulse rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-[260px] w-[65vw] max-w-[210px] shrink-0 animate-pulse rounded-2xl bg-slate-100 sm:h-[280px] sm:w-[190px] sm:max-w-none dark:bg-slate-900" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const dealProducts = products.slice(0, 8);
  if (!dealProducts.length) return null;

  const { days, hours, minutes, seconds } = getCountdownParts(remaining);

  const scrollTrack = (direction) => {
    if (!trackRef.current) return;

    const card = trackRef.current.querySelector('[data-hot-deal-card]');
    const cardWidth = card ? card.getBoundingClientRect().width : 200;
    const gap = 12;

    trackRef.current.scrollBy({
      left: direction === 'left' ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2,
      behavior: 'smooth',
    });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (product) => {
    const existed = isInWishlist(product._id);
    toggleWishlist(product);
    toast.success(existed ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <section className="mb-10 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:rounded-[30px] sm:p-5 dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
        <div className="rounded-[24px] bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_100%)] p-4 sm:p-5 dark:bg-[linear-gradient(160deg,#111827_0%,#0b1222_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff3366]">Limited Time Offer</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl dark:text-white">Hot Deals This Week</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Weekly deals are back with fresh offers. Grab your favorites before the timer ends.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-[#ff3366]/20 bg-white px-2 py-2 text-center dark:bg-slate-900">
              <p className="text-lg font-bold text-[#ff3366]">{days}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Days</p>
            </div>
            <div className="rounded-xl border border-[#ff3366]/20 bg-white px-2 py-2 text-center dark:bg-slate-900">
              <p className="text-lg font-bold text-[#ff3366]">{hours}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Hours</p>
            </div>
            <div className="rounded-xl border border-[#ff3366]/20 bg-white px-2 py-2 text-center dark:bg-slate-900">
              <p className="text-lg font-bold text-[#ff3366]">{minutes}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Min</p>
            </div>
            <div className="rounded-xl border border-[#ff3366]/20 bg-white px-2 py-2 text-center dark:bg-slate-900">
              <p className="text-lg font-bold text-[#ff3366]">{seconds}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Sec</p>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f8f84] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#117b72] sm:w-auto"
          >
            View All Products
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">↗</span>
          </button>
        </div>

        <div className="min-w-0">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {dealProducts.map((product) => {
              const price = Number(product.price) || 0;
              const discount = discountSteps[(product.name || '').length % discountSteps.length];
              const oldPrice = price > 0 ? price / (1 - discount / 100) : 0;
              const imageSrc = product.image || product.imageURL || 'https://placehold.co/320x320?text=Product';
              const inWishlist = isInWishlist(product._id);

              return (
                <article
                  key={product._id}
                  data-hot-deal-card
                  className="group w-[74vw] max-w-[250px] shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:w-[220px] sm:max-w-none lg:w-[230px] dark:border-slate-700 dark:bg-[#111827] cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative">
                    <span className="absolute left-1.5 top-1.5 z-10 rounded bg-[#ff3366] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      {discount}% OFF
                    </span>
                    <div className="flex h-24 items-center justify-center rounded-xl bg-slate-50 p-2 sm:h-28 dark:bg-slate-900">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src = 'https://placehold.co/320x320?text=Product';
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Delivery 12-48 hours</p>
                    <h4 className="mt-1 min-h-[34px] line-clamp-2 text-[11px] font-medium leading-4 text-slate-800 sm:text-[12px] dark:text-slate-100">
                      {product.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-1 text-[#0f8f84]">
                      {[...Array(5)].map((_, index) => (
                        <svg key={index} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                      <span className="text-[10px] text-slate-400">(189)</span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(price)}</span>
                      <span className="text-[10px] text-slate-400 line-through">{formatPrice(oldPrice)}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleWishlist(product);
                        }}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                          inWishlist
                            ? 'border-[#ff3366] bg-[#ff3366] text-white'
                            : 'border-slate-200 text-slate-500 hover:border-[#ff3366] hover:text-[#ff3366] dark:border-slate-700 dark:text-slate-300'
                        }`}
                        aria-label="Toggle wishlist"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-[#0f8f84] px-2 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#117b72] sm:text-[11px]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l-1 12H6L5 8zm2-3a3 3 0 016 0v1H7V5z" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
            <div className="h-0.5 w-full rounded-full bg-[#0f8f84] sm:w-20" />
            <div className="flex justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => scrollTrack('left')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-[#ff3366] hover:text-[#ff3366] sm:h-8 sm:w-8 dark:border-slate-700 dark:text-slate-200"
                aria-label="Scroll left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollTrack('right')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-[#ff3366] hover:text-[#ff3366] sm:h-8 sm:w-8 dark:border-slate-700 dark:text-slate-200"
                aria-label="Scroll right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LimitedTimeDealsSection;
