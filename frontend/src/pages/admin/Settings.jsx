import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settingsForm, setSettingsForm] = useState({
    insideDhakaCharge: 80,
    outsideDhakaCharge: 120,
    contactAddress: '125 Market Street, Gulshan Avenue, Dhaka 1212',
    contactPhone: '+880 1700-123456',
    supportEmail: 'support@digicart.com',
    salesEmail: 'sales@digicart.com',
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get('/settings');
        setSettingsForm({
          insideDhakaCharge: Number(data?.insideDhakaCharge) || 80,
          outsideDhakaCharge: Number(data?.outsideDhakaCharge) || 120,
          contactAddress: data?.contactAddress || '125 Market Street, Gulshan Avenue, Dhaka 1212',
          contactPhone: data?.contactPhone || '+880 1700-123456',
          supportEmail: data?.supportEmail || 'support@digicart.com',
          salesEmail: data?.salesEmail || 'sales@digicart.com',
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async (event) => {
    event.preventDefault();

    const insideDhakaCharge = Number(settingsForm.insideDhakaCharge);
    const outsideDhakaCharge = Number(settingsForm.outsideDhakaCharge);

    if (!Number.isFinite(insideDhakaCharge) || insideDhakaCharge < 0) {
      toast.error('Inside Dhaka charge must be a valid number');
      return;
    }

    if (!Number.isFinite(outsideDhakaCharge) || outsideDhakaCharge < 0) {
      toast.error('Outside Dhaka charge must be a valid number');
      return;
    }

    if (!settingsForm.contactAddress?.trim()) {
      toast.error('Contact address is required');
      return;
    }

    if (!settingsForm.contactPhone?.trim()) {
      toast.error('Contact phone is required');
      return;
    }

    if (!settingsForm.supportEmail?.trim()) {
      toast.error('Support email is required');
      return;
    }

    if (!settingsForm.salesEmail?.trim()) {
      toast.error('Sales email is required');
      return;
    }

    setSavingSettings(true);
    try {
      const { data } = await API.patch('/settings', {
        insideDhakaCharge,
        outsideDhakaCharge,
        contactAddress: settingsForm.contactAddress,
        contactPhone: settingsForm.contactPhone,
        supportEmail: settingsForm.supportEmail,
        salesEmail: settingsForm.salesEmail,
      });

      setSettingsForm({
        insideDhakaCharge: Number(data?.insideDhakaCharge) || insideDhakaCharge,
        outsideDhakaCharge: Number(data?.outsideDhakaCharge) || outsideDhakaCharge,
        contactAddress: data?.contactAddress || settingsForm.contactAddress,
        contactPhone: data?.contactPhone || settingsForm.contactPhone,
        supportEmail: data?.supportEmail || settingsForm.supportEmail,
        salesEmail: data?.salesEmail || settingsForm.salesEmail,
      });

      toast.success('Delivery charges updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h2>

      {loading ? (
        <div className="bg-gray-900 dark:bg-black border border-gray-800 rounded-2xl h-40 animate-pulse" />
      ) : (
        <div className="bg-gray-900 dark:bg-black border border-gray-800 rounded-2xl shadow-md p-6">
          <p className="text-sm text-gray-400 mb-5">Configure default delivery charges for landing page checkout.</p>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Inside Dhaka Charge</label>
                <input
                  type="number"
                  min="0"
                  value={settingsForm.insideDhakaCharge}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({ ...prev, insideDhakaCharge: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Outside Dhaka Charge</label>
                <input
                  type="number"
                  min="0"
                  value={settingsForm.outsideDhakaCharge}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({ ...prev, outsideDhakaCharge: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">Contact Address</label>
                <input
                  type="text"
                  value={settingsForm.contactAddress}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({ ...prev, contactAddress: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={settingsForm.contactPhone}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({ ...prev, contactPhone: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settingsForm.supportEmail}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({ ...prev, supportEmail: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Sales Email</label>
                <input
                  type="email"
                  value={settingsForm.salesEmail}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({ ...prev, salesEmail: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full md:w-auto rounded-xl bg-pink-500 text-white px-6 py-2.5 font-semibold hover:bg-pink-600 transition-colors disabled:opacity-60"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;