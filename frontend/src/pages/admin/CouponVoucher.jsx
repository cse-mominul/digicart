import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const CouponVoucher = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    couponCode: '',
    couponDiscountPercent: 0,
    couponActive: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get('/settings');
        setSettingsForm({
          couponCode: String(data?.couponCode || '').trim().toUpperCase(),
          couponDiscountPercent: Number(data?.couponDiscountPercent) || 0,
          couponActive: Boolean(data?.couponActive),
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load coupon settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const saveCouponSettings = async (event) => {
    event.preventDefault();

    const couponCode = String(settingsForm.couponCode || '').trim().toUpperCase();
    const couponDiscountPercent = Number(settingsForm.couponDiscountPercent);

    if (settingsForm.couponActive && !couponCode) {
      toast.error('Coupon code is required when active');
      return;
    }

    if (!Number.isFinite(couponDiscountPercent) || couponDiscountPercent < 0 || couponDiscountPercent > 100) {
      toast.error('Discount percent must be between 0 and 100');
      return;
    }

    const result = await Swal.fire({
      title: 'Save coupon settings?',
      text: settingsForm.couponActive
        ? `This coupon will be active as ${couponCode} with ${couponDiscountPercent}% off.`
        : 'This coupon will be saved as inactive.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#db2777',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const { data } = await API.patch('/settings', {
        couponCode,
        couponDiscountPercent,
        couponActive: Boolean(settingsForm.couponActive),
      });

      setSettingsForm({
        couponCode: String(data?.couponCode || couponCode).trim().toUpperCase(),
        couponDiscountPercent: Number(data?.couponDiscountPercent) || couponDiscountPercent,
        couponActive: Boolean(data?.couponActive),
      });
      toast.success('Coupon settings updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coupon settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Coupon / Voucher</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage the active coupon used by checkout validation.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse dark:border-gray-700 dark:bg-gray-800 h-64" />
      ) : (
        <form onSubmit={saveCouponSettings} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 space-y-5 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Backend Coupon Control</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Checkout will show invalid until this is active.</p>
            </div>
            <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={Boolean(settingsForm.couponActive)}
                onChange={(event) => setSettingsForm((prev) => ({ ...prev, couponActive: event.target.checked }))}
                className="accent-pink-500"
              />
              Active
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</label>
              <input
                type="text"
                value={settingsForm.couponCode}
                onChange={(event) => setSettingsForm((prev) => ({ ...prev, couponCode: event.target.value.toUpperCase() }))}
                placeholder="MOMIN"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Discount Percent</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settingsForm.couponDiscountPercent}
                onChange={(event) => setSettingsForm((prev) => ({ ...prev, couponDiscountPercent: event.target.value }))}
                placeholder="12"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-pink-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-600 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Coupon Settings'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CouponVoucher;
