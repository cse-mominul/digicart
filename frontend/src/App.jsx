import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import ProductDetails from './pages/ProductDetails';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import CategoryManager from './pages/admin/CategoryManager';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';

const UserLayout = ({ children }) => (
  <div className="flex flex-col gap-0">
    <Navbar />
    {children}
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Routes>
        {/* Public / User Routes */}
        <Route path="/" element={<UserLayout><Home /></UserLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wishlist" element={<UserLayout><Wishlist /></UserLayout>} />
        <Route path="/product/:id" element={<UserLayout><ProductDetails /></UserLayout>} />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <UserLayout><MyOrders /></UserLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes — nested under AdminLayout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
