import { useEffect, useRef, useState } from 'react';
import logoLight from '../assets/logo-light.jpeg';
import logoDark from '../assets/logo-dark.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../api/axios';
import CartDrawer from './CartDrawer';
import MobileBottomNav from './MobileBottomNav';

const mobileMenuItems = [
  { label: 'Home', to: '/', icon: 'home' },
  { label: 'About Us', to: '/contact-us', icon: 'about' },
  { label: 'Shop', to: '/products/all', icon: 'shop' },
  { label: 'Contact', to: '/contact-us', icon: 'contact' },
];

const toSlug = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryLinks, setCategoryLinks] = useState(['All']);
  const [siteBranding, setSiteBranding] = useState({
    siteTitle: 'DigiCart',
  });
  const accountRef = useRef(null);
  const searchRef = useRef(null);

  const firstName = user?.name?.trim()?.split(' ')[0] || 'My Account';

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products/all?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product._id}`);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const response = await API.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
          const products = Array.isArray(response.data) ? response.data : response.data.products || [];
          setSuggestions(products.slice(0, 5));
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        if (Array.isArray(data) && data.length > 0) {
          setCategoryLinks(['All', ...data.map((category) => category.name).filter(Boolean)]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSiteBranding = async () => {
      try {
        const { data } = await API.get('/settings');
        setSiteBranding({
          siteTitle: data?.siteTitle || 'DigiCart',
        });
      } catch (error) {
        console.error('Failed to fetch site branding:', error);
      }
    };
    fetchSiteBranding();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentSlug = location.pathname.startsWith('/products/')
    ? decodeURIComponent(location.pathname.split('/products/')[1] || '')
    : '';

  const renderMobileMenuIcon = (type) => {
    if (type === 'home') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11.5L12 4l9 7.5M5 10.5V20h14v-9.5M9 20v-6h6v6" />
        </svg>
      );
    }

    if (type === 'about') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    if (type === 'shop') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.29 2.29a1 1 0 00.7 1.71H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    }

    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414A8 8 0 1112 13.414l4.243 4.243a1 1 0 01-1.414 1.414z" />
      </svg>
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="sm:hidden">
            <div className="flex items-center justify-center relative min-h-[56px]">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="absolute left-0 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>

              <Link to="/" className="flex items-center justify-center">
                {/* Light mode logo */}
                <img
                  src={logoLight}
                  alt={siteBranding.siteTitle}
                  className="h-10 w-auto max-w-[140px] object-contain block dark:hidden"
                />
                {/* Dark mode logo */}
                <img
                  src={logoDark}
                  alt={siteBranding.siteTitle}
                  className="h-10 w-auto max-w-[140px] object-contain hidden dark:block"
                />
              </Link>
            </div>

            <div className="mt-3">
              <div className="relative mx-auto w-[90%] max-w-sm" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search for the Items"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearch}
                  className="w-full bg-white dark:bg-gray-900 border border-[#2563eb]/40 dark:border-[#2563eb]/40 rounded-full py-2 pl-4 pr-12 text-base text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 absolute right-3 top-1/2 -translate-y-1/2 text-[#2563eb]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z" />
                </svg>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    {suggestions.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleSuggestionClick(product)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3 transition-colors"
                      >
                        <img
                          src={product.image || 'https://placehold.co/40x40?text=Product'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">${product.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="hidden sm:flex items-center gap-2 sm:gap-3 md:gap-6">
            <Link to="/" className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#2563eb] tracking-tight flex-shrink-0">
              <>
                {/* Light mode logo */}
                <img
                  src={logoLight}
                  alt={siteBranding.siteTitle}
                  className="h-8 w-auto max-w-[170px] object-contain block dark:hidden"
                />
                {/* Dark mode logo */}
                <img
                  src={logoDark}
                  alt={siteBranding.siteTitle}
                  className="h-8 w-auto max-w-[170px] object-contain hidden dark:block"
                />
              </>
            </Link>

            <div className="hidden sm:flex flex-1 max-w-xl mx-auto">
              <div className="relative w-full" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearch}
                  className="w-full bg-white dark:bg-gray-900 border border-[#2563eb] rounded-full py-1.5 sm:py-2 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-0"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z" />
                </svg>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    {suggestions.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleSuggestionClick(product)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3 transition-colors"
                      >
                        <img
                          src={product.image || 'https://placehold.co/40x40?text=Product'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">${product.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-5 text-xs sm:text-sm">
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="inline-flex p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <Link to="/account/wishlist" className="hidden sm:flex items-center gap-1 text-gray-800 dark:text-gray-100 hover:text-[#2563eb] transition-colors relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div ref={accountRef} className="relative">
                  <button
                    onClick={() => setAccountOpen((prev) => !prev)}
                    className="flex items-center gap-2 text-gray-800 dark:text-gray-100 hover:text-[#2563eb] transition-colors"
                    aria-label="My account menu"
                    aria-expanded={accountOpen}
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <span className="hidden sm:inline font-medium">{firstName}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="hidden sm:block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-sm py-2 z-50">
                      <Link
                        to="/account/profile"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-gray-800 dark:text-gray-100 hover:text-[#2563eb] transition-colors">
                  Login
                </Link>
              )}

              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1 text-gray-800 dark:text-gray-100 hover:text-[#2563eb] transition-colors"
                aria-label="Open cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l-1 12H6L5 8zm2-3a3 3 0 016 0v1H7V5z" />
                </svg>
                <span className="hidden sm:inline">Bag</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="hidden sm:flex mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 items-center gap-5 overflow-x-auto whitespace-nowrap no-scrollbar">
            <button
              onClick={() => navigate('/products/all?sort=price_asc')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 text-white text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-fire" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.187-.249-2.315-.7-3.336a.75.75 0 011.035-1.035 9.747 9.747 0 012.29 2.12 1 1 0 001.783-.13 13.047 13.047 0 001.374-5.544 1 1 0 00-1.723-.706 7.516 7.516 0 01-4.684 2.624 19.059 19.059 0 00-1-1.783z" clipRule="evenodd" />
              </svg>
              Super Six
            </button>
            {categoryLinks.map((category) => {
              const slug = toSlug(category);
              const isActive = slug === 'all'
                ? currentSlug === '' || currentSlug === 'all'
                : currentSlug === slug;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => navigate(`/products/${slug}`)}
                  className={`group relative cursor-pointer text-sm font-medium transition-all duration-200 hover:text-blue-500 ${
                    isActive ? 'text-blue-500' : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {category}
                  <span
                    className={`absolute left-0 -bottom-1 h-0.5 bg-blue-500 transition-all duration-200 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Menu Sidebar with Slide Animation */}
      <div 
        className={`fixed inset-0 z-[70] sm:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <aside 
          className={`relative h-full w-[86%] max-w-[360px] overflow-y-auto bg-white px-4 pb-8 pt-4 shadow-[8px_0_30px_rgba(15,23,42,0.1)] transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-[#2563eb]">
              <>
                {/* Light mode logo */}
                <img
                  src={logoLight}
                  alt={siteBranding.siteTitle}
                  className="h-8 w-auto max-w-[140px] object-contain block dark:hidden"
                />
                {/* Dark mode logo */}
                <img
                  src={logoDark}
                  alt={siteBranding.siteTitle}
                  className="h-8 w-auto max-w-[140px] object-contain hidden dark:block"
                />
              </>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600"
              aria-label="Close mobile menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-5 p-0">
            <div className="space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/products/all?sort=price_asc');
                }}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-orange-400 text-white text-base font-bold shadow-sm active:scale-95 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-fire" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.187-.249-2.315-.7-3.336a.75.75 0 011.035-1.035 9.747 9.747 0 012.29 2.12 1 1 0 001.783-.13 13.047 13.047 0 001.374-5.544 1 1 0 00-1.723-.706 7.516 7.516 0 01-4.684 2.624 19.059 19.059 0 00-1-1.783z" clipRule="evenodd" />
                </svg>
                Super Six
              </button>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-base font-medium text-gray-700"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white">
                  {renderMobileMenuIcon('home')}
                </span>
                <span>Home</span>
              </Link>

              <Link
                to="/account/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-base font-medium text-gray-700"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </span>
                <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
              </Link>

              {user ? (
                <Link
                  to="/account/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-base font-medium text-gray-700"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <span>My Profile</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-base font-medium text-gray-700"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span>Login / Sign Up</span>
                </Link>
              )}

              {mobileMenuItems.slice(1).map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-base font-medium text-gray-700"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white">
                    {renderMobileMenuIcon(item.icon)}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 text-base font-medium text-red-500"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </span>
                  <span>Logout</span>
                </button>
              )}

              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="mb-3 text-sm font-semibold text-gray-700">Follow us</p>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
                    aria-label="Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
                    aria-label="Instagram"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m6 12.5c0 .276-.224.5-.5.5h-.5v3.5c0 .828-.672 1.5-1.5 1.5h-9c-.828 0-1.5-.672-1.5-1.5V13h-.5c-.276 0-.5-.224-.5-.5v-1c0-.276.224-.5.5-.5h.5V9.5c0-.828.672-1.5 1.5-1.5h9c.828 0 1.5.672 1.5 1.5v2h.5c.276 0 .5.224.5.5v1zm-5.25-4.25c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                    </svg>
                  </a>

                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileBottomNav cartCount={totalItems} onCartClick={() => setCartOpen(true)} />
    </>
  );
};

export default Navbar;

