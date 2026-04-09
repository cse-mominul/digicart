import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';

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
    return (
      <motion.section
        className="mb-8 overflow-hidden rounded-[32px] bg-[#06070c] px-4 py-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:px-6 sm:py-6"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="mx-auto mb-5 max-w-fit rounded-[32px] bg-white px-6 pb-4 pt-3 text-center shadow-[0_14px_35px_rgba(15,23,42,0.08)] sm:px-8 sm:pb-5">
          <div className="h-6 w-64 rounded-full bg-gray-200" />
          <div className="mx-auto mt-2 h-3 w-40 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/5" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-[330px] w-[250px] shrink-0 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.05)]" />
            ))}
          </div>
          <div className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/5" />
        </div>
      </motion.section>
    );
  }

  const launchProducts = products.slice(0, 20);

  if (!launchProducts.length) {
    return null;
  }

  return (
    <motion.section
      className="mb-8 overflow-hidden rounded-[32px] bg-[#06070c] px-4 py-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:px-6 sm:py-6"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="mb-5 flex flex-col items-center gap-2 text-center">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff3366] backdrop-blur">
          Newly Launched
        </span>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Newly Launched Products</h2>
        <p className="text-sm text-white/60">Recent 20 products with a premium dark-glass look.</p>
      </div>

      <div className="mb-5 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <button
          type="button"
          onClick={() => scrollTrack('left')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 backdrop-blur-md transition-colors hover:border-[#ff3366]/70 hover:text-[#ff3366]"
          aria-label="Scroll launched products left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {launchProducts.map((product, index) => {
            const price = Number(product.price) || 0;
            const originalPrice = Number(product.originalPrice) || Math.round(price * 1.2);
            const discount = Number(product.discount) || Math.max(10, Math.round(100 - (price / originalPrice) * 100));
            const rating = Number(product.rating) || (4.3 + ((index % 5) * 0.1));
            const imageSrc = product.imageURL || product.image || 'https://placehold.co/420x420/111827/F9FAFB?text=Product';
            const key = product.id || product._id || `${product.name}-${index}`;

            return (
              <motion.article
                key={key}
                data-launch-card
                className="group min-w-[250px] shrink-0 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-3 text-white backdrop-blur-[12px] transition-transform duration-300 hover:-translate-y-1 sm:min-w-[270px] md:min-w-[285px]"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45 }}
              >
                <div className="relative overflow-hidden rounded-[20px] bg-black/30 p-3">
                  <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white shadow-lg shadow-[#3b82f6]/20">
                    ✨ AI Choice
                  </span>

                  <div className="flex h-52 items-center justify-center rounded-[18px] bg-white/5">
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/420x420/111827/F9FAFB?text=No+Image';
                      }}
                    />
                  </div>
                </div>

                <div className="px-1 pb-1 pt-3">
                  <h3 className="text-sm font-semibold leading-6 text-white line-clamp-2">{product.name}</h3>

                  <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                    <span className="text-[#fbbf24]">★★★★★</span>
                    <span>{rating.toFixed(1)}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-base font-semibold text-emerald-300">{formatPrice(price)}</span>
                    <span className="text-xs text-white/40 line-through">{formatPrice(originalPrice)}</span>
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      -{discount}%
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:border-[#ff3366]/60 hover:text-[#ff3366]"
                      aria-label="Quick view"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 0l-2-2m2 2l-2 2M3 12a9 9 0 1118 0 9 9 0 11-18 0z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="flex-1 rounded-full bg-[#0f8f84] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(15,143,132,0.45)] transition-all duration-300 hover:shadow-[0_0_22px_rgba(15,143,132,0.35)]"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollTrack('right')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 backdrop-blur-md transition-colors hover:border-[#ff3366]/70 hover:text-[#ff3366]"
          aria-label="Scroll launched products right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollTrack('left')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:border-[#ff3366]/70 hover:text-[#ff3366]"
            aria-label="Bottom left previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollTrack('right')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:border-[#ff3366]/70 hover:text-[#ff3366]"
            aria-label="Bottom left next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#ff3366]/70 hover:text-[#ff3366]"
        >
          View All AI Recommendations
        </button>
      </div>
    </motion.section>
  );
};

export default NewLaunchProductsSection;