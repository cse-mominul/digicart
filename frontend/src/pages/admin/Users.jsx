import { useEffect, useMemo, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get('/admin/users');
        const allUsers = Array.isArray(data) ? data : [];
        setUsers(allUsers.filter((item) => item?.role !== 'admin'));
      } catch {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    const intervalId = setInterval(fetchUsers, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const getCustomerStatus = (customer) => {
    const lastLogin = customer?.lastLoginAt ? new Date(customer.lastLoginAt).getTime() : 0;
    if (!lastLogin) return 'inactive';
    if (Date.now() - lastLogin <= 24 * 60 * 60 * 1000) return 'active';
    return 'inactive';
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = Date.now();

    return users.filter((customer) => {
      if (query) {
        const haystack = `${customer?.name || ''} ${customer?.email || ''} ${customer?.phone || ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (statusFilter !== 'all' && getCustomerStatus(customer) !== statusFilter) {
        return false;
      }

      if (dateFilter !== 'all') {
        const createdAt = new Date(customer?.createdAt || 0).getTime();
        if (!createdAt) return false;

        if (dateFilter === 'today' && now - createdAt > 24 * 60 * 60 * 1000) return false;
        if (dateFilter === '7d' && now - createdAt > 7 * 24 * 60 * 60 * 1000) return false;
        if (dateFilter === '30d' && now - createdAt > 30 * 24 * 60 * 60 * 1000) return false;
      }

      return true;
    });
  }, [users, search, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', password: '' });
    setShowPassword(false);
    setShowCreateModal(true);
  };

  const openEdit = (customer) => {
    setEditingUser(customer);
    setForm({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      password: '',
    });
    setShowPassword(false);
    setShowCreateModal(true);
  };

  const openView = (customer) => {
    setSelectedUser(customer);
    setShowViewModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setShowPassword(false);
    setForm({ name: '', email: '', phone: '', password: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        const payload = { name, email, phone };
        const password = form.password.trim();
        if (password) {
          if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            setSubmitting(false);
            return;
          }
          payload.password = password;
        }

        const { data } = await API.put(`/admin/users/${editingUser._id}`, payload);
        setUsers((prev) => prev.map((item) => (item._id === data._id ? data : item)));
        toast.success('Customer updated');
      } else {
        const password = form.password.trim();
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setSubmitting(false);
          return;
        }

        const { data } = await API.post('/auth/register', { name, email, phone, password });
        setUsers((prev) => [data, ...prev]);
        toast.success('Customer created');
      }

      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?._id) {
      toast.error("You can't delete your own account");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((item) => item._id !== id));
      toast.success('User deleted successfully!');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div>
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-3.5 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Customer</h2>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-teal-700 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-800"
          >
            Create Customer
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 lg:grid-cols-[2fr_160px_160px] gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-[11px] text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-[11px] text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-[11px] text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">Date</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 bg-white dark:bg-gray-800 rounded-xl shadow-md h-64 animate-pulse" />
      ) : (
        <div className="mt-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-left">
                <tr>
                  <th className="px-4 py-2.5 text-xs">ID</th>
                  <th className="px-4 py-2.5 text-xs">Users</th>
                  <th className="px-4 py-2.5 text-xs">Email</th>
                  <th className="px-4 py-2.5 text-xs">Phone Number</th>
                  <th className="px-4 py-2.5 text-xs">Status</th>
                  <th className="px-4 py-2.5 text-xs">Date</th>
                  <th className="px-4 py-2.5 text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                      #{String(u._id || '').slice(-5).toUpperCase()}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[11px] text-gray-800 dark:text-white">{u.name}</p>
                          {u._id === currentUser?._id && (
                            <p className="text-[10px] text-indigo-500">You</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-[11px]">{u.email}</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-[11px]">{u.phone || 'N/A'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        getCustomerStatus(u) === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {getCustomerStatus(u) === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openView(u)} className="text-gray-700 hover:text-indigo-600" aria-label="View customer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        <button type="button" onClick={() => openEdit(u)} className="text-gray-700 hover:text-emerald-600" aria-label="Edit customer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 17l-4 1 1-4 9.586-9.586a2 2 0 112.828 2.828L9 17z" />
                          </svg>
                        </button>

                        {u._id !== currentUser?._id && (
                          <button type="button" onClick={() => handleDelete(u._id)} className="text-gray-700 hover:text-red-600" aria-label="Delete customer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
                >
                  Prev
                </button>
                <span className="min-w-[68px] text-center font-medium text-gray-700 dark:text-gray-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
              {editingUser ? 'Edit Customer' : 'Create Customer'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {editingUser ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder={editingUser ? 'Leave empty to keep current password' : ''}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.944-9.542-7a9.963 9.963 0 012.335-3.952m3.087-2.519A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.132 5.411M15 12a3 3 0 00-4.24-2.748M9.88 9.88A3 3 0 0014.12 14.12M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">Customer Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Name:</span> <span className="text-gray-600 dark:text-gray-400">{selectedUser.name}</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> <span className="text-gray-600 dark:text-gray-400">{selectedUser.email}</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Phone:</span> <span className="text-gray-600 dark:text-gray-400">{selectedUser.phone || 'N/A'}</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Password:</span> <span className="text-gray-600 dark:text-gray-400">Encrypted (cannot view current password)</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Last Login:</span> <span className="text-gray-600 dark:text-gray-400">{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span> <span className="text-gray-600 dark:text-gray-400">{getCustomerStatus(selectedUser) === 'active' ? 'Active' : 'Inactive'}</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Joined:</span> <span className="text-gray-600 dark:text-gray-400">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</span></p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
