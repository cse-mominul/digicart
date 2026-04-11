import { useEffect, useMemo, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

const ITEMS_PER_PAGE = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

const ShippingDelays = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders');
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load delayed shipments');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const delayedOrders = useMemo(() => {
    const blockedStatuses = ['delivered', 'cancelled', 'canceled', 'returned', 'failed'];
    const now = Date.now();
    const q = search.trim().toLowerCase();

    return orders
      .filter((order) => {
        const status = String(order?.status || '').toLowerCase();
        if (blockedStatuses.includes(status)) return false;

        const createdMs = new Date(order?.createdAt || 0).getTime();
        if (!createdMs) return false;

        const ageDays = Math.floor((now - createdMs) / DAY_MS);
        if (ageDays <= 3) return false;

        if (!q) return true;

        const orderIdText = String(order?._id || '').toLowerCase();
        const userText = `${order?.user?.name || ''} ${order?.user?.email || ''}`.toLowerCase();
        const cityText = String(order?.shippingAddress?.city || '').toLowerCase();
        const phoneText = String(order?.shippingAddress?.phone || '').toLowerCase();

        return (
          orderIdText.includes(q) ||
          userText.includes(q) ||
          cityText.includes(q) ||
          phoneText.includes(q)
        );
      })
      .map((order) => {
        const createdMs = new Date(order.createdAt).getTime();
        const delayDays = Math.floor((Date.now() - createdMs) / DAY_MS);
        return { ...order, delayDays };
      })
      .sort((a, b) => b.delayDays - a.delayDays);
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(delayedOrders.length / ITEMS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return delayedOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [delayedOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Shipping Delays</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Orders older than 3 days that are not delivered/cancelled.
          </p>
        </div>
        <div className="rounded-xl bg-orange-100 px-3 py-2 text-sm font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          Delayed Orders: {delayedOrders.length}
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order ID, customer, city, phone"
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
                  <th className="px-4 py-3">Delay</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Amount</th>
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
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{order?.status || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {order.delayDays} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{order?.shippingAddress?.city || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-300">{formatPrice(order?.totalAmount || 0)}</td>
                  </tr>
                ))}

                {delayedOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No shipping delays found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {delayedOrders.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, delayedOrders.length)} of {delayedOrders.length}
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

export default ShippingDelays;
