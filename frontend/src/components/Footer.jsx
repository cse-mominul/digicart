import { Link } from 'react-router-dom';

const Footer = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const aboutLinks = [
    { label: 'Contact us', href: '/contact-us' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press & Media', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ];

  const accountLinks = [
    { label: 'My Profile', href: '/account/profile' },
    { label: 'My Orders', href: '/account/orders' },
    { label: 'Wishlist', href: '/account/wishlist' },
    { label: 'Shipping Address', href: '/account/addresses' },
  ];

  const categoryLinks = [
    { label: 'Fashion', href: '/products/fashion' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Home & Living', href: '/products/home-living' },
    { label: 'Beauty & Care', href: '/products/beauty-care' },
  ];

  const renderLinkList = (title, links) => (
    <div>
      <h4 className="mb-4 text-lg font-semibold text-white">{title}</h4>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            <Link
              to={item.href}
              className="group inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
            >
              <span className="text-gray-500 transition-colors group-hover:text-gray-300">&gt;</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="relative mt-10 border-t border-[#1a2135] bg-[#0c1121] text-gray-200">
      <button
        type="button"
        onClick={handleScrollToTop}
        className="absolute left-1/2 top-0 flex h-10 sm:h-11 w-10 sm:w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ff3366]/40 bg-[#ff3366] text-white shadow-lg transition-colors hover:bg-[#ff1f58] active:scale-90"
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 pt-10 sm:pt-14">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="col-span-2 sm:col-span-1 xl:pr-5">
            <div className="inline-flex items-center gap-2 rounded-lg sm:rounded-xl border border-[#2c3755] bg-[#12182a] px-2 sm:px-3 py-1.5 sm:py-2">
              <span className="h-6 sm:h-7 w-6 sm:w-7 rounded-md bg-[#ff3366] text-center text-xs sm:text-sm font-bold leading-6 sm:leading-7 text-white flex items-center justify-center">D</span>
              <div className="min-w-0">
                <p className="text-sm sm:text-lg font-semibold leading-none text-[#ff3366] truncate">DigiCart</p>
                <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.12em] text-gray-400">Rebranded Sellzy</p>
              </div>
            </div>

            <p className="mt-3 sm:mt-4 max-w-xs text-xs sm:text-sm leading-5 sm:leading-6 text-gray-300">
              DigiCart helps modern shoppers discover top-rated products at honest prices, fast delivery,
              and smooth checkout experiences.
            </p>

          </div>

          {renderLinkList('About', aboutLinks)}
          {renderLinkList('My Account', accountLinks)}
          {renderLinkList('Categories', categoryLinks)}

          <div>
            <h4 className="mb-3 sm:mb-4 text-sm sm:text-lg font-semibold text-white">Contact</h4>

            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-gray-400 flex-shrink-0" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 sm:h-4 w-3.5 sm:w-4">
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.07 6.13 11.93 6.39 12.22a.83.83 0 0 0 1.22 0C12.87 20.93 19 14.07 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
                  </svg>
                </span>
                <span className="line-clamp-2">125 Market Street, Gulshan Avenue, Dhaka 1212</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-gray-400 flex-shrink-0" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 sm:h-4 w-3.5 sm:w-4">
                    <path d="M19.59 15.17a1 1 0 0 0-1.06-.23l-2.54.85a1 1 0 0 1-1-.24l-3.74-3.74a1 1 0 0 1-.24-1l.85-2.54a1 1 0 0 0-.23-1.06L9.4 3.84a1 1 0 0 0-1-.27A6.38 6.38 0 0 0 3.57 8.4 16.17 16.17 0 0 0 15.6 20.43a6.38 6.38 0 0 0 4.83-4.83 1 1 0 0 0-.27-1Z" />
                  </svg>
                </span>
                <span>+880 1700-123456</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-gray-400" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M20 4H4a2 2 0 0 0-2 2v.24l10 5.56 10-5.56V6a2 2 0 0 0-2-2Zm2 5.03-9.51 5.28a1 1 0 0 1-.98 0L2 9.03V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9.03Z" />
                  </svg>
                </span>
                <span>support@digicart.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-gray-400" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M20 4H4a2 2 0 0 0-2 2v.24l10 5.56 10-5.56V6a2 2 0 0 0-2-2Zm2 5.03-9.51 5.28a1 1 0 0 1-.98 0L2 9.03V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9.03Z" />
                  </svg>
                </span>
                <span>sales@digicart.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative mt-8 pt-10">
          <div className="pointer-events-none absolute left-0 right-0 top-0 hidden h-8 sm:block" aria-hidden="true">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="h-full w-full">
              <path
                d="M0 30H380C430 30 470 10 500 10H940C970 10 1010 30 1060 30H1440"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.22"
                strokeWidth="1"
              />
            </svg>
          </div>

          <div className="grid gap-3 md:grid-cols-3 md:items-center">
            <div className="hidden md:block" />

            <p className="text-center text-sm text-gray-400">© 2026 DigiCart. All rights reserved.</p>

            <div className="flex items-center justify-center gap-4 text-sm md:justify-end">
              <Link to="/terms" className="text-gray-400 transition-colors hover:text-white">
                Terms &amp; Conditions
              </Link>
              <Link to="/privacy" className="text-gray-400 transition-colors hover:text-white">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
