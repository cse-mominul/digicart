import { useEffect, useMemo, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { formatPrice } from '../../utils/formatPrice';

const defaultForm = {
  title: '',
  category: 'facebook_ads',
  amount: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  note: '',
};

const ITEMS_PER_PAGE = 8;

const categoryOptions = [
  { value: 'facebook_ads', label: 'Facebook Ads' },
  { value: 'transport', label: 'Transport' },
  { value: 'salary', label: 'Salary' },
  { value: 'office_rent', label: 'Office Rent' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'internet', label: 'Internet/Utility' },
  { value: 'other', label: 'Other' },
];

const labelFromCategory = (value) => {
  const found = categoryOptions.find((item) => item.value === value);
  if (found) return found.label;
  return String(value || 'Other').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/expenses');
      setExpenses(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totals = useMemo(() => {
    const totalAmount = expenses.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
    const thisMonth = new Date();
    const monthAmount = expenses.reduce((sum, item) => {
      const date = new Date(item?.expenseDate);
      if (
        date.getFullYear() === thisMonth.getFullYear() &&
        date.getMonth() === thisMonth.getMonth()
      ) {
        return sum + (Number(item?.amount) || 0);
      }
      return sum;
    }, 0);

    return {
      totalAmount,
      monthAmount,
      count: expenses.length,
    };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = String(searchTerm || '').trim().toLowerCase();
    const fromMs = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
    const toMs = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

    return expenses.filter((expense) => {
      const expenseDateMs = new Date(expense?.expenseDate || expense?.createdAt).getTime();

      if (filterCategory !== 'all' && String(expense?.category || '') !== filterCategory) {
        return false;
      }

      if (Number.isFinite(fromMs) && Number.isFinite(expenseDateMs) && expenseDateMs < fromMs) {
        return false;
      }

      if (Number.isFinite(toMs) && Number.isFinite(expenseDateMs) && expenseDateMs > toMs) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const title = String(expense?.title || '').toLowerCase();
      const note = String(expense?.note || '').toLowerCase();
      const category = String(labelFromCategory(expense?.category || '')).toLowerCase();

      return title.includes(normalizedSearch) || note.includes(normalizedSearch) || category.includes(normalizedSearch);
    });
  }, [expenses, filterCategory, fromDate, searchTerm, toDate]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)), [filteredExpenses.length]);

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExpenses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExpenses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, fromDate, toDate]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = String(form.title || '').trim();
    const amount = Number(form.amount);

    if (!title) {
      toast.error('Expense title is required');
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      toast.error('Amount must be a valid non-negative number');
      return;
    }

    setSaving(true);
    try {
      const { data } = await API.post('/admin/expenses', {
        title,
        category: form.category,
        amount,
        expenseDate: form.expenseDate,
        note: String(form.note || '').trim(),
      });

      setExpenses((prev) => [data, ...prev]);
      setCurrentPage(1);
      setForm(defaultForm);
      setShowAddModal(false);
      toast.success('Expense added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expenseId) => {
    const result = await Swal.fire({
      title: 'Delete expense?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    setDeletingId(expenseId);
    try {
      await API.delete(`/admin/expenses/${expenseId}`);
      setExpenses((prev) => prev.filter((item) => item._id !== expenseId));
      toast.success('Expense deleted');
    } catch {
      toast.error('Failed to delete expense');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section className="rounded-2xl border border-[#d5dfde] bg-[#eef2f1] p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Expense Report</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setForm(defaultForm);
              setShowAddModal(true);
            }}
            className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-500"
          >
            Add Expense
          </button>
          <button
            type="button"
            onClick={fetchExpenses}
            className="rounded-full bg-[#2563eb] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
        <div className="rounded-xl bg-[#f0e79d] p-3.5">
          <p className="text-sm font-semibold text-gray-700">Total Expense</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{formatPrice(totals.totalAmount)}</p>
        </div>
        <div className="rounded-xl bg-[#e8d4e5] p-3.5">
          <p className="text-sm font-semibold text-gray-700">This Month</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{formatPrice(totals.monthAmount)}</p>
        </div>
        <div className="rounded-xl bg-[#b9dcdd] p-3.5">
          <p className="text-sm font-semibold text-gray-700">Entries</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{totals.count}</p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search title, note, category..."
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 lg:col-span-2"
          />

          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredExpenses.length} of {expenses.length} entries
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFromDate('');
              setToDate('');
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:border-indigo-500 hover:text-indigo-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Date</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Title</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Category</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Note</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Amount</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading expenses...</td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No matching expense found.</td>
              </tr>
            ) : (
              paginatedExpenses.map((expense) => (
                <tr key={expense._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300">
                    {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium">{expense.title}</td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{labelFromCategory(expense.category)}</td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{expense.note || '-'}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-red-600 dark:text-red-400">{formatPrice(expense.amount || 0)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(expense._id)}
                      disabled={deletingId === expense._id}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === expense._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredExpenses.length > 0 && (
        <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-gray-300 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300 sm:flex-row sm:items-center">
          <p>
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-indigo-500 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              Prev
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-indigo-500 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add New Expense</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Expense title"
                  className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                  placeholder="Amount"
                  className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="date"
                  value={form.expenseDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, expenseDate: event.target.value }))}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <textarea
                rows="3"
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                placeholder="Optional note (e.g., campaign details)"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Expenses;
