import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

const statusBadgeMap = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Failed: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  'Refund Requested': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const paymentBadgeMap = {
  Unpaid: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Partial: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  Paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data || null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load order details');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="h-56 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <p className="text-lg font-semibold">Order not found</p>
        <button
          type="button"
          onClick={() => navigate('/admin/orders')}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const items = Array.isArray(order?.items) ? order.items : [];
  const statusClass = statusBadgeMap[order.status] || statusBadgeMap.Pending;
  const paymentClass = paymentBadgeMap[order.paymentStatus] || paymentBadgeMap.Unpaid;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white">Order Details</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Who ordered, when ordered, and what was ordered.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/orders')}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          Back to Orders
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Order ID</p>
          <p className="mt-1 font-mono text-sm font-semibold text-gray-800 dark:text-gray-100 break-all">{order._id}</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Placed At</p>
          <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Customer</p>
          <p className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-100">{order?.user?.name || order?.customer?.name || 'N/A'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{order?.user?.email || order?.customer?.email || 'N/A'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{order?.shippingAddress?.phone || order?.user?.phone || 'N/A'}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Payment</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
              {order.status}
            </span>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentClass}`}>
              {order.paymentStatus || 'Unpaid'}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Amount Paid: {formatPrice(Number(order?.amountPaid) || 0)}</p>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">Total: {formatPrice(Number(order?.totalAmount) || 0)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Shipping Address</p>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
          {order?.shippingAddress?.address || 'N/A'}, {order?.shippingAddress?.city || 'N/A'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {order?.shippingAddress?.postalCode || ''} {order?.shippingAddress?.country || ''}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/60">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Product</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Brand</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Unit Price</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item, index) => (
                <tr key={`${item?._id || item?.product?._id || 'item'}-${index}`}>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{item?.name || item?.product?.name || 'Product'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item?.product?.brand || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{Number(item?.quantity) || 1}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{formatPrice(Number(item?.price) || 0)}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-300">
                    {formatPrice((Number(item?.price) || 0) * (Number(item?.quantity) || 1))}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No items found for this order.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
