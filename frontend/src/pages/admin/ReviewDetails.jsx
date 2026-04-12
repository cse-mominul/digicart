import { useEffect, useState } from 'react';
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

const ReviewDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/admin/reviews/${id}`);
        setReview(data || null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load review details');
        setReview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
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

  if (!review) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <p className="text-lg font-semibold">Review not found</p>
        <button
          type="button"
          onClick={() => navigate('/admin/reviews')}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to Reviews
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white">Review Details</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Full information about the review, reviewer, and product.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/reviews')}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          Back to Reviews
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Reviewer</p>
          <p className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-100">{review?.user?.name || 'Unknown user'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{review?.user?.email || 'N/A'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{review?.user?.phone || 'N/A'}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold text-gray-700 dark:text-gray-200">Role:</span> {review?.user?.role || 'user'}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-200">Joined:</span> {formatDateTime(review?.user?.createdAt)}</p>
            <p><span className="font-semibold text-gray-700 dark:text-gray-200">Last Login:</span> {formatDateTime(review?.user?.lastLoginAt)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Review Meta</p>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            Rating: <span className="font-semibold text-amber-700 dark:text-amber-300">{Number(review?.rating || 0).toFixed(1)} / 5</span>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Submitted: <span className="font-semibold">{formatDateTime(review?.createdAt)}</span>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Updated: <span className="font-semibold">{formatDateTime(review?.updatedAt)}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Review Content</p>
          {review?.title ? (
            <p className="mt-2 text-base font-semibold text-gray-800 dark:text-white">{review.title}</p>
          ) : null}
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-200">
            {review?.comment || 'No comment'}
          </p>

          {review?.image ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Attached Image</p>
              <img
                src={review.image}
                alt="Review"
                className="mt-2 max-h-72 w-auto rounded-lg border border-gray-200 object-contain dark:border-gray-700"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Product</p>

          <div className="mt-2 flex items-start gap-3">
            <img
              src={review?.product?.image || 'https://placehold.co/96x96?text=?'}
              alt={review?.product?.name || 'Product'}
              className="h-24 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
              onError={(event) => {
                event.currentTarget.src = 'https://placehold.co/96x96?text=?';
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{review?.product?.name || 'Unknown product'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{review?.product?.brand || 'N/A'} • {review?.product?.category || 'N/A'}</p>
              <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                {formatPrice(Number(review?.product?.price) || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {Number(review?.product?.stock) || 0}</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
            {review?.product?.description || 'No product description available.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetails;
