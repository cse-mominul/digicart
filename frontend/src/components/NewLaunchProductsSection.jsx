import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';

const discountOptions = [10, 15, 20, 25, 30];

const NewLaunchProductsSection = ({ products = [], loading = false }) => {
  const trackRef = useRef(null);
  const navigate = useNavigate();

  const scrollTrack = (direction) => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector('[data-launch-card]');
    const cardWidth = card ? card.getBoundingClientRect().width : 280;
    const gap = 16;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return <div className="mb-8 h-[420px] animate-pulse rounded-[28px] bg-[linear-gradient(135deg,#0b0f19,#151b2a)] sm:h-[500px] sm:rounded-[45px]" />;
  }

  const launchProducts = products.slice(0, 20);
  if (!launchProducts.length) return null;

  return (
    <motion.section
      className="relative mb-8 -mx-3 overflow-hidden rounded-none bg-[#efe06a] px-3 pb-5 pt-0 shadow-none sm:mx-0 sm:mb-10 md:mb-12 sm:rounded-[28px] md:rounded-[45px] sm:bg-[linear-gradient(140deg,#0b0f19_0%,#151b2a_55%,#111827_100%)] sm:px-3 md:px-8 sm:pb-6 md:pb-8 sm:shadow-[0_24px_70px_rgba(2,6,23,0.55)]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with Perfect Curve matching 2nd image */}
      <div className="flex justify-center">
        <div className="relative flex w-full max-w-[640px] flex-col items-center rounded-none bg-transparent px-2 pb-4 pt-8 text-center shadow-none sm:rounded-b-[36px] md:rounded-b-[50px] sm:bg-white sm:px-6 md:px-12 sm:pb-5 md:pb-6 sm:pt-5 md:pt-6 sm:shadow-[0_10px_30px_rgba(2,6,23,0.25)]">
          <h2 className="text-4xl leading-[1.1] font-bold tracking-tight text-[#111827] sm:text-xl md:text-3xl">
            Newly Launched Products
          </h2>
          <p className="mt-2 flex items-center gap-1 text-base font-medium text-[#1f2937] sm:mt-1 sm:text-[11px] md:text-xs sm:text-[#475569]">
            Up to 69% discount for limited time <span className="text-orange-500">🔥</span>
          </p>
          
          {/* Side Curves to make it look smooth like the image */}
          <div className="absolute -left-8 sm:-left-10 top-0 hidden h-8 sm:h-10 w-8 sm:w-10 bg-white [mask-image:radial-gradient(circle_at_0_0,transparent_40px,white_41px)] sm:block" />
          <div className="absolute -right-8 sm:-right-10 top-0 hidden h-8 sm:h-10 w-8 sm:w-10 bg-white [mask-image:radial-gradient(circle_at_100%_0,transparent_40px,white_41px)] sm:block" />
        </div>
      </div>

      {/* Product Slider */}
      <div
        ref={trackRef}
        className="mt-3 flex flex-col items-center gap-3 pb-2 sm:mt-6 md:mt-8 sm:flex-row sm:items-stretch sm:gap-3 md:gap-4 sm:overflow-x-auto sm:scroll-smooth sm:pb-6 sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden"
      >
        {launchProducts.map((product, index) => {
          const price = Number(product.price) || 0;
          const fallbackDiscount = discountOptions[(product.name || '').length % discountOptions.length];
          const discountLabel = String(product.discountText || '').trim() || `${fallbackDiscount}% OFF`;
          const discountMatch = discountLabel.match(/(\d+(?:\.\d+)?)\s*%/);
          const discountPercent = discountMatch ? Number(discountMatch[1]) : fallbackDiscount;
          const compareAtPrice = Number(product.compareAtPrice) || 0;
          const originalPrice = compareAtPrice > price
            ? compareAtPrice
            : (Number(product.originalPrice) || (price > 0 ? price / (1 - discountPercent / 100) : 0));
          const displayRating = Math.min(5, Math.max(0, Number(product.displayRating) || 4));
          const filledStars = Math.round(displayRating);
          const reviewsText = String(product.displayReviewsText || '').trim() || '189';
          const imageSrc = product.imageURL || product.image || 'https://placehold.co/400';

          return (
            <article
              key={product.id || product._id || index}
              data-launch-card
              className="group w-[90vw] max-w-[360px] shrink-0 overflow-hidden rounded-lg sm:rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 cursor-pointer sm:w-[220px] sm:max-w-none md:w-[230px] dark:border-gray-800 dark:bg-[#1a1a1a]"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div className="relative p-1.5 sm:p-2.5">
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="h-32 sm:h-44 w-full rounded-lg sm:rounded-xl bg-gray-50 p-1.5 sm:p-2.5 object-contain transition-transform duration-300 group-hover:scale-105 dark:bg-gray-900"
                  onError={(event) => {
                    event.currentTarget.src = 'https://placehold.co/600x600?text=Product';
                  }}
                />
              </div>

              <div className="px-2 sm:px-3 pb-2 sm:pb-3">
                <h3 className="min-h-[32px] sm:min-h-[38px] text-xs sm:text-sm font-medium leading-4 sm:leading-5 text-gray-900 line-clamp-2 dark:text-gray-100">
                  {product.name}
                </h3>
                
                <div className="mt-0.5 sm:mt-1 flex items-center gap-0.5 sm:gap-1 text-[#0f8f84]">
                  {[...Array(5)].map((_, starIndex) => (
                    <svg
                      key={starIndex}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-2.5 sm:h-3.5 w-2.5 sm:w-3.5 ${starIndex < filledStars ? 'text-[#0f8f84]' : 'text-slate-300 dark:text-slate-600'}`}
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
                  <span className="text-[7px] sm:text-[11px] text-gray-400 line-through">{formatPrice(originalPrice)}</span>
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 0l-2-2m2 2l-2 2M3 12a9 9 0 1118 0 9 9 0 11-18 0z" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/product/${product._id}`);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full bg-[#0f8f84] px-2 sm:px-3 py-1.5 sm:py-2 text-[7px] sm:text-xs font-semibold text-white transition-colors hover:bg-[#117b72] active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l-1 12H6L5 8zm2-3a3 3 0 016 0v1H7V5z" /></svg>
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer Nav and Button */}
      <div className="hidden sm:flex mt-3 flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button onClick={() => scrollTrack('left')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur-md transition-colors hover:border-[#ff3366] hover:text-[#ff3366]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => scrollTrack('right')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur-md transition-colors hover:border-[#ff3366] hover:text-[#ff3366]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/products')}
          className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition-colors hover:border-[#ff3366] hover:text-[#ff3366] sm:w-auto"
        >
          View All Products
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3366] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </div>
        </button>
      </div>
    </motion.section>
  );
};

export default NewLaunchProductsSection;