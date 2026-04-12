import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_45%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_28%),linear-gradient(180deg,#030712_0%,#0f172a_55%,#111827_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-10 lg:p-14">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                404 - Page Not Found
              </span>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                We could not find that page.
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg lg:mx-0">
                The page you are looking for may have been moved, renamed, or never existed.
                Use the buttons below to get back to shopping.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  to="/"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1d4ed8] sm:w-auto"
                >
                  Go to Home
                </Link>
                <Link
                  to="/products/all"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-[#2563eb] hover:text-[#2563eb] dark:border-white/10 dark:bg-white/5 dark:text-white sm:w-auto"
                >
                  Browse Products
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400 lg:justify-start">
                <Link to="/contact-us" className="transition-colors hover:text-[#2563eb]">
                  Contact Us
                </Link>
                <span className="hidden sm:inline">•</span>
                <Link to="/account/profile" className="transition-colors hover:text-[#2563eb]">
                  My Account
                </Link>
                <span className="hidden sm:inline">•</span>
                <Link to="/wishlist" className="transition-colors hover:text-[#2563eb]">
                  Wishlist
                </Link>
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
              <div className="absolute inset-0 mx-auto h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-slate-900 sm:h-80 sm:w-80">
                <div className="text-center">
                  <div className="text-[92px] font-black leading-none tracking-[-0.08em] text-[#2563eb] sm:text-[120px]">
                    404
                  </div>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    Lost in the cart
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFound;

