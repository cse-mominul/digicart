import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/formatPrice';

const toTitleFromSlug = (slug = '') =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const getProductBrand = (product) =>
  typeof product?.brand === 'string' ? product.brand.trim() : '';

const CategoryProducts = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 8;
  const [priceLimit, setPriceLimit] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const normalizedSlug = (categorySlug || 'all').toLowerCase();
  const showAllCategories = normalizedSlug === 'all';
  const searchTerm = searchParams.get('search') || '';

  const categoryTitle = useMemo(() => {
    if (searchTerm) return `Search Results for "${searchTerm}"`;
    if (showAllCategories) return 'All Products';
    return toTitleFromSlug(categorySlug || '');
  }, [categorySlug, showAllCategories, searchTerm]);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(...products.map((product) => Number(product.price) || 0));
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => getProductBrand(product)).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
        });

        if (!showAllCategories) {
          queryParams.append('category', categorySlug || '');
        }

        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }

        const { data } = await API.get(`/products?${queryParams.toString()}`);

        const list = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
        const pages = Number(data?.pages) || 1;
        const total = Number(data?.total) || list.length;

        setProducts(list);
        setTotalPages(Math.max(1, pages));
        setTotalProducts(total);

        const initialMax = list.length > 0 ? Math.max(...list.map((item) => Number(item.price) || 0)) : 0;
        setPriceLimit((prev) => {
          if (prev === 0) return initialMax;
          if (initialMax === 0) return 0;
          return Math.min(prev, initialMax);
        });
      } catch (error) {
        console.error('Failed to fetch category products:', error);
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
        setPriceLimit(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [categorySlug, showAllCategories, currentPage, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
    setOnlyInStock(false);
    setSelectedBrands([]);
    setPriceLimit(0);
  }, [categorySlug, searchTerm]);

  useEffect(() => {
    const getPrice = (item) => Number(item.price) || 0;
    let next = [...products];

    next = next.filter((product) => getPrice(product) <= priceLimit);

    if (onlyInStock) {
      next = next.filter((product) => (product.countInStock ?? product.stock ?? 0) > 0);
    }

    if (selectedBrands.length > 0) {
      next = next.filter((product) => selectedBrands.includes(getProductBrand(product)));
    }

    if ((priceLimit === 0 || next.length === 0) && products.length > 0) {
      const fallbackList = [...products]
        .sort((first, second) => getPrice(first) - getPrice(second))
        .slice(0, 10);
      setFilteredProducts(fallbackList);
      setIsFallbackActive(true);
      return;
    }

    setFilteredProducts(next);
    setIsFallbackActive(false);
  }, [products, priceLimit, onlyInStock, selectedBrands]);

  useEffect(() => {
    setCurrentPage(1);
  }, [priceLimit, onlyInStock, selectedBrands]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    document.body.style.overflow = mobileFilterOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((item) => item !== brand) : [...prev, brand]
    );
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{categoryTitle}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{totalProducts} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12m-9 8h6" />
            </svg>
            Filter
          </button>
        </div>

        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close filter"
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/45"
            />

            <aside className="absolute right-0 top-0 h-full w-[80%] max-w-[320px] overflow-y-auto border-l border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Product Filter</h2>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-4 py-4">
                <div className="mb-6 border-b border-gray-200 pb-5 dark:border-gray-700">
                  <p className="text-2xl font-bold leading-none text-gray-900 dark:text-white">Price Range</p>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(maxPrice, 0)}
                    value={priceLimit}
                    onChange={(event) => setPriceLimit(Number(event.target.value))}
                    className="mt-4 w-full accent-orange-600"
                    disabled={maxPrice === 0}
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded border border-gray-300 bg-white px-2 py-1.5 text-center text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      0
                    </div>
                    <div className="rounded border border-gray-300 bg-white px-2 py-1.5 text-center text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {priceLimit}
                    </div>
                  </div>
                </div>

                <div className="mb-6 border-b border-gray-200 pb-5 dark:border-gray-700">
                  <p className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">Availability</p>
                  <label className="inline-flex items-center gap-2 text-base text-gray-800 dark:text-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(event) => setOnlyInStock(event.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-gray-400"
                    />
                    In Stock
                  </label>
                </div>

                <div>
                  <p className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">Brand</p>
                  <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar pr-1">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-2 text-base text-gray-800 dark:text-gray-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-gray-400"
                        />
                        {brand}
                      </label>
                    ))}
                    {brands.length === 0 && (
                      <p className="text-sm text-gray-400 dark:text-gray-500">No brands available</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full rounded-xl bg-orange-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-orange-500"
                >
                  Show {filteredProducts.length} Products
                </button>
              </div>
            </aside>
          </div>
        )}

        <aside className="hidden w-full lg:block lg:w-72 lg:flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:overflow-y-auto no-scrollbar">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Filters</h2>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Price Range</p>
              <input
                type="range"
                min={0}
                max={Math.max(maxPrice, 0)}
                value={priceLimit}
                onChange={(event) => setPriceLimit(Number(event.target.value))}
                className="w-full accent-gray-900 dark:accent-white"
                disabled={maxPrice === 0}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Up to {formatPrice(priceLimit)}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Availability</p>
              <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(event) => setOnlyInStock(event.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-gray-400"
                />
                In Stock Only
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Brand</p>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-gray-400"
                    />
                    {brand}
                  </label>
                ))}
                {brands.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500">No brands available</p>
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <div>
            <div className="h-5 mb-3">
              {isFallbackActive && !loading && products.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Showing our best value items</p>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="h-80 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    {pageNumbers.map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="mb-4 h-14 w-14 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-7 w-7 text-gray-400 dark:text-gray-500"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M3 7.5l9-4 9 4m-18 0l9 4m-9-4V17l9 4m0-9.5l9-4V17l-9 4" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No products found in this category
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoryProducts;