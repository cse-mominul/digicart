import { Link } from 'react-router-dom';

const contactCards = [
  {
    title: 'Email',
    value: 'support@digicart.com',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M4 7l8 6 8-6" />
      </svg>
    ),
  },
  {
    title: 'Phone',
    value: '+1 (555) 123-4567',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M7.5 4.5h1.2c.7 0 1.3.4 1.6 1l1.1 2.5a1.8 1.8 0 0 1-.4 2L9.6 11.4a14 14 0 0 0 3 3l1.4-1.4a1.8 1.8 0 0 1 2-.4l2.5 1.1c.6.3 1 .9 1 1.6v1.2a2.2 2.2 0 0 1-2.2 2.2C10.6 19.7 4.3 13.4 4.3 5.7A1.2 1.2 0 0 1 5.5 4.5Z" />
      </svg>
    ),
  },
  {
    title: 'Address',
    value: '125 Market Street, Gulshan Avenue, Dhaka 1212',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
    ),
  },
  {
    title: 'Website',
    value: 'www.digicart.com',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
    ),
  },
];

const ContactUs = () => {
  return (
    <main className="bg-white text-gray-900">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <nav className="flex items-center gap-3 text-sm sm:text-base text-gray-500">
          <Link to="/" className="flex items-center gap-2 text-gray-800 transition-colors hover:text-teal-600">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5 10.5V20h14v-9.5" />
                <path d="M9 20v-6h6v6" />
              </svg>
            </span>
            <span>Home</span>
          </Link>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">Contact us</span>
        </nav>

        <div className="pb-10 pt-12 text-center sm:pt-14 lg:pt-16">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            We are happy to assist you
          </h1>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            Here to help, anytime you need us.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {contactCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_0_0_1px_rgba(17,24,39,0.02)] transition-transform duration-200 hover:-translate-y-1 flex flex-col items-center sm:items-start sm:flex-col text-center sm:text-left"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-800">
                {card.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 break-words">{card.value}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ContactUs;
