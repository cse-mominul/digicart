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
    <section className="rounded-2xl overflow-hidden shadow-lg mb-8 bg-white dark:bg-gray-900 transition-colors">
      <div className={`relative bg-gradient-to-r ${activeSlide.bg}`}>
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-6 sm:p-8 md:p-10 text-white">
            <p className="uppercase tracking-wider text-xs sm:text-sm text-white/80 mb-2">Ongoing Campaign</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3">{activeSlide.title}</h2>
            <p className="text-white/90 text-sm sm:text-base max-w-md">{activeSlide.subtitle}</p>
            <button className="mt-5 bg-white text-gray-900 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors">
              {activeSlide.cta}
            </button>
          </div>

          <div className="relative h-56 sm:h-64 md:h-72 lg:h-80">
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-900">
        {slides.map((slide, idx) => (
          <button
            key={slide._id || idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-2.5 rounded-full transition-all ${
              idx === activeIndex
                ? 'w-8 bg-pink-500'
                : 'w-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
