import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';

const discountSteps = [10, 15, 20, 25];
const itemsPerPage = 10;

const OurProductsSection = ({ products = [], loading = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const visibleProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, products]);

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  const handleAddToCart = (event, product) => {
    event.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (event, product) => {
    event.stopPropagation();
    const exists = isInWishlist(product._id);
    toggleWishlist(product);
    toast.success(exists ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <section className="mb-10 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-5 dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Our Products</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading ? 'Loading products...' : `${products.length} products`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="h-[228px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900" />
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No products found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {visibleProducts.map((product) => {
              const price = Number(product.price) || 0;
              const discount = discountSteps[(product.name || '').length % discountSteps.length];
              const oldPrice = price > 0 ? price / (1 - discount / 100) : 0;
              const imageSrc = product.image || product.imageURL || 'https://placehold.co/320x320?text=Product';
              const inWishlist = isInWishlist(product._id);

              return (
                <article
                  key={product._id}
                  className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-[#111827]"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative">
                    <span className="absolute left-1.5 top-1.5 z-10 rounded bg-[#ff3366] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      {discount}% OFF
                    </span>
                    <div className="flex h-24 items-center justify-center rounded-xl bg-slate-50 p-2 sm:h-28 dark:bg-slate-900">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src = 'https://placehold.co/320x320?text=Product';
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <h4 className="min-h-[36px] line-clamp-2 text-[12px] font-medium leading-4 text-slate-800 dark:text-slate-100">
                      {product.name}
                    </h4>

                    <div className="mt-1 flex items-center gap-1 text-[#f59e0b]">
                      {[...Array(5)].map((_, index) => (
                        <svg key={index} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                      <span className="text-[10px] text-slate-400">(189)</span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(price)}</span>
                      <span className="text-[10px] text-slate-400 line-through">{formatPrice(oldPrice)}</span>
                      <span className="text-[10px] font-semibold text-[#ff3366]">{discount}% OFF</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => handleWishlist(event, product)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                          inWishlist
                            ? 'border-[#ff3366] bg-[#ff3366] text-white'
                            : 'border-slate-200 text-slate-500 hover:border-[#ff3366] hover:text-[#ff3366] dark:border-slate-700 dark:text-slate-300'
                        }`}
                        aria-label="Toggle wishlist"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => handleAddToCart(event, product)}
                        className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-[#ff3366] px-2 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#ff1f58] sm:text-[11px]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l-1 12H6L5 8zm2-3a3 3 0 016 0v1H7V5z" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
              >
                Prev
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`h-9 min-w-9 rounded-full px-3 text-sm font-medium transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-[#ff3366] text-white'
                      : 'border border-slate-200 text-slate-700 hover:border-[#ff3366] hover:text-[#ff3366] dark:border-slate-700 dark:text-slate-200'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default OurProductsSection;
