import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../api/axios';
import CartDrawer from './CartDrawer';

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
    siteLogoUrl: '',
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
          siteLogoUrl: data?.siteLogoUrl || '',
        });
      } catch (error) {
        console.error('Failed to fetch site branding:', error);
      }
    };

    fetchSiteBranding();
  }, []);

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
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="sm:hidden">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>

              <Link to="/" className="flex items-center gap-2 text-[#2563eb]">
                {siteBranding.siteLogoUrl ? (
                  <img
                    src={siteBranding.siteLogoUrl}
                    alt={siteBranding.siteTitle}
                    className="h-9 w-auto max-w-[150px] object-contain"
                  />
                ) : (
                  <span className="text-[28px] leading-none font-bold tracking-tight">{siteBranding.siteTitle}</span>
                )}
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#2563eb] text-white"
                aria-label="Open cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l-1 12H6L5 8zm2-3a3 3 0 016 0v1H7V5z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#2563eb] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
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
              {siteBranding.siteLogoUrl ? (
                <img
                  src={siteBranding.siteLogoUrl}
                  alt={siteBranding.siteTitle}
                  className="h-8 w-auto max-w-[170px] object-contain"
                />
              ) : (
                siteBranding.siteTitle
              )}
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
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="hidden sm:flex mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 items-center gap-5 overflow-x-auto whitespace-nowrap">
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

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] sm:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close mobile menu overlay"
          />

          <aside className="relative h-full w-[86%] max-w-[360px] overflow-y-auto bg-[#f4f5f7] px-4 pb-8 pt-4 shadow-[8px_0_30px_rgba(15,23,42,0.2)]">
            <div className="flex items-center justify-between">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-[#2563eb]">
                {siteBranding.siteLogoUrl ? (
                  <img
                    src={siteBranding.siteLogoUrl}
                    alt={siteBranding.siteTitle}
                    className="h-8 w-auto max-w-[140px] object-contain"
                  />
                ) : (
                  <span className="text-[22px] leading-none font-bold tracking-tight">{siteBranding.siteTitle}</span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600"
                aria-label="Close mobile menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-300 bg-white p-4">
              <div className="space-y-3">
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
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
                      aria-label="LinkedIn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
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
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
                      aria-label="Twitter"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;

