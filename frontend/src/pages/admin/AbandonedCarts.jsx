import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const itemsPerPage = 10;

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
};

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

const AbandonedCarts = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ abandonedUsers: 0, abandonedItems: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resolvingUserId, setResolvingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const fetchAbandonedCarts = async (page = currentPage, search = searchQuery) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(itemsPerPage),
      });

      if (String(search || '').trim()) {
        params.set('search', String(search).trim());
      }

      const { data } = await API.get(`/admin/abandoned-carts?${params.toString()}`);

      setUsers(Array.isArray(data?.users) ? data.users : []);
      setSummary({
        abandonedUsers: Number(data?.abandonedUsers) || 0,
        abandonedItems: Number(data?.abandonedItems) || 0,
        total: Number(data?.total) || 0,
      });
      setTotalPages(Math.max(1, Number(data?.pages) || 1));
      setCurrentPage(Math.max(1, Number(data?.page) || 1));
    } catch {
      toast.error('Failed to load abandoned cart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbandonedCarts(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      setSearchQuery(searchInput.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleResolve = async (userId, name) => {
    const result = await Swal.fire({
      title: 'Resolve abandoned cart?',
      text: `Mark ${name || 'this user'} as resolved?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, resolve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setResolvingUserId(userId);
    try {
      const { data } = await API.put(`/admin/abandoned-carts/${userId}`);
      toast.success(data?.message || 'Abandoned cart resolved');
      await fetchAbandonedCarts(currentPage, searchQuery);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resolve abandoned cart');
    } finally {
      setResolvingUserId(null);
    }
  };

  const handleDelete = async (userId, name) => {
    const result = await Swal.fire({
      title: 'Delete abandoned entry?',
      text: `Delete ${name || 'this user'} abandoned cart data?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingUserId(userId);
    try {
      const { data } = await API.delete(`/admin/abandoned-carts/${userId}`);
      toast.success(data?.message || 'Abandoned cart entry deleted');
      await fetchAbandonedCarts(currentPage, searchQuery);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete abandoned cart entry');
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Abandoned Carts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Users who added products to cart or wishlist but did not purchase
          </p>
        </div>

        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search user or product"
          className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
          <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Abandoned Users</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-200">{summary.abandonedUsers}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Abandoned Items</p>
          <p className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-200">{summary.abandonedItems}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
          <p className="text-xs uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Filtered Results</p>
          <p className="mt-1 text-2xl font-bold text-indigo-800 dark:text-indigo-200">{summary.total}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md h-64 animate-pulse" />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-left">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Cart</th>
                  <th className="px-6 py-3">Wishlist</th>
                  <th className="px-6 py-3">Unpurchased</th>
                  <th className="px-6 py-3">Last Active</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => {
                  return (
                    <tr key={entry.userId} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <p className="font-medium text-indigo-700 dark:text-indigo-300">{entry.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          {entry.cartCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          {entry.wishlistCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                          {entry.unresolvedCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(entry.lastActiveAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/abandoned-carts/${entry.userId}`)}
                          className="rounded-md bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300"
                        >
                          View
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResolve(entry.userId, entry.name)}
                            disabled={resolvingUserId === entry.userId || deletingUserId === entry.userId}
                            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {resolvingUserId === entry.userId ? 'Updating...' : 'Update'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.userId, entry.name)}
                            disabled={resolvingUserId === entry.userId || deletingUserId === entry.userId}
                            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingUserId === entry.userId ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      No abandoned carts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
        </div>
      )}
    </div>
  );
};

export default AbandonedCarts;

