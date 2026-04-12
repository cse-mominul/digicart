import { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';
import Swal from 'sweetalert2';

const ITEMS_PER_PAGE = 10;

const paymentMethodColors = {
  bkash: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  nogod: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  cod: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  card: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const transactionStatusColors = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const Payments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterTransactionStatus, setFilterTransactionStatus] = useState('All');
  const [updatingStatusId, setUpdatingStatusId] = useState('');

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

    // Filter by transaction status
    if (filterTransactionStatus !== 'All') {
      result = result.filter((order) => {
        const status = String(order.paymentVerificationStatus || '').trim() || 'Pending';
        return status === filterTransactionStatus;
      });
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
  }, [orders, filterMethod, filterTransactionStatus, searchTerm]);

  const paymentSummary = useMemo(() => {
    const partialCustomerKeys = new Set();
    const paidCustomerKeys = new Set();

    let totalCollected = 0;
    let totalDue = 0;
    let partialOrders = 0;

    filteredOrders.forEach((order) => {
      const totalAmount = Number(order.totalAmount) || 0;
      const amountPaid = Number(order.amountPaid) || 0;
      const normalizedPaid = Math.min(Math.max(amountPaid, 0), totalAmount);
      const dueAmount = Math.max(totalAmount - normalizedPaid, 0);

      totalCollected += normalizedPaid;
      totalDue += dueAmount;

      const customerKey =
        order.user?._id ||
        order.user?.email ||
        order.customer?.email ||
        order.customer?.phone ||
        order._id;

      if (normalizedPaid > 0) {
        paidCustomerKeys.add(customerKey);
      }

      if (order.paymentStatus === 'Partial') {
        partialOrders += 1;
        partialCustomerKeys.add(customerKey);
      }
    });

    return {
      totalCollected,
      totalDue,
      paidCustomers: paidCustomerKeys.size,
      partialOrders,
      partialCustomers: partialCustomerKeys.size,
    };
  }, [filteredOrders]);

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

  const handleUpdateTransactionStatus = async (orderId, nextStatus) => {
    const order = orders.find((item) => item._id === orderId);
    const currentStatus = String(order?.paymentVerificationStatus || '').trim() || 'Pending';

    if (currentStatus === nextStatus) {
      return;
    }

    const confirmation = await Swal.fire({
      title: `Set transaction status to ${nextStatus}?`,
      text: nextStatus === 'Success'
        ? 'This will confirm the submitted payment and mark payment as paid.'
        : 'This will keep this payment in pending verification state.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setUpdatingStatusId(orderId);
    try {
      const { data } = await API.put(`/orders/${orderId}/transaction-status`, { status: nextStatus });

      setOrders((prev) => prev.map((item) => {
        if (item._id !== orderId) return item;

        return {
          ...item,
          paymentVerificationStatus: data?.paymentVerificationStatus || nextStatus,
          paymentStatus: data?.paymentStatus || item.paymentStatus,
          amountPaid: typeof data?.amountPaid === 'number' ? data.amountPaid : item.amountPaid,
          isPaid: typeof data?.isPaid === 'boolean' ? data.isPaid : item.isPaid,
        };
      }));

      toast.success('Transaction status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update transaction status');
    } finally {
      setUpdatingStatusId('');
    }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Total Paid</p>
          <p className="mt-1 text-xl font-bold text-emerald-800 dark:text-emerald-200">{formatPrice(paymentSummary.totalCollected)}</p>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">Total Due</p>
          <p className="mt-1 text-xl font-bold text-rose-800 dark:text-rose-200">{formatPrice(paymentSummary.totalDue)}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Customers Paid</p>
          <p className="mt-1 text-xl font-bold text-blue-800 dark:text-blue-200">{paymentSummary.paidCustomers}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Partial Orders</p>
          <p className="mt-1 text-xl font-bold text-amber-800 dark:text-amber-200">{paymentSummary.partialOrders}</p>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-900/40 dark:bg-violet-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">Partial Customers</p>
          <p className="mt-1 text-xl font-bold text-violet-800 dark:text-violet-200">{paymentSummary.partialCustomers}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        <select
          value={filterTransactionStatus}
          onChange={(e) => {
            setFilterTransactionStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Success">Success</option>
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Status
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
                const transactionStatus = String(order.paymentVerificationStatus || '').trim() || 'Pending';

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
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            transactionStatusColors[transactionStatus] ||
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}
                        >
                          {transactionStatus}
                        </span>
                        <select
                          value={transactionStatus}
                          onChange={(e) => handleUpdateTransactionStatus(order._id, e.target.value)}
                          disabled={updatingStatusId === order._id}
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Success">Success</option>
                        </select>
                      </div>
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
                <td colSpan="9" className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                  {searchTerm || filterMethod !== 'All' || filterTransactionStatus !== 'All' ? 'No payments found' : 'No payment transactions yet'}
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
