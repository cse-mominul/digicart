const highlights = [
  {
    title: 'Smart Picks',
    description: 'AI-shaped recommendations based on what shoppers actually explore.',
    icon: 'spark',
  },
  {
    title: 'Live Trends',
    description: 'See what is moving now with a continuously updated discovery layer.',
    icon: 'trend',
  },
  {
    title: 'Curated Drops',
    description: 'Small-batch collections that feel editorial, focused, and premium.',
    icon: 'grid',
  },
  {
    title: 'Secure Flow',
    description: 'A clean checkout path with confidence cues at every step.',
    icon: 'shield',
  },
];

const Icon = ({ type }) => {
  if (type === 'spark') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3l1.9 5.8H20l-4.7 3.4 1.8 5.8L12 14.9 6.9 18l1.8-5.8L4 8.8h6.1L12 3z" />
      </svg>
    );
  }

  if (type === 'trend') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 17l5-5 4 4 7-8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 8h4v4" />
      </svg>
    );
  }

  if (type === 'grid') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 22s8-4 8-10V6l-8-3-8 3v6c0 6 8 10 8 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4" />
    </svg>
  );
};

const AiHighlights = () => {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {highlights.map((item) => (
        <article
          key={item.title}
          className="group rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-[#101319]/90"
        >
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-[#ff3366] transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-[#ff3366]/10 dark:text-[#ff6b8d]">
            <Icon type={item.icon} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
        </article>
      ))}
    </section>
  );
};

export default AiHighlights;