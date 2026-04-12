import { useEffect, useMemo, useState } from 'react';
import API from '../../api/axios';
import { formatPrice } from '../../utils/formatPrice';

const DAY_MS = 24 * 60 * 60 * 1000;

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
    const days = summaryRange === 'weekly' ? 7 : 30;
    const rangeStartMs = nowMs - (days * DAY_MS);

    return orders.filter((order) => {
      const createdAtMs = new Date(order?.createdAt).getTime();
      return Number.isFinite(createdAtMs) && createdAtMs >= rangeStartMs && createdAtMs <= nowMs;
    });
  }, [orders, summaryRange]);

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

  const chart = useMemo(() => {
    const chartWidth = 980;
    const chartHeight = 220;
    const topPadding = 16;
    const bottomPadding = 28;
    const leftPadding = 36;
    const rightPadding = 18;

    const values = monthlyData.flatMap((item) => [item.earning, item.refund]);
    const maxValue = Math.max(1, ...values);
    const usableHeight = chartHeight - topPadding - bottomPadding;
    const usableWidth = chartWidth - leftPadding - rightPadding;

    const toPoint = (value, index, total) => {
      const x = leftPadding + (index * (usableWidth / Math.max(1, total - 1)));
      const y = topPadding + ((maxValue - value) / maxValue) * usableHeight;
      return { x, y };
    };

    const earningPoints = monthlyData.map((item, index) => toPoint(item.earning, index, monthlyData.length));
    const refundPoints = monthlyData.map((item, index) => toPoint(item.refund, index, monthlyData.length));

    const pointsToPath = (points) => points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const earningPath = pointsToPath(earningPoints);
    const refundPath = pointsToPath(refundPoints);
    const earningAreaPath = earningPoints.length
      ? `${earningPath} L ${earningPoints[earningPoints.length - 1].x} ${chartHeight - bottomPadding} L ${earningPoints[0].x} ${chartHeight - bottomPadding} Z`
      : '';

    const axisSteps = [0, 0.25, 0.5, 0.75, 1];

    return {
      chartWidth,
      chartHeight,
      topPadding,
      bottomPadding,
      leftPadding,
      rightPadding,
      earningPath,
      refundPath,
      earningAreaPath,
      axisSteps,
      maxValue,
    };
  }, [monthlyData]);

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
        Showing summary for {summaryRange === 'weekly' ? 'last 7 days' : 'last 30 days'}
      </p>

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
              <svg viewBox={`0 0 ${chart.chartWidth} ${chart.chartHeight}`} className="h-[220px] w-full">
                {chart.axisSteps.map((step) => {
                  const value = chart.maxValue * step;
                  const y = chart.topPadding + ((1 - step) * (chart.chartHeight - chart.topPadding - chart.bottomPadding));

                  return (
                    <g key={`grid-${step}`}>
                      <line
                        x1={chart.leftPadding}
                        y1={y}
                        x2={chart.chartWidth - chart.rightPadding}
                        y2={y}
                        className="stroke-gray-200 dark:stroke-gray-700"
                        strokeDasharray="3 5"
                      />
                      <text x={0} y={y + 4} className="fill-gray-400 text-[10px]">{compactNumber(value)}</text>
                    </g>
                  );
                })}

                {chart.earningAreaPath ? (
                  <path d={chart.earningAreaPath} className="fill-emerald-200/35 dark:fill-emerald-400/15" />
                ) : null}
                <path d={chart.earningPath} className="stroke-emerald-500" strokeWidth="2.5" fill="none" />
                <path d={chart.refundPath} className="stroke-blue-500" strokeWidth="2.5" fill="none" />

                {monthlyData.map((month, index) => {
                  const x = chart.leftPadding + (index * ((chart.chartWidth - chart.leftPadding - chart.rightPadding) / Math.max(1, monthlyData.length - 1)));
                  return (
                    <text
                      key={month.key}
                      x={x}
                      y={chart.chartHeight - 8}
                      textAnchor="middle"
                      className="fill-gray-500 text-[11px] dark:fill-gray-400"
                    >
                      {month.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesReport;
