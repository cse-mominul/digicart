import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const stockCount = product.countInStock ?? product.stock ?? 0;
  const discountOptions = [15, 25, 30, 40];
  const discountPercent = discountOptions[product.name.length % discountOptions.length];
  const oldPrice = product.price / (1 - discountPercent / 100);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
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
        <span className="absolute top-3 left-3 z-10 bg-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {discountPercent}% OFF
        </span>
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
              ? 'bg-pink-500 border-pink-500 text-white'
              : 'bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:text-pink-500'
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
          className="absolute right-3 -bottom-5 bg-gray-900 dark:bg-pink-500 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add to bag"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14l-1 12H6L5 8zm2-3a3 3 0 016 0v1H7V5z" />
          </svg>
        </button>
        {stockCount === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
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
          <span className="text-pink-600 dark:text-pink-400 font-bold text-lg">{formatPrice(product.price)}</span>
          <span className="text-gray-400 line-through text-sm">{formatPrice(oldPrice)}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={stockCount === 0}
          className="mt-3 w-full rounded-xl bg-gray-900 dark:bg-pink-500 text-white py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
