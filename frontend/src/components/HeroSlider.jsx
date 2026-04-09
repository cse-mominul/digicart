import { useEffect, useState } from 'react';
import API from '../api/axios';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await API.get('/campaigns/active');
        setSlides(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <section className="rounded-2xl overflow-hidden shadow-lg mb-8 bg-white dark:bg-gray-900 h-80 animate-pulse" />
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[activeIndex];

  return (
    <section className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg mb-6 sm:mb-8 bg-white dark:bg-gray-900 transition-colors max-w-full">
      <div className={`relative bg-gradient-to-r ${activeSlide.bg}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 text-white order-2 md:order-1">
            <p className="uppercase tracking-wider text-xs sm:text-sm text-white/80 mb-2">Ongoing Campaign</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3">{activeSlide.title}</h2>
            <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-md line-clamp-2 sm:line-clamp-3">{activeSlide.subtitle}</p>
            <button className="mt-4 sm:mt-5 bg-white text-gray-900 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm hover:bg-gray-100 active:scale-95 transition-all">
              {activeSlide.cta}
            </button>
          </div>

          <div className="relative h-40 sm:h-56 md:h-64 lg:h-80 order-1 md:order-2">
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 md:bg-black/20" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-2 sm:py-3 bg-white dark:bg-gray-900 overflow-x-auto">
        {slides.map((slide, idx) => (
          <button
            key={slide._id || idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-2 sm:h-2.5 rounded-full transition-all flex-shrink-0 ${
              idx === activeIndex
                ? 'w-6 sm:w-8 bg-pink-500'
                : 'w-2 sm:w-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
