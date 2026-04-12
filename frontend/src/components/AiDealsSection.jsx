import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';
import { showAddToCartSuccess } from '../utils/showAddToCartSuccess';

const discountOptions = [15, 20, 25, 30, 35];

const AiDealsSection = ({ products = [], loading = false }) => {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (loading) {
    return (
      <section className="relative mb-8 overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#a8e86b_0%,#a0e463_100%)] px-4 pb-5 pt-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:px-6 sm:pb-6 sm:pt-6 dark:bg-[linear-gradient(180deg,#164a43_0%,#0f3b36_100%)]">
        <div className="mx-auto max-w-fit rounded-b-[32px] bg-white px-6 pb-4 pt-3 text-center shadow-[0_14px_35px_rgba(15,23,42,0.08)] dark:bg-[#101319] sm:px-8 sm:pb-5">
          <div className="h-6 w-64 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="mx-auto mt-2 h-3 w-40 rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="h-9 w-9 rounded-full bg-white/70 dark:bg-white/10" />
          <div className="flex-1 flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-[330px] w-[210px] shrink-0 rounded-2xl bg-white/80 dark:bg-[#1a1a1a]/80 animate-pulse" />
            ))}
          </div>
          <div className="h-9 w-9 rounded-full bg-white/70 dark:bg-white/10" />
        </div>
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  const dealItems = products.slice(0, 20);

  const scrollTrack = (direction) => {
    if (!trackRef.current) return;

    const card = trackRef.current.querySelector('[data-deal-card]');
    const cardWidth = card ? card.getBoundingClientRect().width : 240;
    const gap = 16;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2,
      behavior: 'smooth',
    });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showAddToCartSuccess(product.name);
  };

  const handleWishlist = (product) => {
    const existed = isInWishlist(product._id);
    toggleWishlist(product);
    toast.success(existed ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <section className="mb-6 sm:mb-8">
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 md:mb-5">
        <div className="w-full text-center sm:w-auto sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff3366] sm:text-sm">
            AI Picks
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white sm:mt-2 sm:text-2xl md:text-3xl">
            Daily Discount You&apos;ll Love
          </h2>
        </div>
        <div className="flex items-center justify-center gap-2 flex-shrink-0 sm:justify-end">
          <button
            type="button"
            onClick={() => scrollTrack('left')}
            className="inline-flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-[#ff3366] hover:text-[#ff3366] active:scale-90 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-200"
            aria-label="Scroll deals left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollTrack('right')}
            className="inline-flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-[#ff3366] hover:text-[#ff3366] active:scale-90 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-200"
            aria-label="Scroll deals right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex flex-col gap-4 pb-2 sm:flex-row sm:gap-4 sm:overflow-x-auto sm:scroll-smooth sm:pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {dealItems.map((product) => {
          const price = Number(product.price) || 0;
          const fallbackDiscount = discountOptions[(product.name || '').length % discountOptions.length];
          const discountLabel = String(product.discountText || '').trim() || `${fallbackDiscount}% OFF`;
          const discountMatch = discountLabel.match(/(\d+(?:\.\d+)?)\s*%/);
          const discountPercent = discountMatch ? Number(discountMatch[1]) : fallbackDiscount;
          const compareAtPrice = Number(product.compareAtPrice) || 0;
          const oldPrice = compareAtPrice > price
            ? compareAtPrice
            : (price > 0 ? price / (1 - discountPercent / 100) : 0);
          const displayRating = Math.min(5, Math.max(0, Number(product.displayRating) || 4));
          const filledStars = Math.round(displayRating);
          const reviewsText = String(product.displayReviewsText || '').trim() || '189';
          const inWishlist = isInWishlist(product._id);

          return (
            <article
              key={product._id}
              data-deal-card
              className="group w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 dark:border-gray-800 dark:bg-[#1a1a1a] cursor-pointer sm:w-[220px] sm:shrink-0 sm:max-w-none sm:rounded-2xl md:w-[230px]"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div className="relative p-1.5 sm:p-2.5">
                <span className="absolute left-1.5 sm:left-2.5 top-1.5 sm:top-2.5 z-10 rounded-full bg-[#ff3366] px-1.5 sm:px-2 py-0.5 text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
                  {discountLabel}
                </span>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleWishlist(product);
                  }}
                  className={`absolute right-2 sm:right-3 top-2 sm:top-3 z-10 inline-flex h-7 sm:h-9 w-7 sm:w-9 items-center justify-center rounded-full border transition-colors flex-shrink-0 ${
                    inWishlist
                      ? 'border-[#ff3366] bg-[#ff3366] text-white'
                      : 'border-gray-200 bg-white/95 text-gray-500 hover:border-[#ff3366] hover:text-[#ff3366] active:scale-90 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300'
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <div className="flex h-32 sm:h-44 items-center justify-center rounded-lg sm:rounded-xl bg-gray-50 p-1.5 sm:p-2.5 dark:bg-gray-900">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x300?text=No+Image';
                    }}
                  />
                </div>
              </div>

              <div className="px-2 sm:px-3 pb-2 sm:pb-3">
                <h3 className="min-h-[32px] sm:min-h-[38px] text-xs sm:text-sm font-medium leading-4 sm:leading-5 text-gray-900 line-clamp-2 dark:text-gray-100">
                  {product.name}
                </h3>

                <div className="mt-0.5 sm:mt-1 flex items-center gap-0.5 sm:gap-1 text-[#0f8f84]">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 ${index < filledStars ? 'text-[#0f8f84]' : 'text-slate-300 dark:text-slate-600'}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                  <span className="ml-0.5 sm:ml-1 text-[8px] sm:text-[11px] text-gray-500 dark:text-gray-400">({reviewsText})</span>
                </div>

                <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-0.5 sm:gap-2 text-[9px] sm:text-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(price)}</span>
                  <span className="text-[7px] sm:text-[11px] text-gray-400 line-through">{formatPrice(oldPrice)}</span>
                  <span className="rounded-full bg-pink-50 px-1.5 sm:px-2 py-0.5 text-[7px] sm:text-[9px] font-bold text-[#ff3366] dark:bg-[#ff3366]/10">{discountLabel}</span>
                </div>

                <div className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/product/${product._id}`);
                    }}
                    className="inline-flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-[#ff3366] transition-colors hover:border-[#ff3366] hover:bg-pink-50 active:scale-90 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-[#ff3366]/10 flex-shrink-0"
                    aria-label="View product"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 0l-2-2m2 2l-2 2M3 12a9 9 0 1118 0 9 9 0 11-18 0z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full bg-[#0f8f84] px-2 sm:px-3 py-1.5 sm:py-2 text-[7px] sm:text-xs font-semibold text-white transition-colors hover:bg-[#117b72] active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l-1 12H6L5 8zm2-3a3 3 0 016 0v1H7V5z" />
                    </svg>
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default AiDealsSection;