import { Fragment, useEffect, useMemo, useState } from 'react';
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
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ abandonedUsers: 0, abandonedItems: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [resolvingUserId, setResolvingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);

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
      setExpandedUserId((prev) => (prev === userId ? null : prev));
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
      setExpandedUserId((prev) => (prev === userId ? null : prev));
    }
  };

  const handleViewProduct = async (productId) => {
    if (!productId) return;

    setProductLoading(true);
    try {
      const { data } = await API.get(`/products/${productId}`);
      setSelectedProduct(data || null);
    } catch {
      toast.error('Failed to load product details');
    } finally {
      setProductLoading(false);
    }
  };

  const handleViewCustomer = async (userId) => {
    if (!userId) return;

    setCustomerLoading(true);
    try {
      const { data } = await API.get(`/admin/users/${userId}`);
      setSelectedCustomer(data || null);
    } catch {
      toast.error('Failed to load customer details');
    } finally {
      setCustomerLoading(false);
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
                  const isExpanded = expandedUserId === entry.userId;
                  return (
                    <Fragment key={entry.userId}>
                      <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleViewCustomer(entry.userId)}
                            className="text-left"
                          >
                            <p className="font-medium text-indigo-700 hover:underline dark:text-indigo-300">{entry.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{entry.email || 'N/A'}</p>
                          </button>
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
                            onClick={() => setExpandedUserId(isExpanded ? null : entry.userId)}
                            className="rounded-md bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300"
                          >
                            {isExpanded ? 'Hide' : 'View'}
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

                      {isExpanded && (
                        <tr className="border-t bg-gray-50/60 dark:border-gray-700 dark:bg-gray-900/30">
                          <td colSpan={7} className="px-6 py-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Unpurchased Products
                            </p>

                            {Array.isArray(entry.unresolvedProducts) && entry.unresolvedProducts.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {entry.unresolvedProducts.map((product) => (
                                  <button
                                    key={product._id}
                                    type="button"
                                    onClick={() => handleViewProduct(product._id)}
                                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-900/20"
                                  >
                                    <img
                                      src={product.image || 'https://placehold.co/52x52?text=?'}
                                      alt={product.name}
                                      className="h-12 w-12 rounded-md object-cover"
                                      onError={(event) => {
                                        event.currentTarget.src = 'https://placehold.co/52x52?text=?';
                                      }}
                                    />
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-gray-800 dark:text-white">{product.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.category || 'N/A'}</p>
                                      <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-300">Click for details</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No unresolved products found.</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
                        ? 'bg-pink-500 text-white border-pink-500'
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

      {(productLoading || selectedProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-800">
            {productLoading ? (
              <div className="h-44 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Product Details</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                  >
                    Close
                  </button>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <img
                    src={selectedProduct?.image || 'https://placehold.co/120x120?text=?'}
                    alt={selectedProduct?.name || 'Product'}
                    className="h-28 w-28 rounded-xl border border-gray-200 object-cover dark:border-gray-700"
                    onError={(event) => {
                      event.currentTarget.src = 'https://placehold.co/120x120?text=?';
                    }}
                  />
                  <div className="min-w-0 flex-1 space-y-1.5 text-sm">
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">Name:</span> <span className="text-gray-600 dark:text-gray-400">{selectedProduct?.name || 'N/A'}</span></p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span> <span className="text-gray-600 dark:text-gray-400">{selectedProduct?.category || 'N/A'}</span></p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">Price:</span> <span className="text-gray-600 dark:text-gray-400">{selectedProduct?.price ?? 'N/A'}</span></p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">Stock:</span> <span className="text-gray-600 dark:text-gray-400">{selectedProduct?.stock ?? 'N/A'}</span></p>
                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">Description:</span> <span className="text-gray-600 dark:text-gray-400">{selectedProduct?.description || 'N/A'}</span></p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {(customerLoading || selectedCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-800">
            {customerLoading ? (
              <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700" />
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Customer Details</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Name:</span> <span className="text-gray-600 dark:text-gray-400">{selectedCustomer?.name || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> <span className="text-gray-600 dark:text-gray-400">{selectedCustomer?.email || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Phone:</span> <span className="text-gray-600 dark:text-gray-400">{selectedCustomer?.phone || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Role:</span> <span className="text-gray-600 dark:text-gray-400">{selectedCustomer?.role || 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Joined:</span> <span className="text-gray-600 dark:text-gray-400">{selectedCustomer?.createdAt ? new Date(selectedCustomer.createdAt).toLocaleString() : 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Last Login:</span> <span className="text-gray-600 dark:text-gray-400">{selectedCustomer?.lastLoginAt ? new Date(selectedCustomer.lastLoginAt).toLocaleString() : 'Never'}</span></p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AbandonedCarts;
