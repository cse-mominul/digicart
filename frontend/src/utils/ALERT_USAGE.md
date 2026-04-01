/**
 * USAGE EXAMPLE - Integration Guide
 * 
 * 1. In your main App.jsx or root component, initialize the styles:
 * 
 *    import { initializeAppleAlertStyles } from './utils/showOrderSuccess';
 *    
 *    useEffect(() => {
 *      initializeAppleAlertStyles();
 *    }, []);
 * 
 * 2. In any component where you want to show the order success alert:
 * 
 *    import { useNavigate } from 'react-router-dom';
 *    import { showOrderSuccess } from './utils/showOrderSuccess';
 *    
 *    const MyComponent = () => {
 *      const navigate = useNavigate();
 *      
 *      const handleOrderCompleted = async () => {
 *        // ... your order submission logic here
 *        
 *        // Show the alert and navigate to home
 *        await showOrderSuccess(navigate);
 *      };
 *      
 *      return (
 *        <button onClick={handleOrderCompleted}>
 *          Place Order
 *        </button>
 *      );
 *    };
 * 
 * FEATURES:
 * ✓ Apple-inspired design with soft success icon (#34C759)
 * ✓ Glassmorphism effect (backdrop blur)
 * ✓ Inter font with custom system font fallbacks
 * ✓ Minimalist UI with 20px rounded corners
 * ✓ Smooth slide-up animation
 * ✓ Prevents outside click and escape key
 * ✓ Auto-navigates to home on confirmation
 * ✓ Subtle shadow and hover effects on button
 */
