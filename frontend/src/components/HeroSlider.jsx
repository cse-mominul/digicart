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
      <section className="rounded-none sm:rounded-2xl overflow-hidden mb-8 bg-gray-200 dark:bg-gray-800 aspect-[2/1] sm:h-80 md:h-96 lg:h-[450px] animate-pulse -mx-3 sm:mx-0" />
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
    <section className="relative group rounded-none sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 -mx-3 sm:mx-0">
      {/* Slider Content */}
      <div className="relative w-full aspect-[2/1] sm:aspect-auto sm:h-80 md:h-96 lg:h-[450px] bg-gray-100 dark:bg-gray-800">
        <img
          src={activeImage || 'https://placehold.co/1200x400?text=Banner'}
          alt={activeSlide?.title || 'Campaign Banner'}
          className="w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out"
          onError={(e) => {
            e.target.src = isMobile 
              ? 'https://placehold.co/800x400?text=Summer+Sale' 
              : 'https://placehold.co/1200x450?text=Summer+Sale';
          }}
        />
        
        {/* Overlay for better text readability if needed (optional) */}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Indicators - Positioned absolutely at the bottom of the banner */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === activeIndex
                ? 'w-6 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows - Desktop Only */}
      <button
        onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

export default HeroSlider;
