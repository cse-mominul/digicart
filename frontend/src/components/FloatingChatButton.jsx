import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const sanitizePhoneForWhatsApp = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits;
};

const FloatingChatButton = () => {
  const [open, setOpen] = useState(false);
  const [whatsappChatEnabled, setWhatsappChatEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('+8801700123456');
  const [whatsappDefaultMessage, setWhatsappDefaultMessage] = useState('Hello, I need help with my order.');

  const fetchWhatsappSettings = async () => {
    try {
      const { data } = await API.get('/settings', {
        params: { _t: Date.now() },
      });

      setWhatsappChatEnabled(typeof data?.whatsappChatEnabled === 'boolean' ? data.whatsappChatEnabled : true);
      setWhatsappNumber(data?.whatsappNumber || data?.contactPhone || '+8801700123456');
      setWhatsappDefaultMessage(data?.whatsappDefaultMessage || 'Hello, I need help with my order.');
    } catch {
      // Keep existing state if settings refresh fails.
    }
  };

  useEffect(() => {
    fetchWhatsappSettings();

    const intervalId = setInterval(() => {
      fetchWhatsappSettings();
    }, 30000);

    const handleFocus = () => {
      fetchWhatsappSettings();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const whatsappLink = useMemo(() => {
    const phone = sanitizePhoneForWhatsApp(whatsappNumber);
    if (!phone) return '';

    const message = encodeURIComponent(String(whatsappDefaultMessage || 'Hello, I need help with my order.'));
    return `https://wa.me/${phone}?text=${message}`;
  }, [whatsappDefaultMessage, whatsappNumber]);

  if (!whatsappChatEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 w-[260px] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Need help?</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Chat with us directly and get support quickly.</p>

          <div className="mt-3 space-y-2">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1fb85a]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.52 3.48A11.83 11.83 0 0012.04 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.14 1.6 5.95L0 24l6.37-1.67a11.8 11.8 0 005.67 1.45h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.39-8.44zM12.05 21.8h-.01a9.82 9.82 0 01-5.01-1.37l-.36-.22-3.78.99 1.01-3.68-.24-.38a9.85 9.85 0 01-1.5-5.25c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.03 6.96 2.9a9.8 9.8 0 012.9 6.95c0 5.43-4.42 9.86-9.83 9.86zm5.4-7.38c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.66.15-.2.3-.76.98-.93 1.18-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.45-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.49s1.06 2.89 1.2 3.1c.15.2 2.08 3.18 5.05 4.46.7.3 1.25.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.56-.35z" />
                </svg>
                Chat on WhatsApp
              </a>
            ) : null}

            <Link
              to="/contact-us"
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#ff3366] hover:text-[#ff3366] dark:border-gray-600 dark:text-gray-200"
            >
              Contact Page
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          fetchWhatsappSettings();
          setOpen((prev) => !prev);
        }}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ff3366] text-white shadow-[0_14px_30px_rgba(255,51,102,0.35)] transition hover:scale-105"
        aria-label="Open chat options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h7m-7 4h4M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H8l-4 3V6a1 1 0 011-1z" />
        </svg>
      </button>
    </div>
  );
};

export default FloatingChatButton;
