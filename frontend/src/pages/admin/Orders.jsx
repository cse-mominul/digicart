import { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const FILTER_OPTIONS = ['All', ...STATUS_OPTIONS];
const ITEMS_PER_PAGE = 7;

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders');
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: data.status } : o)));
      toast.success('Order status updated!');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatch = activeFilter === 'All' || order.status === activeFilter;
      if (!statusMatch) return false;

      if (!q) return true;

      const orderIdText = String(order?._id || '').toLowerCase();
      const userText = `${order?.user?.name || ''} ${order?.user?.email || ''}`.toLowerCase();
      const cityText = String(order?.shippingAddress?.city || '').toLowerCase();
      const itemText = (order?.items || [])
        .map((item) => `${item?.name || ''} ${item?.product?.name || ''}`)
        .join(' ')
        .toLowerCase();

      return (
        orderIdText.includes(q) ||
        userText.includes(q) ||
        cityText.includes(q) ||
        itemText.includes(q)
      );
    });
  }, [orders, activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedOrderId(null);
  }, [activeFilter, search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + (Number(order?.totalAmount) || 0), 0),
    [orders]
  );

  const deliveredCount = useMemo(
    () => orders.filter((order) => order.status === 'Delivered').length,
    [orders]
  );

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'Pending').length,
    [orders]
  );

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Order Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage and track all incoming customer orders.</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by customer, order ID, city, item"
          className="w-full max-w-sm rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Pending</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-300">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Delivered</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-300">{deliveredCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-300">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
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

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-48 rounded-2xl bg-white dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          {orders.length === 0 ? 'No orders found.' : 'No matching orders for this filter/search.'}
        </div>
      ) : (
        <div className="space-y-5">
          {paginatedOrders.map((order) => {
            const items = Array.isArray(order?.items) ? order.items : [];
            const isExpanded = expandedOrderId === order._id;

            return (
              <article
                key={order._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#1a1a1a]"
              >
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 dark:border-gray-700 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                    <p className="font-mono text-sm font-semibold text-gray-800 dark:text-white">#{order._id}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{order?.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order?.user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{items.length} item(s)</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Delivery City</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{order?.shippingAddress?.city || 'N/A'}</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">{formatPrice(order.totalAmount)}</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Status:</label>
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(order._id)}
                    className="rounded-xl border border-gray-300 bg-transparent px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:text-white"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-white px-3 py-3 dark:bg-gray-800">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Ordered By</p>
                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{order?.user?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order?.user?.email || 'N/A'}</p>
                      </div>

                      <div className="rounded-lg bg-white px-3 py-3 dark:bg-gray-800">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Ordered At</p>
                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Shipping Address</p>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                        {order?.shippingAddress?.address || 'N/A'}, {order?.shippingAddress?.city || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order?.shippingAddress?.postalCode || ''} {order?.shippingAddress?.country || ''}
                      </p>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        Phone: {order?.shippingAddress?.phone || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Ordered Items</p>
                      <div className="mt-2 space-y-2">
                        {items.map((item, idx) => (
                          <div key={`${order._id}-${idx}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm dark:bg-gray-800">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100">{item?.name || item?.product?.name || 'Product'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item?.quantity || 1}</p>
                            </div>
                            <p className="font-semibold text-gray-700 dark:text-gray-200">{formatPrice((Number(item?.price) || 0) * (Number(item?.quantity) || 1))}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {filteredOrders.length > ITEMS_PER_PAGE && (
            <div className="mt-2 flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  Prev
                </button>

                {pageItems.map((item, index) => (
                  item === '...' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 text-sm font-semibold text-gray-400 dark:text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCurrentPage(item)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                        currentPage === item
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
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
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
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

export default Orders;
