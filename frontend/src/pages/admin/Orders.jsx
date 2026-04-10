import { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';
import Swal from 'sweetalert2';

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

const csvEscape = (value) => {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getStatIcon = (type) => {
  if (type === 'total' || type === 'processing') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    );
  }

  if (type === 'pending') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-2.21 0-4 1.79-4 4m8 0a4 4 0 00-4-4m0 0V4m0 4v4m0 4h.01M7 16.5A6.5 6.5 0 1118.5 7" />
      </svg>
    );
  }

  if (type === 'shipped') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17h6m-8 0h.01M17 17h.01M3 7h11v7H3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 10h3l3 3v1h-6zM5 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
      </svg>
    );
  }

  if (type === 'delivered') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 15l2 2 4-4" />
      </svg>
    );
  }

  if (type === 'cancel' || type === 'failed') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 9l6 6m0-6l-6 6" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17h6m-8 0h.01M17 17h.01M5 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h11v7H3zm11 3h3l3 3v1h-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 4h8" />
    </svg>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
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

  const orderStats = useMemo(() => {
    const countBy = (statuses) =>
      orders.filter((order) =>
        statuses.some((status) => String(order?.status || '').toLowerCase() === status.toLowerCase())
      ).length;

    return {
      total: orders.length,
      pending: countBy(['Pending']),
      processing: countBy(['Processing']),
      shipped: countBy(['Shipped']),
      delivered: countBy(['Delivered']),
      cancel: countBy(['Cancelled', 'Canceled']),
      returned: countBy(['Returned']),
      failed: countBy(['Failed']),
    };
  }, [orders]);

  const statCards = [
    { key: 'total', label: 'Total Order', value: orderStats.total, bg: 'bg-[#a8bfdf] dark:bg-[#50688a]' },
    { key: 'pending', label: 'Pending Payment', value: orderStats.pending, bg: 'bg-[#ece39a] dark:bg-[#7f7544]' },
    { key: 'processing', label: 'Processing', value: orderStats.processing, bg: 'bg-[#a8d4d6] dark:bg-[#3f787a]' },
    { key: 'shipped', label: 'Shipped', value: orderStats.shipped, bg: 'bg-[#ecc8ab] dark:bg-[#886046]' },
    { key: 'delivered', label: 'Delivered', value: orderStats.delivered, bg: 'bg-[#e7d1e2] dark:bg-[#77586f]' },
    { key: 'cancel', label: 'Cancel', value: orderStats.cancel, bg: 'bg-[#efcb90] dark:bg-[#86602f]' },
    { key: 'returned', label: 'Returned', value: orderStats.returned, bg: 'bg-[#b5dc9f] dark:bg-[#52733f]' },
    { key: 'failed', label: 'Failed', value: orderStats.failed, bg: 'bg-[#b3d6e6] dark:bg-[#4a6f82]' },
  ];

  const handleExport = () => {
    const rows = filteredOrders;

    if (rows.length === 0) {
      toast.error('No orders available to export');
      return;
    }

    const headers = [
      'Order ID',
      'Order Date',
      'Order Time',
      'Customer Name',
      'Customer Email',
      'Status',
      'Total Amount',
      'Delivery City',
      'Shipping Address',
      'Phone',
      'Item Count',
      'Items',
    ];

    const lines = rows.map((order) => {
      const orderedAt = new Date(order.createdAt);
      const items = Array.isArray(order?.items) ? order.items : [];
      const itemSummary = items
        .map((item) => `${item?.name || item?.product?.name || 'Product'} x${Number(item?.quantity) || 1}`)
        .join(' | ');

      return [
        order._id,
        orderedAt.toLocaleDateString(),
        orderedAt.toLocaleTimeString(),
        order?.user?.name || 'N/A',
        order?.user?.email || 'N/A',
        order?.status || 'N/A',
        Number(order?.totalAmount) || 0,
        order?.shippingAddress?.city || 'N/A',
        order?.shippingAddress?.address || 'N/A',
        order?.shippingAddress?.phone || 'N/A',
        items.length,
        itemSummary,
      ]
        .map(csvEscape)
        .join(',');
    });

    const csvContent = [headers.map(csvEscape).join(','), ...lines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    link.href = url;
    link.download = `orders-export-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
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
      setExpandedOrderId((prev) => (prev === orderId ? null : prev));
      toast.success(data?.message || 'Order deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeletingId(null);
    }
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
          <h2 className="text-3xl font-black tracking-tight text-gray-800 dark:text-white">Total Orders</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage and track all incoming customer orders.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-full bg-[#0f8f84] px-6 py-2.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#117b72]"
        >
          Export
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.key} className={`rounded-2xl p-4 ${card.bg}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/80">
                {getStatIcon(card.key)}
              </div>
              <div>
                <p className="text-[1.75rem] leading-none font-black text-slate-900">{card.value}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-slate-700">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Revenue</p>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-300">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by customer, order ID, city, item"
          className="w-full max-w-sm rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
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

                    <button
                      type="button"
                      disabled={deletingId === order._id}
                      onClick={() => handleDeleteOrder(order._id)}
                      className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
                    >
                      {deletingId === order._id ? 'Deleting...' : 'Delete'}
                    </button>
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
