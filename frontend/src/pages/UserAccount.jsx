import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';
import { showAddToCartSuccess } from '../utils/showAddToCartSuccess';

const ADDRESS_STORAGE_KEY = 'digicart_saved_addresses';
const WISHLIST_ITEMS_PER_PAGE = 6;
const ORDERS_ITEMS_PER_PAGE = 5;
const MY_REVIEWS_ITEMS_PER_PAGE = 4;
const ORDER_FILTERS = ['All', 'Processing', 'Delivering', 'Completed', 'Cancelled'];

const navItems = [
  { id: 'profile', label: 'My Account', to: '/account/profile', icon: 'user' },
  { id: 'orders', label: 'Orders', to: '/account/orders', icon: 'box' },
  { id: 'payments', label: 'Payments', to: '/account/payments', icon: 'wallet' },
  { id: 'reviews', label: 'My Reviews', to: '/account/reviews', icon: 'review' },
  { id: 'wishlist', label: 'Wishlist', to: '/account/wishlist', icon: 'heart' },
  { id: 'address', label: 'My Address', to: '/account/addresses', icon: 'location' },
  { id: 'logout', label: 'Log Out', to: '/login', icon: 'logout' },
];

const getStoredAddresses = () => {
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const emptyAddressForm = {
  label: '',
  city: '',
  area: '',
  address: '',
  phone: '',
};

const Icon = ({ type }) => {
  if (type === 'dashboard') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 5h7v2h-7v-2z" />
      </svg>
    );
  }

  if (type === 'box') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    );
  }

  if (type === 'heart') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }

  if (type === 'location') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  if (type === 'user') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  if (type === 'review') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.157c.969 0 1.371 1.24.588 1.81l-3.364 2.444a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.54 1.118l-3.364-2.444a1 1 0 00-1.175 0l-3.364 2.444c-.784.57-1.838-.197-1.54-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.074 9.382c-.783-.57-.38-1.81.588-1.81h4.157a1 1 0 00.95-.69l1.286-3.955z" />
      </svg>
    );
  }

  if (type === 'wallet') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V5a3 3 0 00-3-3H6a3 3 0 00-3 3v11a3 3 0 003 3z" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M17 16l4-4m0 0l-4-4m4 4H7" />
    </svg>
  );
};

const UserAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }));
  }, [user?.name, user?.email, user?.phone]);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [myReviewsLoading, setMyReviewsLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const PAYMENTS_ITEMS_PER_PAGE = 5;
  const [reviewDraft, setReviewDraft] = useState({
    rating: 5,
    comment: '',
    image: '',
  });
  const [activeOrderFilter, setActiveOrderFilter] = useState('All');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [addresses, setAddresses] = useState(getStoredAddresses);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [myReviewsPage, setMyReviewsPage] = useState(1);

  const section = useMemo(() => {
    if (location.pathname === '/account/orders') return 'orders';
    if (location.pathname === '/account/payments') return 'payments';
    if (location.pathname === '/account/reviews') return 'reviews';
    if (location.pathname === '/account/wishlist') return 'wishlist';
    if (location.pathname === '/account/addresses') return 'addresses';
    return 'profile';
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const { data } = await API.get('/orders/myorders');
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };

    if (section === 'orders') {
      fetchOrders();
    }
    if (section === 'payments') {
      const fetchPayments = async () => {
        setPaymentsLoading(true);
        try {
          const { data } = await API.get('/orders/my-payments');
          setPayments(Array.isArray(data) ? data : []);
        } catch {
          toast.error('Failed to load payments');
        } finally {
          setPaymentsLoading(false);
        }
      };
      fetchPayments();
    }
  }, [section]);

  useEffect(() => {
    const fetchMyReviews = async () => {
      setMyReviewsLoading(true);
      try {
        const { data } = await API.get('/products/my-reviews');
        setMyReviews(Array.isArray(data) ? data : []);
      } catch {
        // Fallback for environments where /products/my-reviews route is unavailable.
        try {
          const { data: orderData } = await API.get('/orders/myorders');
          const successfulOrders = (Array.isArray(orderData) ? orderData : []).filter((order) => {
            const rawStatus = String(order?.status || '').toLowerCase();
            return rawStatus === 'delivered' || rawStatus === 'completed';
          });

          const productMap = new Map();
          successfulOrders.forEach((order) => {
            const items = Array.isArray(order?.items) ? order.items : [];
            items.forEach((item) => {
              const productId = typeof item?.product === 'string' ? item.product : item?.product?._id;
              if (!productId || productMap.has(productId)) return;

              productMap.set(productId, {
                _id: productId,
                name: item?.name || item?.product?.name || 'Product',
                image: item?.image || item?.product?.image || 'https://placehold.co/64x64?text=?',
                category: item?.product?.category || '',
                price: Number(item?.price || item?.product?.price || 0),
              });
            });
          });

          const productIds = Array.from(productMap.keys());
          const reviewResponses = await Promise.all(
            productIds.map(async (productId) => {
              try {
                const { data } = await API.get(`/products/${productId}/reviews`);
                if (!data?.currentUserReview) return null;

                return {
                  ...data.currentUserReview,
                  product: productMap.get(productId),
                };
              } catch {
                return null;
              }
            })
          );

          const ownReviews = reviewResponses
            .filter(Boolean)
            .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

          setMyReviews(ownReviews);
        } catch {
          setMyReviews([]);
          toast.error('Failed to load your reviews');
        }
      } finally {
        setMyReviewsLoading(false);
      }
    };

    if (section === 'reviews') {
      fetchMyReviews();
    }
  }, [section]);

  const totalMyReviewsPages = Math.max(1, Math.ceil(myReviews.length / MY_REVIEWS_ITEMS_PER_PAGE));

  const paginatedMyReviews = useMemo(() => {
    const startIndex = (myReviewsPage - 1) * MY_REVIEWS_ITEMS_PER_PAGE;
    return myReviews.slice(startIndex, startIndex + MY_REVIEWS_ITEMS_PER_PAGE);
  }, [myReviews, myReviewsPage]);

  useEffect(() => {
    if (section === 'reviews') {
      setMyReviewsPage(1);
    }
  }, [section]);

  useEffect(() => {
    if (myReviewsPage > totalMyReviewsPages) {
      setMyReviewsPage(totalMyReviewsPages);
    }
  }, [myReviewsPage, totalMyReviewsPages]);

  const getMyReviewsPageNumbers = () => {
    if (totalMyReviewsPages <= 7) {
      return Array.from({ length: totalMyReviewsPages }, (_, index) => index + 1);
    }

    if (myReviewsPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalMyReviewsPages];
    }

    if (myReviewsPage >= totalMyReviewsPages - 3) {
      return [1, '...', totalMyReviewsPages - 4, totalMyReviewsPages - 3, totalMyReviewsPages - 2, totalMyReviewsPages - 1, totalMyReviewsPages];
    }

    return [1, '...', myReviewsPage - 1, myReviewsPage, myReviewsPage + 1, '...', totalMyReviewsPages];
  };

  const totalWishlistPages = Math.max(1, Math.ceil(wishlistItems.length / WISHLIST_ITEMS_PER_PAGE));

  const paginatedWishlistItems = useMemo(() => {
    const startIndex = (wishlistPage - 1) * WISHLIST_ITEMS_PER_PAGE;
    return wishlistItems.slice(startIndex, startIndex + WISHLIST_ITEMS_PER_PAGE);
  }, [wishlistItems, wishlistPage]);

  useEffect(() => {
    if (wishlistPage > totalWishlistPages) {
      setWishlistPage(totalWishlistPages);
    }
  }, [wishlistPage, totalWishlistPages]);

  const getWishlistPageNumbers = () => {
    if (totalWishlistPages <= 7) {
      return Array.from({ length: totalWishlistPages }, (_, index) => index + 1);
    }

    if (wishlistPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalWishlistPages];
    }

    if (wishlistPage >= totalWishlistPages - 3) {
      return [1, '...', totalWishlistPages - 4, totalWishlistPages - 3, totalWishlistPages - 2, totalWishlistPages - 1, totalWishlistPages];
    }

    return [1, '...', wishlistPage - 1, wishlistPage, wishlistPage + 1, '...', totalWishlistPages];
  };

  const normalizeOrderStatus = (status) => {
    const rawStatus = String(status || '').toLowerCase();

    if (rawStatus === 'cancelled' || rawStatus === 'canceled') return 'Cancelled';
    if (rawStatus === 'delivered' || rawStatus === 'completed') return 'Completed';
    if (rawStatus === 'shipped' || rawStatus === 'delivering' || rawStatus === 'out for delivery') return 'Delivering';
    if (rawStatus === 'processing' || rawStatus === 'pending') return 'Processing';

    return 'Processing';
  };

  const isOrderPaid = (order) => {
    const paymentStatus = String(order?.paymentStatus || '').toLowerCase();
    const rawStatus = String(order?.status || '').toLowerCase();
    const isCompleted = rawStatus === 'delivered' || rawStatus === 'completed';

    return Boolean(order?.isPaid || paymentStatus === 'paid' || isCompleted);
  };

  const getPaymentMethodLabel = (method) => {
    const normalizedMethod = String(method || '').trim().toLowerCase();
    if (!normalizedMethod) return 'Unknown';
    if (normalizedMethod === 'bkash') return 'bKash';
    if (normalizedMethod === 'nogod' || normalizedMethod === 'nagad') return 'Nagad';
    if (normalizedMethod === 'cod') return 'Cash on Delivery';
    if (normalizedMethod === 'upay') return 'Upay';
    return normalizedMethod.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getOrderBadgeClasses = (status) => {
    if (status === 'Cancelled') {
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    }

    if (status === 'Completed') {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    }

    if (status === 'Delivering') {
      return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';
    }

    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  };

  const filteredOrders = useMemo(() => {
    if (activeOrderFilter === 'All') {
      return orders;
    }

    return orders.filter((order) => normalizeOrderStatus(order.status) === activeOrderFilter);
  }, [activeOrderFilter, orders]);

  const totalOrdersPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_ITEMS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const startIndex = (ordersPage - 1) * ORDERS_ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ORDERS_ITEMS_PER_PAGE);
  }, [filteredOrders, ordersPage]);

  useEffect(() => {
    setOrdersPage(1);
  }, [activeOrderFilter, section]);

  useEffect(() => {
    if (ordersPage > totalOrdersPages) {
      setOrdersPage(totalOrdersPages);
    }
  }, [ordersPage, totalOrdersPages]);

  const getOrdersPageNumbers = () => {
    if (totalOrdersPages <= 7) {
      return Array.from({ length: totalOrdersPages }, (_, index) => index + 1);
    }

    if (ordersPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalOrdersPages];
    }

    if (ordersPage >= totalOrdersPages - 3) {
      return [1, '...', totalOrdersPages - 4, totalOrdersPages - 3, totalOrdersPages - 2, totalOrdersPages - 1, totalOrdersPages];
    }

    return [1, '...', ordersPage - 1, ordersPage, ordersPage + 1, '...', totalOrdersPages];
  };

  const getOrderLineItems = (order) => {
    if (Array.isArray(order?.items)) return order.items;
    if (Array.isArray(order?.orderItems)) return order.orderItems;
    return [];
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim() || !profileForm.phone.trim()) {
      toast.error('Name, email and phone are required');
      return;
    }

    setProfileSaving(true);
    try {
      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      };

      const currentPasswordValue = profileForm.currentPassword.trim();
      const newPasswordValue = profileForm.newPassword.trim();

      if (currentPasswordValue || newPasswordValue) {
        payload.currentPassword = currentPasswordValue;
        payload.newPassword = newPasswordValue;
      }

      const { data } = await API.put('/auth/profile', payload);
      login(data);
      setProfileForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      toast.success('Profile information updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddressSave = (e) => {
    e.preventDefault();

    if (
      !addressForm.label.trim() ||
      !addressForm.city.trim() ||
      !addressForm.area.trim() ||
      !addressForm.address.trim() ||
      !addressForm.phone.trim()
    ) {
      toast.error('Please fill in all address fields');
      return;
    }

    if (editingAddressId) {
      setAddresses((prev) =>
        prev.map((item) =>
          item.id === editingAddressId ? { ...item, ...addressForm } : item
        )
      );
      toast.success('Address updated');
    } else {
      setAddresses((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...addressForm,
        },
      ]);
      toast.success('Address added');
    }

    setAddressForm(emptyAddressForm);
    setAddressModalOpen(false);
    setEditingAddressId(null);
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    toast.success('Address removed');
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
    showAddToCartSuccess(product.name);
  };

  const handleOrderAgain = () => {
    navigate('/products');
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleViewPaymentOrderDetails = async (payment) => {
    try {
      const cachedOrder = orders.find((order) => String(order?._id) === String(payment?._id));
      if (cachedOrder) {
        setSelectedOrder(cachedOrder);
        return;
      }

      const { data } = await API.get('/orders/myorders');
      const matchedOrder = Array.isArray(data)
        ? data.find((order) => String(order?._id) === String(payment?._id))
        : null;

      if (!matchedOrder) {
        toast.error('Order details not found');
        return;
      }

      setSelectedOrder(matchedOrder);
    } catch {
      toast.error('Failed to load order details');
    }
  };

  const startReviewEdit = (review) => {
    setEditingReviewId(review._id);
    setReviewDraft({
      rating: Number(review?.rating) || 5,
      comment: String(review?.comment || ''),
      image: String(review?.image || ''),
    });
  };

  const cancelReviewEdit = () => {
    setEditingReviewId(null);
    setReviewDraft({ rating: 5, comment: '', image: '' });
  };

  const handleReviewDraftImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReviewDraft((prev) => ({ ...prev, image: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateReview = async (review) => {
    const productId = review?.product?._id;
    if (!productId) {
      toast.error('Product information is missing for this review');
      return;
    }

    if (!String(reviewDraft.comment || '').trim()) {
      toast.error('Comment is required');
      return;
    }

    setReviewActionLoading(true);
    try {
      const { data } = await API.post(`/products/${productId}/reviews`, {
        rating: Number(reviewDraft.rating) || 5,
        comment: String(reviewDraft.comment || '').trim(),
        image: String(reviewDraft.image || '').trim(),
      });

      const updatedReview = data?.review || {};
      setMyReviews((prev) =>
        prev.map((item) =>
          item._id === review._id
            ? {
              ...item,
              ...updatedReview,
              product: item.product,
            }
            : item
        )
      );

      toast.success(data?.message || 'Review updated successfully');
      cancelReviewEdit();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleDeleteReview = async (review) => {
    const productId = review?.product?._id;
    if (!productId) {
      toast.error('Product information is missing for this review');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete this review?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setReviewActionLoading(true);
    try {
      const { data } = await API.delete(`/products/${productId}/reviews/me`);
      setMyReviews((prev) => prev.filter((item) => item._id !== review._id));
      toast.success(data?.message || 'Review deleted successfully');

      if (editingReviewId === review._id) {
        cancelReviewEdit();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleNavClick = (item) => {
    if (item.id === 'logout') {
      logout();
      return;
    }

    window.location.href = item.to;
  };

  const openAddAddress = () => {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
    setAddressModalOpen(true);
  };

  const openEditAddress = (item) => {
    setAddressForm({
      label: item.label || '',
      city: item.city || '',
      area: item.area || '',
      address: item.address || '',
      phone: item.phone || '',
    });
    setEditingAddressId(item.id);
    setAddressModalOpen(true);
  };

  const editingReview = useMemo(
    () => myReviews.find((item) => item._id === editingReviewId) || null,
    [myReviews, editingReviewId]
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-140px)] py-6 sm:py-8 dark:bg-gray-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:min-h-[620px]">
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 lg:pt-2">
              {navItems.map((item) => {
                const activeSectionId =
                  section === 'profile'
                    ? 'profile'
                    : section === 'orders'
                      ? 'orders'
                      : section === 'payments'
                        ? 'payments'
                      : section === 'reviews'
                        ? 'reviews'
                      : section === 'wishlist'
                        ? 'wishlist'
                        : 'address';
                const isActive = item.id === activeSectionId;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`flex min-w-max items-center gap-4 rounded-2xl px-4 py-4 text-left text-base font-medium transition-colors lg:min-w-0 lg:w-full ${
                      isActive
                        ? 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center justify-center text-current">
                      <Icon type={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="lg:col-span-9">
          {section === 'profile' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[460px]">
              <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Profile Information</h1>
              <form onSubmit={handleProfileSave} className="max-w-xl space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-16 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-700"
                      aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    >
                      {showCurrentPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-16 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-700"
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    >
                      {showNewPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="rounded-xl bg-[#2563eb] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {section === 'orders' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[460px]">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">My Orders</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track, review, and reorder from your latest purchases.</p>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {ORDER_FILTERS.map((filter) => {
                  const isActive = activeOrderFilter === filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveOrderFilter(filter)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-44 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {orders.length === 0 ? 'No orders yet.' : `No ${activeOrderFilter.toLowerCase()} orders found.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedOrders.map((order) => {
                    const normalizedStatus = normalizeOrderStatus(order.status);
                    const orderItems = Array.isArray(order.orderItems) ? order.orderItems.length : 0;
                    const deliveryText =
                      order?.shippingAddress?.city || order?.shippingAddress?.address || 'Standard Delivery';
                    const isPaid = isOrderPaid(order);

                    return (
                      <article
                        key={order._id}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#1a1a1a]"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Order ID: #{order._id}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getOrderBadgeClasses(normalizedStatus)}`}>
                            {normalizedStatus}
                          </span>
                        </div>

                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10m-13 8h16a1 1 0 001-1V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a1 1 0 001 1z" />
                              </svg>
                            </span>
                            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                              </svg>
                            </span>
                            <p>{orderItems} item(s)</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM1 1h4l2.68 12.39A2 2 0 009.64 15H19a2 2 0 001.95-1.57L23 6H6" />
                              </svg>
                            </span>
                            <p>{deliveryText}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a5 5 0 00-10 0v2m-2 0h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V10a1 1 0 011-1z" />
                              </svg>
                            </span>
                            <p>
                              Amount Payable: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(order.totalAmount)}</span>{' '}
                              <span className={isPaid ? 'text-teal-500' : 'text-amber-500'}>
                                ({isPaid ? 'Paid' : 'Unpaid'})
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => handleViewOrderDetails(order)}
                            className="rounded-xl border border-gray-300 bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:text-white"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOrderAgain(order)}
                            className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
                          >
                            Order Again
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  <div className="mt-2 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Page {ordersPage} of {totalOrdersPages}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOrdersPage((prev) => Math.max(1, prev - 1))}
                        disabled={ordersPage === 1}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      >
                        Prev
                      </button>

                      {getOrdersPageNumbers().map((item, index) => (
                        item === '...' ? (
                          <span key={`orders-ellipsis-${index}`} className="px-1 text-sm font-semibold text-gray-400 dark:text-gray-500">
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setOrdersPage(item)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                              ordersPage === item
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      ))}

                      <button
                        type="button"
                        onClick={() => setOrdersPage((prev) => Math.min(totalOrdersPages, prev + 1))}
                        disabled={ordersPage === totalOrdersPages}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'wishlist' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[620px]">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">Wishlist</h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your saved products are displayed here in the same card layout as Addresses.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563eb] dark:bg-gray-800 dark:text-blue-300">
                    {wishlistItems.length} item(s)
                  </span>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-[#1d4ed8]"
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
                  {paginatedWishlistItems.map((item) => (
                    <article key={item._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-50 dark:bg-gray-800">
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
                          className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-2 py-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        <p className="font-semibold text-[#2563eb]">{formatPrice(item.price)}</p>
                        <p className="line-clamp-3">Stored in your wishlist for quick access later.</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="text-sm font-medium text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
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

              {wishlistItems.length > 0 && (
                <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page {wishlistPage} of {totalWishlistPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWishlistPage((prev) => Math.max(1, prev - 1))}
                      disabled={wishlistPage === 1}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      Prev
                    </button>

                    {getWishlistPageNumbers().map((page, index) => (
                      page === '...'
                        ? (
                          <span key={`ellipsis-${index}`} className="px-1 text-sm text-gray-400">...</span>
                        )
                        : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setWishlistPage(page)}
                            className={`h-10 min-w-[40px] rounded-xl px-3 text-sm font-semibold transition-colors ${
                              wishlistPage === page
                                ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/20'
                                : 'border border-gray-200 bg-white text-gray-700 hover:border-[#2563eb] hover:text-[#2563eb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        )
                    ))}

                    <button
                      type="button"
                      onClick={() => setWishlistPage((prev) => Math.min(totalWishlistPages, prev + 1))}
                      disabled={wishlistPage === totalWishlistPages}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'payments' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[460px]">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">My Payments</h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">All your payment transactions are listed here.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563eb] dark:bg-gray-800 dark:text-blue-300">
                  {payments.length} transaction(s)
                </span>
              </div>

              {paymentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-center dark:border-gray-700 dark:bg-gray-900">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">No payments yet.</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Complete a purchase to see your payment history here.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Order ID</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Method</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Payment Status</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.slice((paymentsPage - 1) * PAYMENTS_ITEMS_PER_PAGE, paymentsPage * PAYMENTS_ITEMS_PER_PAGE).map((payment) => {
                          const paymentMethod = getPaymentMethodLabel(payment.paymentMethod);
                          const isPaid = payment.paymentStatus === 'Paid';
                          const isSuccess = payment.paymentVerificationStatus === 'Success';
                          const createdDate = new Date(payment.createdAt).toLocaleDateString();

                          return (
                            <tr
                              key={payment._id}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleViewPaymentOrderDetails(payment)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  handleViewPaymentOrderDetails(payment);
                                }
                              }}
                              className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-gray-800/50 dark:focus:bg-gray-800/50"
                            >
                              <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                                <span className="font-semibold text-[#2563eb]">
                                  #{String(payment._id || '').slice(-8).toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{formatPrice(payment.totalAmount)}</td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563eb] dark:bg-gray-800 dark:text-blue-300">
                                  {paymentMethod}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isSuccess ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                  {payment.paymentVerificationStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isPaid ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                  {isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{createdDate}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {payments.length > PAYMENTS_ITEMS_PER_PAGE && (
                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page {paymentsPage} of {Math.ceil(payments.length / PAYMENTS_ITEMS_PER_PAGE)}
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentsPage((prev) => Math.max(1, prev - 1))}
                          disabled={paymentsPage === 1}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentsPage((prev) => Math.min(Math.ceil(payments.length / PAYMENTS_ITEMS_PER_PAGE), prev + 1))}
                          disabled={paymentsPage === Math.ceil(payments.length / PAYMENTS_ITEMS_PER_PAGE)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {section === 'reviews' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[460px]">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">My Reviews</h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">All reviews you have submitted are listed here.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563eb] dark:bg-gray-800 dark:text-blue-300">
                  {myReviews.length} review(s)
                </span>
              </div>

              {myReviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-40 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              ) : myReviews.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-center dark:border-gray-700 dark:bg-gray-900">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">No reviews yet.</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">After purchasing products, your reviews will appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/60">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Product</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Rating</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Comment</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Image</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {paginatedMyReviews.map((review) => (
                            <tr key={review._id} className="align-top hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                              <td className="px-4 py-4">
                                {review?.product?._id ? (
                                  <Link
                                    to={`/product/${review.product._id}`}
                                    className="group inline-flex items-center gap-3"
                                  >
                                    <img
                                      src={review?.product?.image || 'https://placehold.co/64x64?text=?'}
                                      alt={review?.product?.name || 'Product'}
                                      className="h-10 w-10 rounded-lg object-cover"
                                      onError={(event) => {
                                        event.currentTarget.src = 'https://placehold.co/64x64?text=?';
                                      }}
                                    />
                                    <p className="font-semibold text-gray-900 transition-colors group-hover:text-[#2563eb] dark:text-white dark:group-hover:text-blue-300">
                                      {review?.product?.name || 'Product'}
                                    </p>
                                  </Link>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={review?.product?.image || 'https://placehold.co/64x64?text=?'}
                                      alt={review?.product?.name || 'Product'}
                                      className="h-10 w-10 rounded-lg object-cover"
                                      onError={(event) => {
                                        event.currentTarget.src = 'https://placehold.co/64x64?text=?';
                                      }}
                                    />
                                    <p className="font-semibold text-gray-900 dark:text-white">{review?.product?.name || 'Product'}</p>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  {Number(review?.rating || 0).toFixed(1)} / 5
                                </span>
                              </td>
                              <td className="px-4 py-4 max-w-md text-gray-600 dark:text-gray-300">
                                <p className="line-clamp-3 leading-6">{review?.comment || 'No comment'}</p>
                              </td>
                              <td className="px-4 py-4">
                                {review?.image ? (
                                  <img
                                    src={review.image}
                                    alt="Review"
                                    className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                    onError={(event) => {
                                      event.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">No image</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                                {review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={reviewActionLoading}
                                    onClick={() => startReviewEdit(review)}
                                    className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    disabled={reviewActionLoading}
                                    onClick={() => handleDeleteReview(review)}
                                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Page {myReviewsPage} of {totalMyReviewsPages}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMyReviewsPage((prev) => Math.max(1, prev - 1))}
                        disabled={myReviewsPage === 1}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      >
                        Prev
                      </button>

                      {getMyReviewsPageNumbers().map((page, index) => (
                        page === '...'
                          ? (
                            <span key={`reviews-ellipsis-${index}`} className="px-1 text-sm text-gray-400">...</span>
                          )
                          : (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setMyReviewsPage(page)}
                              className={`h-10 min-w-[40px] rounded-xl px-3 text-sm font-semibold transition-colors ${
                                myReviewsPage === page
                                  ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/20'
                                  : 'border border-gray-200 bg-white text-gray-700 hover:border-[#2563eb] hover:text-[#2563eb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          )
                      ))}

                      <button
                        type="button"
                        onClick={() => setMyReviewsPage((prev) => Math.min(totalMyReviewsPages, prev + 1))}
                        disabled={myReviewsPage === totalMyReviewsPages}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'addresses' && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 min-h-[620px]">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">Addresses</h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage your saved delivery locations in one place.</p>
                </div>
                <button
                  type="button"
                  onClick={openAddAddress}
                  className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-[#1d4ed8]"
                >
                  Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-center dark:border-gray-700 dark:bg-gray-900">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">No address added yet.</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click Add New Address to create one.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {addresses.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#2563eb] dark:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.label}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">{item.city || 'Address'}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEditAddress(item)}
                          className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-[#2563eb] hover:text-[#2563eb] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          Change
                        </button>
                      </div>

                      <div className="space-y-2 py-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                        <p>{item.phone}</p>
                        <p>{item.area}, {item.city}</p>
                        <p className="leading-7">{item.address}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => openEditAddress(item)}
                          className="text-sm font-medium text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
                        >
                          Edit Address
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(item.id)}
                          className="text-sm font-medium text-gray-500 transition-colors hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Make changes and save them immediately.</p>
              </div>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddressSave} className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <select
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'%3e%3c/path%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '20px',
                    paddingRight: '32px',
                  }}
                >
                  <option value="" disabled>
                    Select address type
                  </option>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Phone"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Area"
                  value={addressForm.area}
                  onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <textarea
                rows={5}
                placeholder="Full Address"
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                className="min-h-[170px] w-full rounded-[24px] border border-gray-200 bg-white px-4 py-3 text-sm leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-[#1d4ed8]"
                >
                  {editingAddressId ? 'Save Changes' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Review</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {editingReview?.product?.name || 'Product'}
                </p>
              </div>
              <button
                type="button"
                onClick={cancelReviewEdit}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Close review modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                <select
                  value={reviewDraft.rating}
                  onChange={(event) => setReviewDraft((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} Star{value > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Comment</label>
                <textarea
                  rows={4}
                  value={reviewDraft.comment}
                  onChange={(event) => setReviewDraft((prev) => ({ ...prev, comment: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReviewDraftImageChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                {reviewDraft.image ? (
                  <img
                    src={reviewDraft.image}
                    alt="Review preview"
                    className="mt-2 h-24 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                  />
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  disabled={reviewActionLoading}
                  onClick={() => handleUpdateReview(editingReview)}
                  className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {reviewActionLoading ? 'Saving...' : 'Update'}
                </button>
                <button
                  type="button"
                  disabled={reviewActionLoading}
                  onClick={cancelReviewEdit}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Order Details</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Order ID: #{selectedOrder._id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Close order details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getOrderBadgeClasses(normalizeOrderStatus(selectedOrder.status))}`}>
                    {normalizeOrderStatus(selectedOrder.status)}
                  </span>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Ordered On</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Amount</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(selectedOrder.totalAmount || 0)}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Payment</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{isOrderPaid(selectedOrder) ? 'Paid' : 'Unpaid'}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Method: <span className="font-semibold text-gray-700 dark:text-gray-200">{getPaymentMethodLabel(selectedOrder?.paymentMethod)}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer & Shipping</h3>
                  <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-semibold text-gray-900 dark:text-white">Customer:</span> {selectedOrder?.user?.name || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-900 dark:text-white">Email:</span> {selectedOrder?.user?.email || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-900 dark:text-white">Phone:</span> {selectedOrder?.shippingAddress?.phone || selectedOrder?.customer?.phone || user?.phone || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-900 dark:text-white">Address:</span> {selectedOrder?.shippingAddress?.address || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-900 dark:text-white">Area/City:</span> {selectedOrder?.shippingAddress?.city || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-900 dark:text-white">Postal Code:</span> {selectedOrder?.shippingAddress?.postalCode || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-900 dark:text-white">Country:</span> {selectedOrder?.shippingAddress?.country || 'N/A'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
                  <div className="mt-4 space-y-3">
                    {getOrderLineItems(selectedOrder).length > 0 ? (
                      getOrderLineItems(selectedOrder).map((item, index) => {
                        const itemName = item?.name || item?.product?.name || 'Product';
                        const itemImage = item?.image || item?.product?.image || 'https://placehold.co/64x64?text=?';
                        const itemPrice = Number(item?.price || item?.product?.price || 0);
                        const itemQty = Number(item?.quantity || item?.qty || 1);

                        return (
                          <div key={`${itemName}-${index}`} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 dark:border-gray-800">
                            <img
                              src={itemImage}
                              alt={itemName}
                              className="h-14 w-14 rounded-xl object-cover"
                              onError={(event) => {
                                event.currentTarget.src = 'https://placehold.co/64x64?text=?';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-gray-900 dark:text-white">{itemName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {itemQty}</p>
                            </div>
                            <p className="text-sm font-semibold text-teal-600 dark:text-teal-300">
                              {formatPrice(itemPrice * itemQty)}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No item details available.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-[#1d4ed8]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccount;

