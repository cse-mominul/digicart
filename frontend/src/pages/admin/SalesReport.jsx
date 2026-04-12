import { useEffect, useMemo, useState } from 'react';
import API from '../../api/axios';
import { formatPrice } from '../../utils/formatPrice';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Line,
  Bar,
} from 'recharts';

const DAY_MS = 24 * 60 * 60 * 1000;

const getStartOfDayMs = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return NaN;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
};

const getEndOfDayMs = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return NaN;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
};

const compactNumber = (value) => {
  const safe = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(safe);
};

const monthShort = (date) => date.toLocaleString('en-US', { month: 'short' });

const isRefundOrder = (order) => {
  const status = String(order?.status || '').toLowerCase();
  return status === 'refund requested' || status === 'cancelled';
};

const isSalesOrder = (order) => {
  const status = String(order?.status || '').toLowerCase();
  return status !== 'cancelled' && status !== 'failed' && status !== 'refund requested';
};

const SalesReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryRange, setSummaryRange] = useState('monthly');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await API.get('/orders');
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const rangeFilteredOrders = useMemo(() => {
    const nowMs = Date.now();
    let rangeStartMs = nowMs - (30 * DAY_MS);
    let rangeEndMs = nowMs;

    if (summaryRange === 'weekly') {
      rangeStartMs = nowMs - (7 * DAY_MS);
    }

    if (summaryRange === 'custom') {
      const fromMs = getStartOfDayMs(customFromDate);
      const toMs = getEndOfDayMs(customToDate);

      if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || fromMs > toMs) {
        return [];
      }

      rangeStartMs = fromMs;
      rangeEndMs = toMs;
    }

    return orders.filter((order) => {
      const createdAtMs = new Date(order?.createdAt).getTime();
      return Number.isFinite(createdAtMs) && createdAtMs >= rangeStartMs && createdAtMs <= rangeEndMs;
    });
  }, [orders, summaryRange, customFromDate, customToDate]);

  const metrics = useMemo(() => {
    const totalOrders = rangeFilteredOrders.length;
    const totalSales = rangeFilteredOrders
      .filter(isSalesOrder)
      .reduce((sum, order) => sum + (Number(order?.totalAmount) || 0), 0);

    const refundedAmount = rangeFilteredOrders
      .filter(isRefundOrder)
      .reduce((sum, order) => sum + (Number(order?.totalAmount) || 0), 0);

    const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      averageOrder,
      refundedAmount,
    };
  }, [rangeFilteredOrders]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const buckets = [];

    for (let i = 11; i >= 0; i -= 1) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

      buckets.push({
        key,
        label: monthShort(monthStart),
        startMs: monthStart.getTime(),
        endMs: monthEnd.getTime(),
        earning: 0,
        refund: 0,
      });
    }

    orders.forEach((order) => {
      const createdAt = new Date(order?.createdAt).getTime();
      if (Number.isNaN(createdAt)) return;

      const bucket = buckets.find((item) => createdAt >= item.startMs && createdAt < item.endMs);
      if (!bucket) return;

      const amount = Number(order?.totalAmount) || 0;

      if (isRefundOrder(order)) {
        bucket.refund += amount;
      } else if (isSalesOrder(order)) {
        bucket.earning += amount;
      }
    });

    return buckets;
  }, [orders]);

  const chartData = useMemo(
    () => monthlyData.map((item) => ({
      label: item.label,
      earning: Number(item.earning) || 0,
      refund: Number(item.refund) || 0,
    })),
    [monthlyData]
  );

  const summaryCards = [
    {
      id: 'sales',
      label: 'Total Sales',
      value: formatPrice(metrics.totalSales),
      bgClass: 'bg-[#b9dcdd]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Total Orders',
      value: String(metrics.totalOrders),
      bgClass: 'bg-[#bbe2a6]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17h6m-8 0h.01M17 17h.01M3 7h11v7H3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 10h3l3 3v1h-6zM5 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
        </svg>
      ),
    },
    {
      id: 'average',
      label: 'Average Order',
      value: formatPrice(metrics.averageOrder),
      bgClass: 'bg-[#f0e79d]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-2.21 0-4 1.79-4 4m8 0a4 4 0 00-4-4m0 0V4m0 4v4" />
          <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
        </svg>
      ),
    },
    {
      id: 'refunded',
      label: 'Refunded',
      value: formatPrice(metrics.refundedAmount),
      bgClass: 'bg-[#e8d4e5]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l2-2 4 4m0-4h-4m4 0V8m-9 9h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="rounded-2xl border border-[#d5dfde] bg-[#eef2f1] p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Sales reports</h2>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setSummaryRange('weekly')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                summaryRange === 'weekly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setSummaryRange('monthly')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                summaryRange === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setSummaryRange('custom')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                summaryRange === 'custom'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>

          <button
            type="button"
            className="rounded-full bg-[#0f8f84] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#117b72]"
          >
            Export
          </button>
        </div>
      </div>

      <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
        Showing summary for {
          summaryRange === 'weekly'
            ? 'last 7 days'
            : summaryRange === 'custom'
              ? 'selected custom range'
              : 'last 30 days'
        }
      </p>

      {summaryRange === 'custom' && (
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">From</label>
            <input
              type="date"
              value={customFromDate}
              onChange={(event) => setCustomFromDate(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">To</label>
            <input
              type="date"
              value={customToDate}
              onChange={(event) => setCustomToDate(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          {customFromDate && customToDate && getStartOfDayMs(customFromDate) > getEndOfDayMs(customToDate) ? (
            <p className="text-xs font-semibold text-red-500">From date cannot be after To date</p>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.id} className={`rounded-xl p-3.5 ${card.bgClass}`}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-gray-700">
                {card.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-700">{card.label}</p>
                <p className="mt-0.5 text-2xl font-black leading-none text-gray-900">
                  {loading ? '...' : card.value}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Accommodation Revenue</h3>
          <p className="mt-0.5 text-sm font-medium text-gray-600 dark:text-gray-300">Last 12 months real order data</p>
        </div>

        <div className="px-3 py-3 sm:px-4">
          <div className="mb-2 flex justify-end gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Earning
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Refunds
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 5" stroke="#d1d5db" />
                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <YAxis tickFormatter={compactNumber} tick={{ fill: '#9ca3af', fontSize: 10 }} width={46} />
                    <Tooltip
                      formatter={(value) => formatPrice(Number(value) || 0)}
                      contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="refund" fill="#60a5fa" barSize={14} radius={[6, 6, 0, 0]} />
                    <Area type="monotone" dataKey="earning" stroke="#10b981" fill="#86efac" fillOpacity={0.25} strokeWidth={2.5} />
                    <Line type="monotone" dataKey="earning" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesReport;
