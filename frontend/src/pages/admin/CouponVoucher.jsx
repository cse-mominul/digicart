import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const CouponVoucher = () => {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const couponsPerPage = 8;
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 12,
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/coupons');
      setCoupons(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountPercent: 12,
      description: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const totalPages = Math.max(1, Math.ceil(coupons.length / couponsPerPage));
  const startIndex = (currentPage - 1) * couponsPerPage;
  const paginatedCoupons = coupons.slice(startIndex, startIndex + couponsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      description: coupon.description || '',
      isActive: coupon.isActive,
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: 'Delete Coupon?',
      text: `This will permanently delete the coupon "${code}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/coupons/${id}`);
      const updatedCoupons = coupons.filter((c) => c._id !== id);
      setCoupons(updatedCoupons);
      const updatedTotalPages = Math.max(1, Math.ceil(updatedCoupons.length / couponsPerPage));
      if (currentPage > updatedTotalPages) {
        setCurrentPage(updatedTotalPages);
      }
      toast.success('Coupon deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    if (!Number.isFinite(Number(formData.discountPercent)) || formData.discountPercent < 0 || formData.discountPercent > 100) {
      toast.error('Discount must be between 0 and 100');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { data } = await API.patch(`/coupons/${editingId}`, {
          code: formData.code.toUpperCase(),
          discountPercent: Number(formData.discountPercent),
          description: formData.description,
          isActive: Boolean(formData.isActive),
        });
        setCoupons(coupons.map((c) => (c._id === editingId ? data : c)));
        toast.success('Coupon updated successfully');
      } else {
        const { data } = await API.post('/coupons', {
          code: formData.code.toUpperCase(),
          discountPercent: Number(formData.discountPercent),
          description: formData.description,
          isActive: Boolean(formData.isActive),
        });
        setCoupons([data, ...coupons]);
        toast.success('Coupon created successfully');
      }
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      const { data } = await API.patch(`/coupons/${id}`, {
        isActive: newStatus,
      });
      setCoupons(coupons.map((c) => (c._id === id ? data : c)));
      toast.success(`Coupon ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Coupon / Voucher</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage multiple coupons for checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          + Add New Coupon
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="MOMIN"
                  disabled={editingId !== null}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Discount % *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  placeholder="12"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isActive)}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-blue-500"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Coupon'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse dark:border-gray-700 dark:bg-gray-800 h-64" />
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 text-center">
          <p className="text-gray-500 dark:text-gray-400">No coupons yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Code</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Discount</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Usage</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{coupon.code}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{coupon.discountPercent}%</td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{coupon.usageCount || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        coupon.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{coupon.description || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(coupon)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            coupon.isActive
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(coupon._id, coupon.code)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(startIndex + couponsPerPage, coupons.length)} of {coupons.length} coupons
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
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

export default CouponVoucher;

