import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';

const CartDrawer = ({ open, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    onClose();
    navigate('/checkout');
  };

  const handleOpenWishlist = () => {
    onClose();
    navigate('/account/wishlist');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-2xl z-50"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Bag</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl leading-none"
                  aria-label="Close cart"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14l-1 12H6L5 8zm2-3a3 3 0 016 0v1H7V5z" />
                    </svg>
                    <p className="text-lg font-medium">Your cart is empty</p>
                    <p className="text-sm mt-1">Add products to view them here</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/64x64?text=?';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{item.name}</p>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium w-4 text-center text-gray-700 dark:text-gray-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Total:</span>
                  <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">{formatPrice(totalPrice)}</span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={handleOpenWishlist}
                    className="w-full bg-gray-900 dark:bg-gray-800 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    View Full Wishlist
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

