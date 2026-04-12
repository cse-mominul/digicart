import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
};

const ProductListCard = ({ title, products = [], tone = 'gray' }) => {
  const toneClass = {
    gray: 'border-gray-200 dark:border-gray-700',
    indigo: 'border-indigo-200 dark:border-indigo-700/60',
    amber: 'border-amber-200 dark:border-amber-700/60',
    rose: 'border-rose-200 dark:border-rose-700/60',
    emerald: 'border-emerald-200 dark:border-emerald-700/60',
  }[tone] || 'border-gray-200 dark:border-gray-700';

  return (
    <div className={`rounded-2xl border bg-white p-4 dark:bg-gray-800 ${toneClass}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">{title}</h3>
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
          {products.length}
        </span>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No products found.</p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-900/40"
            >
              <img
                src={product.image || 'https://placehold.co/56x56?text=?'}
                alt={product.name || 'Product'}
                className="h-14 w-14 rounded-lg object-cover"
                onError={(event) => {
                  event.currentTarget.src = 'https://placehold.co/56x56?text=?';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{product.name || 'N/A'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.brand || 'N/A'} • {product.category || 'N/A'}
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-300">
                  {formatPrice(Number(product.price) || 0)} • Stock {Number(product.stock) || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AbandonedCartDetails = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/admin/abandoned-carts/${userId}`);
        setDetails(data || null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load abandoned cart details');
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [userId]);

  const user = details?.user || {};
  const insight = details?.insight || {};

  const statCards = useMemo(
    () => [
      { label: 'Cart Products', value: Number(insight.cartCount) || 0, tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
      { label: 'Wishlist Products', value: Number(insight.wishlistCount) || 0, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
      { label: 'Unpurchased Products', value: Number(insight.unresolvedCount) || 0, tone: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
      { label: 'Purchased Products', value: Number(insight.purchasedCount) || 0, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    ],
    [insight.cartCount, insight.purchasedCount, insight.unresolvedCount, insight.wishlistCount]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="h-56 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <p className="text-lg font-semibold">Abandoned cart details not found</p>
        <button
          type="button"
          onClick={() => navigate('/admin/abandoned-carts')}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to Abandoned Carts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white">Abandoned Cart Details</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Full breakdown for cart and wishlist activity of this customer.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/abandoned-carts')}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          Back to Abandoned Carts
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Customer</p>
          <p className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-100">{user.name || 'Unknown User'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{user.email || 'N/A'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{user.phone || 'N/A'}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold text-gray-700 dark:text-gray-200">Role:</span> {user.role || 'user'}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-200">Joined:</span> {formatDateTime(user.createdAt)}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-200">Last Login:</span> {formatDateTime(user.lastLoginAt)}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-200">Last Active:</span> {formatDateTime(insight.lastActiveAt)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Tracking Timeline</p>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            Started: <span className="font-semibold">{formatDateTime(insight.createdAt)}</span>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Updated: <span className="font-semibold">{formatDateTime(insight.updatedAt)}</span>
          </p>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            This user still has items that were tracked but not converted into purchase.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl p-3 ${card.tone}`}>
            <p className="text-[11px] uppercase tracking-wide">{card.label}</p>
            <p className="mt-1 text-xl font-black">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ProductListCard title="Unpurchased Products" products={details?.unpurchasedProducts || []} tone="rose" />
        <ProductListCard title="Cart Products" products={details?.cartProducts || []} tone="indigo" />
        <ProductListCard title="Wishlist Products" products={details?.wishlistProducts || []} tone="amber" />
        <ProductListCard title="Purchased Products" products={details?.purchasedProducts || []} tone="emerald" />
      </div>
    </div>
  );
};

export default AbandonedCartDetails;
