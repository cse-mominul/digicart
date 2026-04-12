import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const itemsPerPage = 10;

const getPaginationItems = (currentPage, totalPages) => {
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
};

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, title: '', comment: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await API.get('/admin/reviews');
        setReviews(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;

    return reviews.filter((review) => {
      const reviewer = `${review?.user?.name || ''} ${review?.user?.email || ''}`.toLowerCase();
      const product = `${review?.product?.name || ''} ${review?.product?.category || ''}`.toLowerCase();
      const content = `${review?.title || ''} ${review?.comment || ''}`.toLowerCase();
      return reviewer.includes(q) || product.includes(q) || content.includes(q);
    });
  }, [reviews, search]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage)),
    [filteredReviews.length]
  );

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [currentPage, filteredReviews]);

  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const openEdit = (review) => {
    setEditingReview(review);
    setEditForm({
      rating: Number(review?.rating) || 5,
      title: review?.title || '',
      comment: review?.comment || '',
    });
  };

  const closeEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, title: '', comment: '' });
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!editForm.comment.trim()) {
      toast.error('Comment is required');
      return;
    }

    setSaving(true);
    try {
      const { data } = await API.put(`/admin/reviews/${editingReview._id}`, {
        rating: Number(editForm.rating),
        title: editForm.title,
        comment: editForm.comment,
      });

      setReviews((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      toast.success('Review updated');
      closeEdit();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    setDeletingId(reviewId);
    try {
      await API.delete(`/admin/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((item) => item._id !== reviewId));
      toast.success('Review deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Review Management</h2>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by user, product, or comment"
          className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md h-64 animate-pulse" />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-left">
                <tr>
                  <th className="px-6 py-3">Reviewer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Review</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.map((review) => (
                  <tr key={review._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 dark:text-white">{review?.user?.name || 'Unknown user'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{review?.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 dark:text-white">{review?.product?.name || 'Unknown product'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{review?.product?.category || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {Number(review.rating).toFixed(1)} / 5
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {review.title ? <p className="font-semibold">{review.title}</p> : null}
                      <p className="text-xs mt-1 max-w-xs whitespace-pre-wrap break-words">{review.comment}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/reviews/${review._id}`)}
                          className="rounded-md bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEdit(review)}
                          className="rounded-md bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300"
                        >
                          Edit
                        </button>
                        <button
                          disabled={deletingId === review._id}
                          onClick={() => handleDelete(review._id)}
                          className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-60 dark:bg-red-900/40 dark:text-red-300"
                        >
                          {deletingId === review._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReviews.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      No reviews found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredReviews.length > 0 && (
            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {paginationItems.map((item, index) => (
                  typeof item === 'number' ? (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePageChange(item)}
                      className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-medium transition-colors ${
                        currentPage === item
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span
                      key={`ellipsis-${index}`}
                      className="inline-flex h-10 min-w-10 items-center justify-center text-sm text-gray-400"
                    >
                      {item}
                    </span>
                  )
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Edit Review</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                <select
                  value={editForm.rating}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} Star{value > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Optional review title"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Comment</label>
                <textarea
                  rows={4}
                  value={editForm.comment}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, comment: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Write updated comment"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
