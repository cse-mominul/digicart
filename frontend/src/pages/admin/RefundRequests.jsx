import { useEffect, useMemo, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';
import Swal from 'sweetalert2';

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Failed', 'Refund Requested'];

const RefundRequests = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders');
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load refund requests');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = String(order?.status || '').toLowerCase();
      if (status !== 'refund requested') return false;

      if (!q) return true;

      const orderIdText = String(order?._id || '').toLowerCase();
      const userText = `${order?.user?.name || ''} ${order?.user?.email || ''}`.toLowerCase();
      const cityText = String(order?.shippingAddress?.city || '').toLowerCase();

      return orderIdText.includes(q) || userText.includes(q) || cityText.includes(q);
    });
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleStatusChange = async (orderId, status) => {
    const result = await Swal.fire({
      title: 'Update order status?',
      text: `Change status to ${status}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setUpdatingId(orderId);
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status: data.status } : order)));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Delete this order?',
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

    setDeletingId(orderId);
    try {
      const { data } = await API.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      toast.success(data?.message || 'Order deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Refund Requests</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Orders where customers requested a refund.
          </p>
        </div>
        <div className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          Requests: {filteredOrders.length}
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order ID, customer or city"
          className="w-full max-w-sm rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="h-56 rounded-2xl bg-white shadow-sm animate-pulse dark:bg-gray-800" />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order._id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">#{String(order._id || '').slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      <p className="font-medium">{order?.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order?.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        {order?.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-300">{formatPrice(order?.totalAmount || 0)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{order?.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{order?.shippingAddress?.city || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status || 'Refund Requested'}
                          onChange={(event) => handleStatusChange(order._id, event.target.value)}
                          disabled={updatingId === order._id || deletingId === order._id}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={updatingId === order._id || deletingId === order._id}
                          className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === order._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No refund requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
                >
                  Prev
                </button>
                <span className="min-w-[68px] text-center font-medium text-gray-700 dark:text-gray-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RefundRequests;
