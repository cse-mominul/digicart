import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { to: '/admin/products', label: 'Products', end: false, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  )},
  { to: '/admin/orders', label: 'Orders', end: false, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )},
  { to: '/admin/payments', label: 'Payments', end: false, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0 1 1 0 012 0zM7 6h.01M11 6h.01M15 6h.01M6 10a1 1 0 11-2 0 1 1 0 012 0zM13 16a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  )},
  { to: '/admin/abandoned-carts', label: 'Abandoned Carts', end: false, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13M9 17a2 2 0 104 0m2 0a2 2 0 104 0M12 9v4m0 0l-2-2m2 2l2-2" />
    </svg>
  )},
  { to: '/admin/reviews', label: 'Reviews', end: false, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h6m6 2a2 2 0 01-2 2H6l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v12z" />
    </svg>
  )},
  { to: '/admin/customers', label: 'Customers', end: false, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-1a4 4 0 00-5-3.87M9 20H4v-1a4 4 0 015-3.87m8-6.13a4 4 0 11-8 0 4 4 0 018 0zM7 8a4 4 0 10-8 0 4 4 0 008 0z" />
    </svg>
  )},
  { to: '/admin/campaigns', label: 'Campaigns', end: false, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { to: '/admin/reports', label: 'Reports', end: false, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6m4 6V7m4 10v-3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )},
  { to: '/admin/settings', label: 'Settings', end: false, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317a1 1 0 011.35-.936l.41.163a1 1 0 00.73 0l.41-.163a1 1 0 011.35.936l.05.443a1 1 0 00.575.785l.39.195a1 1 0 01.453 1.33l-.2.397a1 1 0 000 .894l.2.397a1 1 0 01-.453 1.33l-.39.195a1 1 0 00-.575.785l-.05.443a1 1 0 01-1.35.936l-.41-.163a1 1 0 00-.73 0l-.41.163a1 1 0 01-1.35-.936l-.05-.443a1 1 0 00-.575-.785l-.39-.195a1 1 0 01-.453-1.33l.2-.397a1 1 0 000-.894l-.2-.397a1 1 0 01.453-1.33l.39-.195a1 1 0 00.575-.785l.05-.443z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  )},
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isReportSectionOpen =
    location.pathname.startsWith('/admin/sales-report') ||
    location.pathname.startsWith('/admin/expenses');
  const [reportDropdownOpen, setReportDropdownOpen] = useState(isReportSectionOpen);

  const isOrderSectionOpen =
    location.pathname.startsWith('/admin/orders') ||
    location.pathname.startsWith('/admin/shipping-delays') ||
    location.pathname.startsWith('/admin/payment-failures') ||
    location.pathname.startsWith('/admin/refund-requests');
  const [ordersDropdownOpen, setOrdersDropdownOpen] = useState(isOrderSectionOpen);
  const isProductsSectionOpen = location.pathname.startsWith('/admin/products') || location.pathname.startsWith('/admin/coupons');
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(isProductsSectionOpen);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const formatNotificationTime = (value) => {
    if (!value) return 'Now';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Now';
    return date.toLocaleString();
  };

  const fetchNotifications = async (showError = false) => {
    setNotificationsLoading(true);
    try {
      const { data } = await API.get('/admin/notifications?limit=10');
      setNotifications(Array.isArray(data?.items) ? data.items : []);
      setUnreadCount(Number(data?.unreadCount) || 0);
    } catch {
      if (showError) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.put('/admin/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, readByAdmin: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkSingleRead = async (notificationId) => {
    if (!notificationId) return;

    try {
      await API.put(`/admin/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.map((item) => (
        item._id === notificationId ? { ...item, readByAdmin: true } : item
      )));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to update notification');
    }
  };

  useEffect(() => {
    if (isReportSectionOpen) {
      setReportDropdownOpen(true);
    }
  }, [isReportSectionOpen]);

  useEffect(() => {
    if (isOrderSectionOpen) {
      setOrdersDropdownOpen(true);
    }
  }, [isOrderSectionOpen]);

  useEffect(() => {
    if (isProductsSectionOpen) {
      setProductsDropdownOpen(true);
    }
  }, [isProductsSectionOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-16'
          } bg-gray-900 dark:bg-black text-white flex flex-col transition-all duration-300 flex-shrink-0`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 min-h-[64px]">
            {sidebarOpen && (
              <span className="text-lg font-bold text-indigo-400 truncate">DigiCart Admin</span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition-colors ml-auto flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {navItems.map((item) => (
              <div key={item.to}>
                {item.to === '/admin/reports' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setReportDropdownOpen((prev) => !prev)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        sidebarOpen ? '' : 'justify-center'
                      } ${
                        isReportSectionOpen
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${reportDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>

                    {sidebarOpen && reportDropdownOpen && (
                      <div className="mt-1 space-y-1">
                        <NavLink
                          to="/admin/sales-report"
                          className={({ isActive }) =>
                            `ml-10 mr-2 flex items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          Sales reports
                        </NavLink>
                        <NavLink
                          to="/admin/expenses"
                          className={({ isActive }) =>
                            `ml-10 mr-2 flex items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          Expense
                        </NavLink>
                      </div>
                    )}
                  </>
                ) : item.to === '/admin/products' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setProductsDropdownOpen((prev) => !prev)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        sidebarOpen ? '' : 'justify-center'
                      } ${
                        isProductsSectionOpen
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>

                    {sidebarOpen && productsDropdownOpen && (
                      <div className="mt-1 space-y-1">
                        <NavLink
                          to="/admin/products"
                          end
                          className={({ isActive }) =>
                            `ml-10 mr-2 flex items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          All Products
                        </NavLink>
                        <NavLink
                          to="/admin/coupons"
                          className={({ isActive }) =>
                            `ml-10 mr-2 flex items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          Coupon / Voucher
                        </NavLink>
                        <NavLink
                          to="/admin/categories"
                          className={({ isActive }) =>
                            `ml-10 mr-2 flex items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          Category
                        </NavLink>
                      </div>
                    )}
                  </>
                ) : item.to === '/admin/orders' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setOrdersDropdownOpen((prev) => !prev)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        sidebarOpen ? '' : 'justify-center'
                      } ${
                        isOrderSectionOpen
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${ordersDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>

                    {sidebarOpen && ordersDropdownOpen && (
                      <div className="mt-1 space-y-1">
                        <NavLink
                          to="/admin/orders"
                          end
                          className={({ isActive }) =>
                            `ml-10 mr-2 flex items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          All Orders
                        </NavLink>
                        <NavLink
                          to="/admin/shipping-delays"
                          className={({ isActive }) =>
                            `ml-10 mr-2 flex items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          Shipping Delays
                        </NavLink>
                        <NavLink
                          to="/admin/payment-failures"
                          className={({ isActive }) =>
                            `ml-10 mr-2 flex items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          Payment Failures
                        </NavLink>
                        <NavLink
                          to="/admin/refund-requests"
                          className={({ isActive }) =>
                            `ml-10 mr-2 flex items-center rounded-lg px-3 py-2 text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                          }
                        >
                          Refund Requests
                        </NavLink>
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        sidebarOpen ? '' : 'justify-center'
                      } ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* User Info */}
          {sidebarOpen && (
            <div className="p-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Logged in as</p>
              <p className="text-sm font-semibold text-white mt-1 truncate">{user?.name}</p>
              <p className="text-xs text-indigo-400">{user?.email}</p>
            </div>
          )}
        </aside>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm px-6 flex justify-between items-center flex-shrink-0 h-16">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Admin Panel</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    const next = !notificationsOpen;
                    setNotificationsOpen(next);
                    if (next) fetchNotifications(true);
                  }}
                  className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Notifications"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">Notifications</p>
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="p-3 text-xs text-gray-500 dark:text-gray-400">Loading notifications...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-3 text-xs text-gray-500 dark:text-gray-400">No notifications yet</div>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => {
                              if (!item.readByAdmin) {
                                handleMarkSingleRead(item._id);
                              }

                              if (item.type === 'order' && item.orderId) {
                                navigate(`/admin/orders/${item.orderId}`);
                                setNotificationsOpen(false);
                              }
                            }}
                            className={`w-full border-b border-gray-100 px-3 py-2 text-left transition-colors dark:border-gray-700 ${
                              item.readByAdmin
                                ? 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/40'
                                : 'bg-indigo-50/60 hover:bg-indigo-50 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30'
                            }`}
                          >
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{item.title || 'Notification'}</p>
                            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">{item.message || ''}</p>
                            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{formatNotificationTime(item.createdAt)}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {dark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
