import { FaPhone, FaWhatsapp, FaHome, FaShoppingBag } from 'react-icons/fa';
import { MdStore } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Phone', icon: <FaPhone />, to: '/contact' },
  { label: 'WhatsApp', icon: <FaWhatsapp />, to: '/whatsapp' },
  { label: 'Home', icon: <FaHome />, to: '/' },
  { label: 'Shop', icon: <MdStore />, to: '/shop' },
  { label: 'Cart', icon: <FaShoppingBag />, to: '/cart', badge: true },
];

export default function MobileBottomNav({ cartCount = 0 }) {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow md:hidden">
      <ul className="flex justify-between items-center px-2 py-1">
        {navItems.map((item) => (
          <li key={item.label} className="flex-1 flex flex-col items-center text-xs">
            <Link
              to={item.to}
              className={`flex flex-col items-center justify-center w-full py-1 ${
                location.pathname === item.to ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {item.badge ? (
                <span className="relative">
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                      {cartCount}
                    </span>
                  )}
                  {item.icon}
                </span>
              ) : (
                item.icon
              )}
              <span className="mt-0.5">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
