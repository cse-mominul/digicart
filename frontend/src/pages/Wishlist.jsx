import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';
import { showAddToCartSuccess } from '../utils/showAddToCartSuccess';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
    showAddToCartSuccess(product.name);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-140px)] py-6 sm:py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[620px]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">Wishlist</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your saved products are arranged here in a card layout that matches your Addresses page.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-[#ff3366] dark:bg-gray-800 dark:text-pink-300">
                {wishlistItems.length} item(s)
              </span>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-[#ff3366] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition-colors hover:bg-[#ff1f58]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-center dark:border-gray-700 dark:bg-gray-900">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Your wishlist is empty.</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Save products while shopping to see them here.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {wishlistItems.map((item) => (
                <article key={item._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-pink-50 dark:bg-gray-800">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/80x80?text=?';
                          }}
                        />
                      </span>
                      <div>
                        <p className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Saved Item</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item._id)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-[#ff3366] hover:text-[#ff3366] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2 py-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                    <p className="font-semibold text-[#ff3366]">{formatPrice(item.price)}</p>
                    <p className="line-clamp-3">Stored in your wishlist for quick access later.</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="text-sm font-medium text-[#ff3366] transition-colors hover:text-[#ff1f58]"
                    >
                      Add to Cart
                    </button>
                    <Link
                      to="/products"
                      className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-white"
                    >
                      Browse More
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
