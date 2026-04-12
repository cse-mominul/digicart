import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { formatPrice } from '../../utils/formatPrice';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
} from 'recharts';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const chartFilters = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'sixMonths', label: '6 Months' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const buildDailySeries = (orders, { days, bucketSizeDays, labelMode }) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const rangeEnd = todayStart.getTime() + DAY_MS;
  const rangeStart = rangeEnd - (days * DAY_MS);
  const bucketCount = Math.ceil(days / bucketSizeDays);
  const series = [];

  for (let i = 0; i < bucketCount; i += 1) {
    const bucketStartMs = rangeStart + (i * bucketSizeDays * DAY_MS);
    const bucketEndMs = Math.min(rangeEnd, bucketStartMs + (bucketSizeDays * DAY_MS));
    const bucketStart = new Date(bucketStartMs);
    const bucketEnd = new Date(bucketEndMs - 1);

    let label = bucketStart.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    if (labelMode === 'weekday') {
      label = bucketStart.toLocaleString('en-US', { weekday: 'short' });
    }

    if (labelMode === 'range') {
      label = `${bucketStart.getDate()}-${bucketEnd.getDate()}`;
    }

    series.push({
      key: `${bucketStartMs}-${bucketEndMs}`,
      label,
      from: bucketStart,
      to: bucketEnd,
      revenue: 0,
      orders: 0,
      startMs: bucketStartMs,
      endMs: bucketEndMs,
    });
  }

  (orders || []).forEach((order) => {
    const orderTime = new Date(order.createdAt).getTime();
    if (Number.isNaN(orderTime) || orderTime < rangeStart || orderTime >= rangeEnd) return;

    const index = Math.floor((orderTime - rangeStart) / (bucketSizeDays * DAY_MS));
    const safeIndex = Math.min(series.length - 1, Math.max(0, index));
    const bucket = series[safeIndex];
    if (!bucket) return;

    bucket.revenue += Number(order.totalAmount) || 0;
    bucket.orders += 1;
  });

  return series;
};

const buildSixMonthSeries = (orders) => {
  const now = new Date();
  const buckets = [];

  for (let i = 5; i >= 0; i -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

    buckets.push({
      key,
      label: monthStart.toLocaleString('en-US', { month: 'short' }),
      from: monthStart,
      to: new Date(monthEnd.getTime() - 1),
      revenue: 0,
      orders: 0,
      startMs: monthStart.getTime(),
      endMs: monthEnd.getTime(),
    });
  }

  const map = new Map(buckets.map((item) => [item.key, item]));

  (orders || []).forEach((order) => {
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = map.get(key);
    if (!bucket) return;

    bucket.revenue += Number(order.totalAmount) || 0;
    bucket.orders += 1;
  });

  return buckets;
};

const formatCompactNumber = (value) => {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
};

const TopMetricCard = ({ title, value, trendText, trendUp, bgClass, onClick, clickable = false, compact = false }) => (
  <div
    role={clickable ? 'button' : undefined}
    tabIndex={clickable ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(event) => {
      if (!clickable) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.();
      }
    }}
    className={`rounded-xl shadow-sm ${bgClass} ${compact ? 'p-2.5' : 'p-3'} ${clickable ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''}`}
  >
    <h3 className={`${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-medium text-slate-700`}>{title}</h3>
    <div className={`${compact ? 'mt-1.5' : 'mt-2'} flex items-end gap-1.5`}>
      <div className={`${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} leading-none font-semibold text-slate-900`}>{value}</div>
      <span className={`mb-0.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] sm:text-xs font-semibold ${trendUp ? 'text-teal-700' : 'text-rose-700'}`}>
        {trendText}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {trendUp ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 17l10-10M10 7h7v7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 7l10 10m0-7v7h-7" />
          )}
        </svg>
      </span>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [abandonedStats, setAbandonedStats] = useState({ abandonedUsers: 0, abandonedItems: 0 });
  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState('sixMonths');
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);

  const statusCounts = useMemo(() => {
    return orders.reduce((acc, order) => {
      const status = String(order.status || '').toLowerCase();
      if (status === 'pending') acc.pending += 1;
      if (status === 'processing') acc.processing += 1;
      if (status === 'cancelled') acc.cancelled += 1;
      if (status === 'failed') acc.failed += 1;
      if (status === 'refund requested') acc.refundRequested += 1;
      return acc;
    }, { pending: 0, processing: 0, cancelled: 0, failed: 0, refundRequested: 0 });
  }, [orders]);

  const topCards = useMemo(() => {
    const shippingDelays = statusCounts.pending + statusCounts.processing;
    const refundRequests = statusCounts.refundRequested;
    const paymentFailures = statusCounts.failed;
    const abandonedCarts = abandonedStats.abandonedUsers;

    return [
      { title: 'Total Sales', value: formatPrice(stats.revenue), trendText: '+0.1%', trendUp: true, bgClass: 'bg-[#b6dcde]' },
      { title: 'Total Orders', value: formatCompactNumber(stats.orders), trendText: '-0.1%', trendUp: false, bgClass: 'bg-[#efe59a]' },
      { title: 'Total Customers', value: formatCompactNumber(stats.users), trendText: '+0.1%', trendUp: true, bgClass: 'bg-[#f2d0b4]' },
      { title: 'Shipping Delays', value: formatCompactNumber(shippingDelays), trendText: '-0.1%', trendUp: false, bgClass: 'bg-[#e9d3e6]' },
      { title: 'Refund Requests', value: formatCompactNumber(refundRequests), trendText: '+0.1%', trendUp: true, bgClass: 'bg-[#b2c9e8]' },
      { title: 'Stock Products', value: formatCompactNumber(stats.products), trendText: '-0.1%', trendUp: false, bgClass: 'bg-[#f2d398]' },
      { title: 'Abandoned Carts', value: formatCompactNumber(abandonedCarts), trendText: '+0.1%', trendUp: true, bgClass: 'bg-[#b7de9f]' },
      { title: 'Payment Failures', value: formatCompactNumber(paymentFailures), trendText: '-0.1%', trendUp: false, bgClass: 'bg-[#a8d0ea]' },
    ];
  }, [stats, statusCounts, abandonedStats.abandonedUsers]);

  const chartSeries = useMemo(() => {
    if (chartRange === 'weekly') {
      return buildDailySeries(orders, { days: 7, bucketSizeDays: 1, labelMode: 'weekday' });
    }

    if (chartRange === 'monthly') {
      return buildDailySeries(orders, { days: 30, bucketSizeDays: 5, labelMode: 'range' });
    }

    return buildSixMonthSeries(orders);
  }, [orders, chartRange]);

  const chartData = useMemo(
    () => chartSeries.map((item) => ({
      ...item,
      revenue: Number(item.revenue) || 0,
      orders: Number(item.orders) || 0,
    })),
    [chartSeries]
  );

  const selectedPoint = chartSeries[selectedPointIndex] || null;

  useEffect(() => {
    setSelectedPointIndex(chartSeries.length ? chartSeries.length - 1 : null);
  }, [chartRange, chartSeries.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, usersRes, abandonedRes] = await Promise.all([
          API.get('/products'),
          API.get('/orders'),
          API.get('/admin/users'),
          API.get('/admin/abandoned-carts'),
        ]);

        const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const revenue = allOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

        setOrders(allOrders);
        setStats({
          products: productsRes.data.length,
          orders: allOrders.length,
          users: usersRes.data.length,
          revenue,
        });
        setAbandonedStats({
          abandonedUsers: Number(abandonedRes?.data?.abandonedUsers) || 0,
          abandonedItems: Number(abandonedRes?.data?.abandonedItems) || 0,
        });
        setRecentOrders(allOrders.slice(0, 5));
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>

      {loading ? (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-22 rounded-xl bg-white dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {topCards.map((card) => (
              <TopMetricCard
                key={card.title}
                title={card.title}
                value={card.value}
                trendText={card.trendText}
                trendUp={card.trendUp}
                bgClass={card.bgClass}
                compact={card.title === 'Total Orders'}
                clickable={card.title === 'Abandoned Carts' || card.title === 'Stock Products' || card.title === 'Total Customers' || card.title === 'Total Orders' || card.title === 'Shipping Delays' || card.title === 'Payment Failures' || card.title === 'Refund Requests'}
                onClick={
                  card.title === 'Abandoned Carts'
                    ? () => navigate('/admin/abandoned-carts')
                    : card.title === 'Stock Products'
                      ? () => navigate('/admin/products')
                      : card.title === 'Refund Requests'
                        ? () => navigate('/admin/refund-requests')
                      : card.title === 'Payment Failures'
                        ? () => navigate('/admin/payment-failures')
                      : card.title === 'Shipping Delays'
                        ? () => navigate('/admin/shipping-delays')
                      : card.title === 'Total Orders'
                        ? () => navigate('/admin/orders')
                      : card.title === 'Total Customers'
                        ? () => navigate('/admin/customers')
                      : undefined
                }
              />
            ))}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-xl bg-white p-4 shadow-md dark:bg-gray-800">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">Sales Trend</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Revenue line + order volume bars (click a bar to pin values)</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {chartFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setChartRange(filter.key)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        chartRange === filter.key
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}

                  <div className="ml-2 flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" /> Revenue
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Orders
                    </span>
                  </div>
                </div>
              </div>

              {selectedPoint && (
                <div className="mb-3 grid grid-cols-1 gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-2.5 sm:grid-cols-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Selected Period</p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{selectedPoint.label}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Revenue</p>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">{formatPrice(selectedPoint.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Orders</p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">{selectedPoint.orders}</p>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
                        onClick={(state) => {
                          if (typeof state?.activeTooltipIndex === 'number') {
                            setSelectedPointIndex(state.activeTooltipIndex);
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
                        <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} />
                        <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 10 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 10 }} />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === 'revenue') return [formatPrice(Number(value) || 0), 'Revenue'];
                            return [Number(value) || 0, 'Orders'];
                          }}
                          labelFormatter={(label) => `Period: ${label}`}
                          contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }}
                        />
                        <Bar yAxisId="right" dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} barSize={22} />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#6366f1"
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-md dark:bg-gray-800">
              <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-white">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-left">
                      <th className="py-1.5 pr-3">Order ID</th>
                      <th className="py-1.5 pr-3">Customer</th>
                      <th className="py-1.5 pr-3">Amount</th>
                      <th className="py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-2 pr-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                          {order.user?.name || 'N/A'}
                        </td>
                        <td className="py-2 pr-3 font-semibold text-indigo-600">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-2">
                          <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">No orders yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
