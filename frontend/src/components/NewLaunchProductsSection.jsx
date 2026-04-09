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
    return <div className="mb-8 h-[420px] animate-pulse rounded-[28px] bg-[linear-gradient(135deg,#0b0f19,#151b2a)] sm:h-[500px] sm:rounded-[45px]" />;
  }

  const launchProducts = products.slice(0, 20);
  if (!launchProducts.length) return null;

  return (
    <motion.section
      className="relative mb-10 overflow-hidden rounded-[28px] bg-[linear-gradient(140deg,#0b0f19_0%,#151b2a_55%,#111827_100%)] px-3 pb-6 pt-0 shadow-[0_24px_70px_rgba(2,6,23,0.55)] sm:mb-12 sm:rounded-[45px] sm:px-8 sm:pb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with Perfect Curve matching 2nd image */}
      <div className="flex justify-center">
        <div className="relative flex w-full max-w-[640px] flex-col items-center rounded-b-[36px] bg-white px-6 pb-5 pt-5 text-center shadow-[0_10px_30px_rgba(2,6,23,0.25)] sm:rounded-b-[50px] sm:px-12 sm:pb-6 sm:pt-6">
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-3xl">
            Newly Launched Products
          </h2>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#475569] sm:text-xs">
            Up to 69% discount for limited time <span className="text-orange-500">🔥</span>
          </p>
          
          {/* Side Curves to make it look smooth like the image */}
          <div className="absolute -left-10 top-0 hidden h-10 w-10 bg-white [mask-image:radial-gradient(circle_at_0_0,transparent_40px,white_41px)] sm:block" />
          <div className="absolute -right-10 top-0 hidden h-10 w-10 bg-white [mask-image:radial-gradient(circle_at_100%_0,transparent_40px,white_41px)] sm:block" />
        </div>
      </div>

      {/* Product Slider */}
      <div
        ref={trackRef}
        className="mt-6 flex gap-3 overflow-x-auto scroll-smooth pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-8 sm:gap-4"
      >
        {launchProducts.map((product, index) => {
          const price = Number(product.price) || 0;
          const originalPrice = Number(product.originalPrice) || Math.round(price * 1.2);
          const discount = Number(product.discount) || 10;
          const imageSrc = product.imageURL || product.image || 'https://placehold.co/400';

          return (
            <article
              key={product.id || product._id || index}
              data-launch-card
              className="group w-[78vw] max-w-[245px] shrink-0 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.06)] p-2.5 shadow-[0_12px_35px_rgba(2,6,23,0.35)] backdrop-blur-sm transition-transform hover:-translate-y-1 sm:w-[220px] sm:max-w-none sm:rounded-[28px] sm:p-3"
            >
              <div className="relative mb-3 flex h-40 items-center justify-center rounded-[18px] bg-white/90 p-3 sm:h-48 sm:rounded-[22px] sm:p-4">
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>

              <div className="px-1 space-y-1">
                <h3 className="min-h-[36px] line-clamp-2 text-[13px] font-medium leading-snug text-white/90">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#facc15]">★★★★★</span>
                  <span className="text-[10px] text-white/55">(189)</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-sm font-bold text-white">{formatPrice(price)}</span>
                  <span className="text-[10px] text-white/50 line-through">{formatPrice(originalPrice)}</span>
                  <span className="text-[10px] font-bold text-[#ff5a84]">{discount}% OFF</span>
                </div>

                <div className="flex items-center gap-2 pt-3">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-[#ff3366] hover:bg-[#ff3366]/15 hover:text-[#ff3366]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#ff3366] py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#e11d59]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer Nav and Button */}
      <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button onClick={() => scrollTrack('left')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur-md transition-colors hover:border-[#ff3366] hover:text-[#ff3366]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => scrollTrack('right')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur-md transition-colors hover:border-[#ff3366] hover:text-[#ff3366]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <button className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition-colors hover:border-[#ff3366] hover:text-[#ff3366] sm:w-auto">
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