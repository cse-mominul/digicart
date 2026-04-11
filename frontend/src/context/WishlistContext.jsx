import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();
const WISHLIST_STORAGE_KEY = 'digicart_wishlist_items';

const parseStoredWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(parseStoredWishlist);
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    if (!user?.token) return;

    const wishlistProductIds = Array.from(
      new Set((wishlistItems || []).map((item) => item?._id).filter(Boolean))
    );

    API.post('/engagement/sync', { wishlistProductIds }).catch(() => {
      // Silent fail: tracking should never block wishlist UX.
    });
  }, [wishlistItems, user?.token]);

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((item) => item._id !== id));
  };

  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (id) => wishlistItems.some((item) => item._id === id);

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount: wishlistItems.length,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    }),
    [wishlistItems]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);
