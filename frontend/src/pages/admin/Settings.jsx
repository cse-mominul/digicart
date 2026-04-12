import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const validTabs = new Set(['delivery', 'company', 'site', 'users', 'payment']);

const resolveTab = (rawTab) => {
  const value = String(rawTab || '').toLowerCase();
  return validTabs.has(value) ? value : 'delivery';
};

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(resolveTab(searchParams.get('tab')));
  const { user: currentUser } = useAuth();
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
    siteWebsiteUrl: 'www.digicart.com',
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerEditForm, setCustomerEditForm] = useState({ name: '', email: '', phone: '' });
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({
    bkash: { enabled: true, number: '' },
    nogod: { enabled: true, number: '' },
    cod: { enabled: true },
    card: { enabled: false },
  });
  const [newPaymentMethod, setNewPaymentMethod] = useState({ name: '', enabled: true });
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  useEffect(() => {
    const tabFromUrl = resolveTab(searchParams.get('tab'));
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

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
          siteWebsiteUrl: data?.siteWebsiteUrl || 'www.digicart.com',
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateActiveTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const { data } = await API.get('/admin/users');
      const allUsers = Array.isArray(data) ? data : [];
      setCustomers(allUsers.filter((item) => item?.role === 'admin'));
    } catch {
      toast.error('Failed to load admin users');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchCustomers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'payment') {
      fetchPaymentSettings();
    }
  }, [activeTab]);

  const fetchPaymentSettings = async () => {
    try {
      const { data } = await API.get('/settings/payment');
      if (data?.paymentMethods) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      toast.error('Failed to load payment settings');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (id === currentUser?._id) {
      toast.error("You can't delete your own account");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this admin user?')) return;

    setDeletingCustomerId(id);
    try {
      await API.delete(`/admin/users/${id}`);
      setCustomers((prev) => prev.filter((item) => item._id !== id));
      toast.success('Admin user deleted successfully');
    } catch {
      toast.error('Failed to delete admin user');
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const openEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustomerEditForm({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
    });
  };

  const closeEditCustomer = () => {
    setEditingCustomer(null);
    setCustomerEditForm({ name: '', email: '', phone: '' });
  };

  const handleSaveCustomer = async (event) => {
    event.preventDefault();

    const name = customerEditForm.name.trim();
    const email = customerEditForm.email.trim().toLowerCase();
    const phone = customerEditForm.phone.trim();

    if (!name) {
      toast.error('User name is required');
      return;
    }

    if (!email) {
      toast.error('User email is required');
      return;
    }

    setSavingCustomer(true);
    try {
      const { data } = await API.put(`/admin/users/${editingCustomer._id}`, { name, email, phone });
      setCustomers((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      toast.success('Admin user updated successfully');
      closeEditCustomer();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin user');
    } finally {
      setSavingCustomer(false);
    }
  };

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
      siteWebsiteUrl: settingsForm.siteWebsiteUrl,
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
      siteWebsiteUrl: data?.siteWebsiteUrl || settingsForm.siteWebsiteUrl,
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

  const handleSavePaymentSettings = async (event) => {
    event.preventDefault();

    // Validate bKash number if enabled
    if (paymentMethods.bkash?.enabled && !paymentMethods.bkash?.number?.trim()) {
      toast.error('bKash number is required when enabled');
      return;
    }

    // Validate Nogod number if enabled
    if (paymentMethods.nogod?.enabled && !paymentMethods.nogod?.number?.trim()) {
      toast.error('Nogod number is required when enabled');
      return;
    }

    setSavingSettings(true);
    try {
      await API.patch('/settings/payment', { paymentMethods });
      toast.success('Payment settings updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTogglePaymentMethod = (methodKey) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [methodKey]: {
        ...prev[methodKey],
        enabled: !prev[methodKey]?.enabled,
      },
    }));
  };

  const handleUpdatePaymentNumber = (methodKey, number) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [methodKey]: {
        ...prev[methodKey],
        number,
      },
    }));
  };

  const handleAddPaymentMethod = async () => {
    const methodName = newPaymentMethod.name?.trim().toLowerCase();
    
    if (!methodName) {
      toast.error('Payment method name is required');
      return;
    }

    if (paymentMethods[methodName]) {
      toast.error('This payment method already exists');
      return;
    }

    setPaymentMethods((prev) => ({
      ...prev,
      [methodName]: {
        enabled: newPaymentMethod.enabled,
        number: '',
      },
    }));

    setNewPaymentMethod({ name: '', enabled: true });
    setShowAddPaymentMethod(false);
    toast.success(`${newPaymentMethod.name} added successfully`);
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
              onClick={() => updateActiveTab('delivery')}
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
              onClick={() => updateActiveTab('company')}
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
              onClick={() => updateActiveTab('site')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'site'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Site Settings
            </button>
            <button
              type="button"
              onClick={() => updateActiveTab('users')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Users
            </button>
            <button
              type="button"
              onClick={() => updateActiveTab('payment')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'payment'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Payments
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
          ) : activeTab === 'site' ? (
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

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={settingsForm.siteWebsiteUrl}
                    onChange={(event) =>
                      setSettingsForm((prev) => ({ ...prev, siteWebsiteUrl: event.target.value }))
                    }
                    placeholder="www.digicart.com"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
          ) : activeTab === 'payment' ? (
            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              <p className="text-sm text-gray-400">Configure payment methods and their credentials.</p>

              <div className="space-y-4">
                {/* bKash Payment Method */}
                <div className="border border-gray-700 rounded-xl p-4 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-100">bKash</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-pink-500/20 text-pink-300">Mobile Payment</span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentMethods.bkash?.enabled || false}
                        onChange={() => handleTogglePaymentMethod('bkash')}
                        className="w-4 h-4 rounded border-gray-600 accent-pink-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        {paymentMethods.bkash?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                  {paymentMethods.bkash?.enabled && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">bKash Number</label>
                      <input
                        type="text"
                        placeholder="01XXXXXXXXX"
                        value={paymentMethods.bkash?.number || ''}
                        onChange={(e) => handleUpdatePaymentNumber('bkash', e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  )}
                </div>

                {/* Nogod Payment Method */}
                <div className="border border-gray-700 rounded-xl p-4 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-100">Nagad</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-300">Mobile Payment</span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentMethods.nogod?.enabled || false}
                        onChange={() => handleTogglePaymentMethod('nogod')}
                        className="w-4 h-4 rounded border-gray-600 accent-pink-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        {paymentMethods.nogod?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                  {paymentMethods.nogod?.enabled && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Nagad Number</label>
                      <input
                        type="text"
                        placeholder="01XXXXXXXXX"
                        value={paymentMethods.nogod?.number || ''}
                        onChange={(e) => handleUpdatePaymentNumber('nogod', e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div className="border border-gray-700 rounded-xl p-4 bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-100">Cash on Delivery</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-slate-500/20 text-slate-300">Cash</span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentMethods.cod?.enabled || false}
                        onChange={() => handleTogglePaymentMethod('cod')}
                        className="w-4 h-4 rounded border-gray-600 accent-pink-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        {paymentMethods.cod?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Card Payment */}
                <div className="border border-gray-700 rounded-xl p-4 bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-100">Credit/Debit Card</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">Card</span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentMethods.card?.enabled || false}
                        onChange={() => handleTogglePaymentMethod('card')}
                        className="w-4 h-4 rounded border-gray-600 accent-pink-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        {paymentMethods.card?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Additional Payment Methods */}
                {Object.entries(paymentMethods).map(([key, method]) => {
                  if (!['bkash', 'nogod', 'cod', 'card'].includes(key)) {
                    return (
                      <div key={key} className="border border-gray-700 rounded-xl p-4 bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-100 capitalize">{key}</h3>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">Custom</span>
                          </div>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={method?.enabled || false}
                              onChange={() => handleTogglePaymentMethod(key)}
                              className="w-4 h-4 rounded border-gray-600 accent-pink-500"
                            />
                            <span className="ml-2 text-sm text-gray-300">
                              {method?.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Add New Payment Method */}
              <div className="border-t border-gray-700 pt-4">
                {!showAddPaymentMethod ? (
                  <button
                    type="button"
                    onClick={() => setShowAddPaymentMethod(true)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-medium text-sm transition"
                  >
                    + Add Payment Method
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="e.g., Stripe, PayPal"
                        value={newPaymentMethod.name}
                        onChange={(e) => setNewPaymentMethod((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-lg border border-gray-700 bg-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <label className="flex items-center gap-2 px-3">
                      <input
                        type="checkbox"
                        checked={newPaymentMethod.enabled}
                        onChange={(e) => setNewPaymentMethod((prev) => ({ ...prev, enabled: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-600 accent-pink-500"
                      />
                      <span className="text-sm text-gray-300">Enable</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPaymentMethod}
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium text-sm transition"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPaymentMethod(false);
                        setNewPaymentMethod({ name: '', enabled: true });
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-medium text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full md:w-auto rounded-xl bg-pink-500 text-white px-6 py-2.5 font-semibold hover:bg-pink-600 transition-colors disabled:opacity-60"
              >
                {savingSettings ? 'Saving...' : 'Save Payment Settings'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Only admin user accounts are listed here.</p>

              {loadingCustomers ? (
                <div className="rounded-xl border border-gray-700 bg-gray-800 h-48 animate-pulse" />
              ) : (
                <div className="rounded-xl border border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800 text-gray-300 text-left">
                        <tr>
                          <th className="px-5 py-3">Customer</th>
                          <th className="px-5 py-3">Role</th>
                          <th className="px-5 py-3">Email</th>
                          <th className="px-5 py-3">Phone</th>
                          <th className="px-5 py-3">Joined</th>
                          <th className="px-5 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer._id} className="border-t border-gray-700 hover:bg-gray-800/70">
                            <td className="px-5 py-3 text-gray-100 font-medium">{customer.name}</td>
                            <td className="px-5 py-3 text-gray-300">{customer.role}</td>
                            <td className="px-5 py-3 text-gray-300">{customer.email}</td>
                            <td className="px-5 py-3 text-gray-300">{customer.phone || 'N/A'}</td>
                            <td className="px-5 py-3 text-gray-400 text-xs">
                              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditCustomer(customer)}
                                  className="rounded-md bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200 hover:bg-indigo-500/30"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingCustomerId === customer._id || customer._id === currentUser?._id}
                                  onClick={() => handleDeleteCustomer(customer._id)}
                                  className="rounded-md bg-red-500/15 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                                >
                                  {deletingCustomerId === customer._id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {customers.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-gray-400">
                              No admin users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Admin User</h3>
              <button
                type="button"
                onClick={closeEditCustomer}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-300">Name</label>
                <input
                  type="text"
                  value={customerEditForm.name}
                  onChange={(event) => setCustomerEditForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-300">Email</label>
                <input
                  type="email"
                  value={customerEditForm.email}
                  onChange={(event) => setCustomerEditForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-300">Phone</label>
                <input
                  type="text"
                  value={customerEditForm.phone}
                  onChange={(event) => setCustomerEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditCustomer}
                  className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCustomer}
                  className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
                >
                  {savingCustomer ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;