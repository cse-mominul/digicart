import Swal from 'sweetalert2';

/**
 * Show SweetAlert confirmation when order is placed successfully
 * @param {Function} navigate - React Router's useNavigate hook
 */
export const showOrderSuccess = async (navigate) => {
  await Swal.fire({
    icon: 'success',
    title: 'Order Placed Successfully!',
    text: 'Your order has been placed. You will receive a confirmation email shortly.',
    confirmButtonText: 'Continue Shopping',
    confirmButtonColor: '#3085d6',
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
  navigate('/');
};
