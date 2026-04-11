import { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import { formatPrice } from '../../utils/formatPrice';

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

const TopMetricCard = ({ title, value, trendText, trendUp, bgClass }) => (
  <div className={`rounded-2xl p-4 shadow-sm ${bgClass}`}>
    <h3 className="text-lg sm:text-xl font-medium text-slate-700">{title}</h3>
    <div className="mt-2.5 flex items-end gap-2">
      <div className="text-base sm:text-lg leading-none font-semibold text-slate-900">{value}</div>
      <span className={`mb-0.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs sm:text-sm font-semibold ${trendUp ? 'text-teal-700' : 'text-rose-700'}`}>
        {trendText}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
      return acc;
    }, { pending: 0, processing: 0, cancelled: 0 });
  }, [orders]);

  const topCards = useMemo(() => {
    const shippingDelays = statusCounts.pending + statusCounts.processing;
    const refundRequests = statusCounts.cancelled;
    const paymentFailures = Math.max(statusCounts.cancelled, Math.round(stats.orders * 0.03));
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

  const selectedPoint = chartSeries[selectedPointIndex] || null;
  const maxRevenue = Math.max(...chartSeries.map((item) => item.revenue), 1);
  const maxOrders = Math.max(...chartSeries.map((item) => item.orders), 1);
  const linePoints = chartSeries
    .map((item, index) => {
      const x = 60 + (index * (620 / Math.max(1, chartSeries.length - 1)));
      const y = 170 - ((item.revenue / maxRevenue) * 120);
      return `${x},${y}`;
    })
    .join(' ');

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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-7">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {topCards.map((card) => (
              <TopMetricCard
                key={card.title}
                title={card.title}
                value={card.value}
                trendText={card.trendText}
                trendUp={card.trendUp}
                bgClass={card.bgClass}
              />
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sales Trend</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue line + order volume bars (click a bar to pin values)</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {chartFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setChartRange(filter.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      chartRange === filter.key
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}

                <div className="ml-2 flex items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Revenue
                  </span>
                  <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Orders
                  </span>
                </div>
              </div>
            </div>

            {selectedPoint && (
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Selected Period</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedPoint.label}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">{formatPrice(selectedPoint.revenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{selectedPoint.orders}</p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <svg viewBox="0 0 700 230" className="h-[230px] w-full">
                  {[0, 1, 2, 3].map((step) => {
                    const y = 50 + (step * 40);
                    return (
                      <line
                        key={`grid-${step}`}
                        x1="50"
                        y1={y}
                        x2="680"
                        y2={y}
                        stroke="currentColor"
                        className="text-gray-200 dark:text-gray-700"
                      />
                    );
                  })}

                  {chartSeries.map((item, index) => {
                    const x = 60 + (index * (620 / Math.max(1, chartSeries.length - 1)));
                    const barHeight = (item.orders / maxOrders) * 80;
                    const isSelected = selectedPointIndex === index;
                    return (
                      <g
                        key={item.key}
                        onClick={() => setSelectedPointIndex(index)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={x - 12}
                          y={180 - barHeight}
                          width="24"
                          height={barHeight}
                          rx="6"
                          className={isSelected ? 'fill-emerald-500' : 'fill-emerald-500/70'}
                        />
                        <text
                          x={x}
                          y="212"
                          textAnchor="middle"
                          className="fill-gray-500 text-[10px] dark:fill-gray-400"
                        >
                          {item.label}
                        </text>
                      </g>
                    );
                  })}

                  <polyline
                    fill="none"
                    points={linePoints}
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-indigo-500"
                  />

                  {chartSeries.map((item, index) => {
                    const x = 60 + (index * (620 / Math.max(1, chartSeries.length - 1)));
                    const y = 170 - ((item.revenue / maxRevenue) * 120);
                    const isSelected = selectedPointIndex === index;
                    return (
                      <circle
                        key={`dot-${item.key}`}
                        cx={x}
                        cy={y}
                        r={isSelected ? '6' : '4.5'}
                        className={isSelected ? 'fill-indigo-600' : 'fill-indigo-500'}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-left">
                    <th className="py-2 pr-4">Order ID</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 pr-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                        {order.user?.name || 'N/A'}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-indigo-600">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
