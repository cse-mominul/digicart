import { useEffect, useState } from 'react';
import API from '../api/axios';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)');

    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();

    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

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
      <section className="rounded-none sm:rounded-2xl overflow-hidden shadow-lg mb-8 bg-gray-200 dark:bg-gray-800 h-48 sm:h-80 md:h-96 lg:h-[450px] animate-pulse -mx-3 sm:mx-0" />
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[activeIndex];
  const activeImage = isMobile
    ? activeSlide?.mobileImage || activeSlide?.image || activeSlide?.desktopImage
    : activeSlide?.desktopImage || activeSlide?.image || activeSlide?.mobileImage;

  return (
    <section className="rounded-none sm:rounded-2xl overflow-hidden shadow-lg mb-8 max-w-full -mx-3 sm:mx-0">
      {/* Mobile - Full width with fixed height and object-fit cover */}
      <div className="sm:hidden relative h-48 w-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
        <img
          src={activeImage || 'https://placehold.co/400x300?text=Banner'}
          alt={activeSlide?.title || 'Campaign Banner'}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            console.error('Mobile image failed to load:', e.target.src);
            e.target.src = 'https://placehold.co/400x300?text=Banner';
          }}
        />
      </div>

      {/* Desktop - Show Campaign Image with aspect ratio */}
      <div className="hidden sm:block relative h-80 md:h-96 lg:h-[450px] w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <img
          src={activeImage || 'https://placehold.co/1200x400?text=Banner'}
          alt={activeSlide?.title || 'Campaign Banner'}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            console.error('Image failed to load:', e.target.src);
            e.target.src = 'https://placehold.co/1200x400?text=Banner';
          }}
        />
      </div>

      {/* Slide indicators */}
      <div className="flex items-center justify-center gap-2 py-3 sm:py-4 bg-white dark:bg-gray-900 overflow-x-auto">
        {slides.map((slide, idx) => (
          <button
            key={slide._id || idx}
            onClick={() => setActiveIndex(idx)}
            className={`rounded-full transition-all flex-shrink-0 ${
              idx === activeIndex
                ? 'w-3 h-3 bg-blue-500'
                : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;

