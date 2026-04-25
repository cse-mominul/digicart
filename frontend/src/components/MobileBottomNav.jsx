import { FiPhone, FiHome, FiShoppingBag } from 'react-icons/fi';
import { TbBrandWhatsapp } from 'react-icons/tb';
import { BsShop } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';

export default function MobileBottomNav({ cartCount = 0, onCartClick }) {
  const location = useLocation();

  const navItems = [
    { label: 'Phone', icon: <FiPhone size={22} />, to: '/contact-us', external: false },
    { label: 'WhatsApp', icon: <TbBrandWhatsapp size={24} />, to: 'https://wa.me/', external: true },
    { label: 'Home', icon: <FiHome size={22} />, to: '/' },
    { label: 'Shop', icon: <BsShop size={22} />, to: '/products/all' },
    { label: 'Cart', icon: <FiShoppingBag size={22} />, action: onCartClick, badge: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden pb-safe">
      <ul className="flex justify-between items-center px-2 py-2 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const textColor = isActive ? 'text-black font-bold' : 'text-gray-600 font-medium';

          const content = (
            <>
              {item.badge ? (
                <span className="relative inline-flex items-center justify-center">
                  <span className="absolute -top-1.5 -right-2 bg-[#ef4444] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                  {item.icon}
                </span>
              ) : (
                <span className="inline-flex items-center justify-center">{item.icon}</span>
              )}
              <span className={`mt-1 text-[11px] leading-none ${textColor}`}>{item.label}</span>
            </>
          );

          const className = `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-black' : 'text-gray-600'}`;

          return (
            <li key={item.label} className="flex-1 flex flex-col items-center h-full">
              {item.action ? (
                <button onClick={item.action} className={className}>
                  {content}
                </button>
              ) : item.external ? (
                <a href={item.to} target="_blank" rel="noopener noreferrer" className={className}>
                  {content}
                </a>
              ) : (
                <Link to={item.to} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
