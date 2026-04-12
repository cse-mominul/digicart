import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import { showAddToCartSuccess } from '../utils/showAddToCartSuccess';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const stockCount = product.countInStock ?? product.stock ?? 0;
  const discountOptions = [15, 25, 30, 40];
  const price = Number(product.price) || 0;
  const showDiscount = product.showDiscount !== false;
  const fallbackDiscount = discountOptions[(product.name || '').length % discountOptions.length];
  const discountLabel = String(product.discountText || '').trim() || `${fallbackDiscount}% OFF`;
  const discountMatch = discountLabel.match(/(\d+(?:\.\d+)?)\s*%/);
  const discountPercent = discountMatch ? Number(discountMatch[1]) : fallbackDiscount;
  const compareAtPrice = Number(product.compareAtPrice) || 0;
  const oldPrice = compareAtPrice > price
    ? compareAtPrice
    : (price > 0 ? price / (1 - discountPercent / 100) : 0);
  const displayRating = Math.min(5, Math.max(0, Number(product.displayRating) || 4));
  const filledStars = Math.round(displayRating);
  const reviewsText = String(product.displayReviewsText || '').trim() || '189';

  const handleAddToCart = () => {
    addToCart(product);
    showAddToCartSuccess(product.name);
  };

  const handleWishlist = () => {
    const exists = isInWishlist(product._id);
    toggleWishlist(product);
    toast.success(exists ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const inWishlist = isInWishlist(product._id);

  return (
    <article
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden cursor-pointer"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="relative overflow-hidden">
        {showDiscount && (
          <span className="absolute top-3 left-3 z-10 bg-yellow-400 text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-full">
            {discountLabel}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
        />
        <span className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-900/95 text-xs text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
          {product.category}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWishlist();
          }}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
            inWishlist
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:text-blue-500'
          }`}
          aria-label="Add to wishlist"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={stockCount === 0}
          className="absolute right-3 -bottom-5 bg-gray-900 dark:bg-blue-500 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add to bag"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l-1 12H6L5 8zm2-3a3 3 0 016 0v1H7V5z" />
          </svg>
        </button>
        {stockCount === 0 && (
          <span className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white">
            Out of Stock
          </span>
        )}
        {stockCount === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
        )}
      </div>
      <div className="p-4 pt-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base leading-snug min-h-[44px] line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2 min-h-[40px]">
          {product.description}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{formatPrice(price)}</span>
          {showDiscount && (
            <span className="text-gray-400 line-through text-sm">{formatPrice(oldPrice)}</span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 ${index < filledStars ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
          <span className="text-xs text-gray-500 dark:text-gray-400">({reviewsText})</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={stockCount === 0}
          className="mt-3 w-full rounded-xl bg-gray-900 dark:bg-blue-500 text-white py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
};

export default ProductCard;

