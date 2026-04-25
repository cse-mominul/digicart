import React, { useState } from 'react';

const features = [
  {
    title: 'AUTHENTIC PRODUCTS',
    description: 'Products from original brands',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'SUPER FAST DELIVERY',
    description: 'Fast and reliable delivery',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'SECURED PAYMENT',
    description: 'Verified by SSLCommerz',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: '24X7 SUPPORT',
    description: 'Contact with our Support',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const FeaturesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 2 >= features.length ? 0 : prev + 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 2 < 0 ? features.length - 2 : prev - 2));
  };

  return (
    <section className="mb-8 px-0 sm:px-0 relative group">
      <div className="bg-black rounded-[2rem] sm:rounded-full py-6 px-4 sm:py-8 sm:px-12 shadow-2xl relative overflow-hidden">
        {/* Desktop View */}
        <div className="hidden sm:flex flex-row items-center justify-between gap-4">
          {features.map((item, index) => (
            <div key={index} className="flex items-center gap-3 group">
              <div className="text-red-500 transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <h3 className="text-white text-sm font-bold tracking-wider leading-tight">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-xs font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View Slider */}
        <div className="flex sm:hidden overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out w-full"
            style={{ transform: `translateX(-${currentIndex * 50}%)` }}
          >
            {features.map((item, index) => (
              <div key={index} className="min-w-[50%] flex flex-col items-center text-center px-2">
                <div className="text-red-500 mb-2 scale-125">
                  {item.icon}
                </div>
                <h3 className="text-white text-[10px] font-bold tracking-wider leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-[9px] font-medium leading-none">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows for Mobile */}
        <button 
          onClick={prevSlide}
          className="sm:hidden absolute left-1 top-1/2 -translate-y-1/2 w-8 h-10 bg-white/10 flex items-center justify-center rounded-r-lg text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={nextSlide}
          className="sm:hidden absolute right-1 top-1/2 -translate-y-1/2 w-8 h-10 bg-white/10 flex items-center justify-center rounded-l-lg text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default FeaturesSection;
