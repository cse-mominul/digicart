import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [settingsForm, setSettingsForm] = useState({
    insideDhakaCharge: 80,
    outsideDhakaCharge: 120,
    contactAddress: '125 Market Street, Gulshan Avenue, Dhaka 1212',
    contactPhone: '+880 1700-123456',
    supportEmail: 'support@digicart.com',
    salesEmail: 'sales@digicart.com',
    siteTitle: 'DigiCart',
    siteLogoUrl: '',
    faviconUrl: '',
    siteSlogan: 'Rebranded Sellzy',
    footerCopyrightText: '© 2026 DigiCart. All rights reserved.',
    siteDescription: 'DigiCart helps modern shoppers discover top-rated products at honest prices, fast delivery, and smooth checkout experiences.',
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
          siteTitle: data?.siteTitle || 'DigiCart',
          siteLogoUrl: data?.siteLogoUrl || '',
          faviconUrl: data?.faviconUrl || '',
          siteSlogan: data?.siteSlogan || 'Rebranded Sellzy',
          footerCopyrightText: data?.footerCopyrightText || '© 2026 DigiCart. All rights reserved.',
          siteDescription: data?.siteDescription || 'DigiCart helps modern shoppers discover top-rated products at honest prices, fast delivery, and smooth checkout experiences.',
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const saveSettings = async (successMessage) => {
    const insideDhakaCharge = Number(settingsForm.insideDhakaCharge);
    const outsideDhakaCharge = Number(settingsForm.outsideDhakaCharge);

    const { data } = await API.patch('/settings', {
      insideDhakaCharge,
      outsideDhakaCharge,
      contactAddress: settingsForm.contactAddress,
      contactPhone: settingsForm.contactPhone,
      supportEmail: settingsForm.supportEmail,
      salesEmail: settingsForm.salesEmail,
      siteTitle: settingsForm.siteTitle,
      siteLogoUrl: settingsForm.siteLogoUrl,
      faviconUrl: settingsForm.faviconUrl,
      siteSlogan: settingsForm.siteSlogan,
      footerCopyrightText: settingsForm.footerCopyrightText,
      siteDescription: settingsForm.siteDescription,
    });

    setSettingsForm({
      insideDhakaCharge: Number(data?.insideDhakaCharge) || insideDhakaCharge,
      outsideDhakaCharge: Number(data?.outsideDhakaCharge) || outsideDhakaCharge,
      contactAddress: data?.contactAddress || settingsForm.contactAddress,
      contactPhone: data?.contactPhone || settingsForm.contactPhone,
      supportEmail: data?.supportEmail || settingsForm.supportEmail,
      salesEmail: data?.salesEmail || settingsForm.salesEmail,
      siteTitle: data?.siteTitle || settingsForm.siteTitle,
      siteLogoUrl: data?.siteLogoUrl || settingsForm.siteLogoUrl,
      faviconUrl: data?.faviconUrl || settingsForm.faviconUrl,
      siteSlogan: data?.siteSlogan || settingsForm.siteSlogan,
      footerCopyrightText: data?.footerCopyrightText || settingsForm.footerCopyrightText,
      siteDescription: data?.siteDescription || settingsForm.siteDescription,
    });

    toast.success(successMessage);
  };

  const handleSaveDeliverySettings = async (event) => {
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

    setSavingSettings(true);
    try {
      await saveSettings('Delivery settings updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveCompanySettings = async (event) => {
    event.preventDefault();

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
      await saveSettings('Company settings updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveSiteSettings = async (event) => {
    event.preventDefault();

    if (!settingsForm.siteTitle?.trim()) {
      toast.error('Site title is required');
      return;
    }

    setSavingSettings(true);
    try {
      await saveSettings('Site settings updated');
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
          <div className="mb-5 inline-flex rounded-xl border border-gray-700 bg-gray-800 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('delivery')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'delivery'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Delivery Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('company')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'company'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Company Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('site')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'site'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Site Settings
            </button>
          </div>

          {activeTab === 'delivery' ? (
            <form onSubmit={handleSaveDeliverySettings} className="space-y-5">
              <p className="text-sm text-gray-400">Configure delivery charges for checkout.</p>

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

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full md:w-auto rounded-xl bg-pink-500 text-white px-6 py-2.5 font-semibold hover:bg-pink-600 transition-colors disabled:opacity-60"
              >
                {savingSettings ? 'Saving...' : 'Save Delivery Settings'}
              </button>
            </form>
          ) : activeTab === 'company' ? (
            <form onSubmit={handleSaveCompanySettings} className="space-y-5">
              <p className="text-sm text-gray-400">Configure company contact information for the footer.</p>

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
                {savingSettings ? 'Saving...' : 'Save Company Settings'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveSiteSettings} className="space-y-5">
              <p className="text-sm text-gray-400">Configure site title, header logo, and browser favicon.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Site Title</label>
                  <input
                    type="text"
                    value={settingsForm.siteTitle}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, siteTitle: event.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Site Slogan</label>
                  <input
                    type="text"
                    value={settingsForm.siteSlogan}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, siteSlogan: event.target.value }))
                    }
                    placeholder="Your brand tagline"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Footer Copyright Text</label>
                  <input
                    type="text"
                    value={settingsForm.footerCopyrightText}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, footerCopyrightText: event.target.value }))
                    }
                    placeholder="© 2026 DigiCart. All rights reserved."
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Footer Description</label>
                  <textarea
                    rows="3"
                    value={settingsForm.siteDescription}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, siteDescription: event.target.value }))
                    }
                    placeholder="Short brand description shown in footer"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={settingsForm.siteLogoUrl}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, siteLogoUrl: event.target.value }))
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Favicon URL</label>
                  <input
                    type="url"
                    value={settingsForm.faviconUrl}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, faviconUrl: event.target.value }))
                    }
                    placeholder="https://example.com/favicon.ico"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full md:w-auto rounded-xl bg-pink-500 text-white px-6 py-2.5 font-semibold hover:bg-pink-600 transition-colors disabled:opacity-60"
              >
                {savingSettings ? 'Saving...' : 'Save Site Settings'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;