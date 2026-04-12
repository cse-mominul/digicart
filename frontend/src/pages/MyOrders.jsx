import { useState, useEffect, useMemo } from 'react';
import API from '../api/axios';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';

const ORDERS_PER_PAGE = 5;

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const isSuccessfulOrder = (status) => {
  const normalized = String(status || '').toLowerCase();
  return normalized === 'delivered' || normalized === 'completed';
};

const getOrderItemProductId = (item) => {
  if (typeof item?.product === 'string') return item.product;
  if (item?.product?._id) return item.product._id;
  return '';
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewModal, setReviewModal] = useState({
    open: false,
    orderId: '',
    productId: '',
    productName: '',
    productImage: '',
    rating: 5,
    comment: '',
    image: '',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/myorders');
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    return orders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [orders, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  const openReviewModal = async (order, item) => {
    if (!isSuccessfulOrder(order?.status)) {
      toast.error('You can review only after successful delivery');
      return;
    }

    const productId = getOrderItemProductId(item);
    if (!productId) {
      toast.error('Unable to find product information for review');
      return;
    }

    const basePayload = {
      open: true,
      orderId: order._id,
      productId,
      productName: item?.name || item?.product?.name || 'Product',
      productImage: item?.image || item?.product?.image || 'https://placehold.co/80x80?text=?',
      rating: 5,
      comment: '',
      image: '',
    };

    setReviewModal(basePayload);
    setReviewLoading(true);
    try {
      const { data } = await API.get(`/products/${productId}/reviews`);
      const existing = data?.currentUserReview;
      if (existing) {
        setReviewModal((prev) => ({
          ...prev,
          rating: Number(existing.rating) || 5,
          comment: existing.comment || '',
          image: existing.image || '',
        }));
      }
    } catch {
      // Keep modal open with default empty review form.
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReviewModal = () => {
    setReviewModal({
      open: false,
      orderId: '',
      productId: '',
      productName: '',
      productImage: '',
      rating: 5,
      comment: '',
      image: '',
    });
  };

  const handleReviewImageChange = (event) => {
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
      setReviewModal((prev) => ({ ...prev, image: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!reviewModal.productId) {
      toast.error('Product not found for review');
      return;
    }

    if (!String(reviewModal.comment || '').trim()) {
      toast.error('Please write your review comment');
      return;
    }

    setReviewSubmitting(true);
    try {
      await API.post(`/products/${reviewModal.productId}/reviews`, {
        rating: Number(reviewModal.rating) || 5,
        comment: String(reviewModal.comment || '').trim(),
        image: String(reviewModal.image || '').trim(),
      });

      toast.success('Review submitted successfully');
      closeReviewModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md h-40 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-xl font-medium">No orders yet</p>
          <p className="text-sm mt-1">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                  <p className="font-mono text-sm text-gray-700">{order._id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => { e.target.src = 'https://placehold.co/48x48?text=?'; }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} &times; {formatPrice(item.price)}
                      </p>
                    </div>
                    </div>

                    <button
                      type="button"
                      disabled={!isSuccessfulOrder(order.status)}
                      onClick={() => openReviewModal(order, item)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center border-t pt-4 flex-wrap gap-2">
                <p className="text-sm text-gray-500">
                  Ordered on {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="font-bold text-indigo-600 text-lg">
                  Total: {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
          ))}

          <div className="mt-2 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              {pageItems.map((item, index) => (
                item === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-1 text-sm font-semibold text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                      currentPage === item
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {item}
                  </button>
                )
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Write Review</h2>
              <button
                type="button"
                onClick={closeReviewModal}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <img
                src={reviewModal.productImage}
                alt={reviewModal.productName}
                className="h-14 w-14 rounded-lg object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/56x56?text=?'; }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{reviewModal.productName}</p>
                <p className="text-xs text-gray-500">Order: #{reviewModal.orderId}</p>
              </div>
            </div>

            {reviewLoading ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">Loading review details...</div>
            ) : (
              <form onSubmit={submitReview} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Rating</label>
                  <select
                    value={reviewModal.rating}
                    onChange={(e) => setReviewModal((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>{value} Star{value > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Comment</label>
                  <textarea
                    rows={4}
                    value={reviewModal.comment}
                    onChange={(e) => setReviewModal((prev) => ({ ...prev, comment: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Share your experience"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Upload Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReviewImageChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  {reviewModal.image && (
                    <img
                      src={reviewModal.image}
                      alt="Review upload preview"
                      className="mt-2 h-24 w-24 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

