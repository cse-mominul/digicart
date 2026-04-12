import { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

const ITEMS_PER_PAGE = 10;

const paymentMethodColors = {
  bkash: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  nogod: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  cod: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  card: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const Payments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders');
      // Filter orders that have payment info
      const paymentsData = Array.isArray(data)
        ? data.filter(order => order.paymentMethod && order.paymentTrxId && order.paymentSenderNumber)
        : [];
      setOrders(paymentsData);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by payment method
    if (filterMethod !== 'All') {
      result = result.filter(order => order.paymentMethod === filterMethod.toLowerCase());
    }

    // Filter by search term (customer name, email, order ID, TrxID, sender number)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(order => {
        const customerName = (order.user?.name || order.customer?.name || '').toLowerCase();
        const customerEmail = (order.user?.email || order.customer?.email || '').toLowerCase();
        const orderId = String(order._id || '').toLowerCase();
        const trxId = String(order.paymentTrxId || '').toLowerCase();
        const senderNumber = String(order.paymentSenderNumber || '').toLowerCase();

        return (
          customerName.includes(search) ||
          customerEmail.includes(search) ||
          orderId.includes(search) ||
          trxId.includes(search) ||
          senderNumber.includes(search)
        );
      });
    }

    return result;
  }, [orders, filterMethod, searchTerm]);

  const paginatedOrders = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied!`);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Payment Transactions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Total Payments: <span className="font-semibold text-orange-600">{filteredOrders.length}</span>
        </p>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by customer, order ID, TrxID, or sender number..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select
          value={filterMethod}
          onChange={(e) => {
            setFilterMethod(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="All">All Payment Methods</option>
          <option value="bkash">bKash</option>
          <option value="nogod">Nagad</option>
          <option value="cod">Cash on Delivery</option>
          <option value="card">Card</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Payment Method
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Transaction ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Sender Number
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Date
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => {
                const customerName = order.user?.name || order.customer?.name || 'N/A';
                const customerEmail = order.user?.email || order.customer?.email || 'N/A';
                const createdDate = new Date(order.createdAt).toLocaleDateString();

                return (
                  <tr
                    key={order._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {String(order._id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-gray-900 dark:text-gray-100 font-medium">{customerName}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs">{customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {formatPrice(order.totalAmount || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          paymentMethodColors[order.paymentMethod] ||
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}
                      >
                        {order.paymentMethod === 'bkash'
                          ? 'bKash'
                          : order.paymentMethod === 'nogod'
                          ? 'Nagad'
                          : order.paymentMethod === 'cod'
                          ? 'Cash on Delivery'
                          : 'Card'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-gray-900 dark:text-gray-100">
                          {String(order.paymentTrxId).slice(0, 12)}...
                        </span>
                        <button
                          onClick={() =>
                            handleCopyToClipboard(order.paymentTrxId, 'Transaction ID')
                          }
                          className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 p-1"
                          title="Copy Transaction ID"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-gray-900 dark:text-gray-100">
                          {String(order.paymentSenderNumber).slice(0, 8)}...
                        </span>
                        <button
                          onClick={() =>
                            handleCopyToClipboard(order.paymentSenderNumber, 'Sender Number')
                          }
                          className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 p-1"
                          title="Copy Sender Number"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {createdDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => handleCopyToClipboard(
                          `Order: ${order._id}\nCustomer: ${customerName}\nAmount: ${formatPrice(order.totalAmount || 0)}\nPayment: ${order.paymentMethod}\nTrxID: ${order.paymentTrxId}\nSender: ${order.paymentSenderNumber}`,
                          'Payment Details'
                        )}
                        className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium text-xs"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                  {searchTerm || filterMethod !== 'All' ? 'No payments found' : 'No payment transactions yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Payments;
