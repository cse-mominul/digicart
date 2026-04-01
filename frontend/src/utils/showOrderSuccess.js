import Swal from 'sweetalert2';

/**
 * Display a minimalist Apple-inspired order success alert
 * @param {Function} navigate - React Router's useNavigate hook
 */
export const showOrderSuccess = async (navigate) => {
  await Swal.fire({
    icon: 'success',
    title: 'Order Placed Successfully',
    html: '<p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">Your order has been confirmed and will be shipped soon.</p>',
    confirmButtonText: 'Continue Shopping',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      container: 'apple-alert-container',
      popup: 'apple-alert-popup',
      title: 'apple-alert-title',
      htmlContainer: 'apple-alert-html',
      confirmButton: 'apple-alert-button',
      icon: 'apple-alert-icon',
    },
    didOpen: () => {
      // Add custom styling via inline styles to the icon
      const icon = Swal.getIcon();
      if (icon) {
        icon.style.color = '#34C759';
        icon.style.borderColor = '#34C759';
        icon.style.fontSize = '60px';
      }
    },
  }).then(() => {
    navigate('/');
  });
};

// Export a function to inject required styles
export const initializeAppleAlertStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .apple-alert-container {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .apple-alert-popup {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      padding: 32px 28px;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .apple-alert-title {
      font-size: 22px;
      font-weight: 600;
      color: #000;
      margin: 16px 0 8px 0;
      letter-spacing: -0.5px;
    }

    .apple-alert-html {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
      margin: 12px 0 0 0;
    }

    .apple-alert-icon {
      width: 60px !important;
      height: 60px !important;
      margin: 0 auto 16px;
    }

    .apple-alert-icon.swal2-success [class^='swal2-success-circular-line'],
    .apple-alert-icon.swal2-success [class$='success-ring'] {
      position: relative;
    }

    .apple-alert-button {
      background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
      transition: all 0.2s ease;
      padding-left: 28px;
      padding-right: 28px;
      margin-top: 20px;
    }

    .apple-alert-button:hover {
      background: linear-gradient(135deg, #0051D5 0%, #003A99 100%);
      box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
      transform: translateY(-1px);
    }

    .apple-alert-button:active {
      transform: translateY(0);
    }

    .apple-alert-button:focus {
      outline: none;
    }

    /* Modal overlay with glassmorphism */
    .swal2-backdrop {
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
  `;
  
  document.head.appendChild(style);
};
