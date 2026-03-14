import { useEffect, useState } from 'react';

const slides = [
  {
    id: 1,
    title: 'Win a Dyson Airwrap',
    subtitle: 'Shop selected beauty-tech products and get a chance to win big.',
    cta: 'Shop Campaign',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400',
    bg: 'from-pink-500 via-fuchsia-500 to-purple-600',
  },
  {
    id: 2,
    title: 'Eid Sale Up To 50% OFF',
    subtitle: 'Limited-time offers on best-selling electronics and daily essentials.',
    cta: 'Explore Deals',
    image:
      'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1400',
    bg: 'from-emerald-500 via-teal-500 to-cyan-600',
  },
  {
    id: 3,
    title: 'Weekend Gadget Drop',
    subtitle: 'Fresh arrivals in accessories, audio, and smart device bundles.',
    cta: 'See New Arrivals',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400',
    bg: 'from-indigo-600 via-violet-600 to-purple-700',
  },
];

const HeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

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
            key={slide.id}
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
