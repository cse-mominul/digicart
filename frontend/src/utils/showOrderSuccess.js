import toast from 'react-hot-toast';

/**
 * Redirect to home after order placement without showing alert
 * @param {Function} navigate - React Router's useNavigate hook
 */
export const showOrderSuccess = async (navigate) => {
  toast.success('Order placed successfully');
  navigate('/');
};
