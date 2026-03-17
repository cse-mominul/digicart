import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { formatPrice } from '../../utils/formatPrice';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const StatCard = ({ title, value, icon, borderColor }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 ${borderColor}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
      </div>
      <div className="text-4xl opacity-80">{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          API.get('/products'),
          API.get('/orders'),
          API.get('/admin/users'),
        ]);

        const revenue = ordersRes.data.reduce((sum, o) => sum + o.totalAmount, 0);
        setStats({
          products: productsRes.data.length,
          orders: ordersRes.data.length,
          users: usersRes.data.length,
          revenue,
        });
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Products" value={stats.products} icon="📦" borderColor="border-indigo-500" />
            <StatCard title="Total Orders" value={stats.orders} icon="🛒" borderColor="border-green-500" />
            <StatCard title="Total Users" value={stats.users} icon="👥" borderColor="border-purple-500" />
            <StatCard title="Revenue" value={formatPrice(stats.revenue)} icon="💰" borderColor="border-yellow-500" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-left">
                    <th className="py-2 pr-4">Order ID</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 pr-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                        {order.user?.name || 'N/A'}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-indigo-600">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">No orders yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
