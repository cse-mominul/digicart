import Swal from 'sweetalert2';

export const showAddToCartSuccess = (productName = 'Item') => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: `${productName} added to cart`,
    showConfirmButton: false,
    timer: 1600,
    timerProgressBar: true,
  });
};
