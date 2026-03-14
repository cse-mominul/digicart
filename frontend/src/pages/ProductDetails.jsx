import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const discountPercent = useMemo(() => {
    if (!product) return 0;
    const discountOptions = [15, 25, 30, 40];
    return discountOptions[product.name.length % discountOptions.length];
  }, [product]);

  const oldPrice = useMemo(() => {
    if (!product) return 0;
    return product.price / (1 - discountPercent / 100);
  }, [product, discountPercent]);

  const stockCount = product?.countInStock ?? product?.stock ?? 0;
  const inWishlist = product ? isInWishlist(product._id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist(product);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-[420px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-pink-500"
        >
          ← Back to Home
        </Link>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-10 text-center">
          <p className="text-gray-600 dark:text-gray-300">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-pink-500"
      >
        ← Back to Home
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950">
            <span className="absolute top-3 left-3 z-10 bg-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {discountPercent}% OFF
            </span>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[280px] sm:h-[360px] lg:h-[420px] object-cover"
              onError={(e) => {
                e.target.src = 'https://placehold.co/800x800?text=No+Image';
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-7">
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 mb-3">
            {product.category}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="text-3xl font-bold text-pink-600 dark:text-pink-400">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-lg text-gray-400 line-through">${oldPrice.toFixed(2)}</span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Save {discountPercent}%
            </span>
          </div>

          <p className="mt-5 text-gray-600 dark:text-gray-300 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-6 mb-2 text-sm text-gray-500 dark:text-gray-400">
            {stockCount > 0 ? `${stockCount} in stock` : 'Out of stock'}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              disabled={stockCount === 0}
              className="w-full rounded-xl bg-gray-900 dark:bg-pink-500 text-white py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>

            <button
              onClick={handleWishlist}
              className={`w-full rounded-xl py-3 font-semibold border transition-colors ${
                inWishlist
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:border-pink-400'
              }`}
            >
              {inWishlist ? '♥ Added to Wishlist' : '♡ Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
