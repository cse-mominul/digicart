const Footer = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-10 bg-gray-900 dark:bg-black border-t border-gray-800">
      <button
        type="button"
        onClick={handleScrollToTop}
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0 w-11 h-11 rounded-full bg-gray-800 text-gray-300 border border-gray-700 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-colors flex items-center justify-center shadow-md"
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm font-sans text-gray-400">
          <p>© 2026 DigiCart. All rights reserved.</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
            <a href="#" className="hover:text-gray-200 transition-colors">
              Terms &amp; Conditions
            </a>
            <a href="#" className="hover:text-gray-200 transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
