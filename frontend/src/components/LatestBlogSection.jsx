import { Link } from 'react-router-dom';

const posts = [
  {
    title: 'The Future of Industrial Design',
    excerpt: 'So you have heard about this site or you have been to it, but you cannot figure out.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    category: 'Category Name',
    date: '09 Feb 2027',
    comments: 10,
  },
  {
    title: 'The Future of Industrial Design',
    excerpt: 'So you have heard about this site or you have been to it, but you cannot figure out.',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    category: 'Category Name',
    date: '09 Feb 2027',
    comments: 10,
  },
  {
    title: 'The Future of Industrial Design',
    excerpt: 'So you have heard about this site or you have been to it, but you cannot figure out.',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    category: 'Category Name',
    date: '09 Feb 2027',
    comments: 10,
  },
  {
    title: 'The Future of Industrial Design',
    excerpt: 'So you have heard about this site or you have been to it, but you cannot figure out.',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=900&q=80',
    category: 'Category Name',
    date: '09 Feb 2027',
    comments: 10,
  },
];

const LatestBlogSection = () => {
  return (
    <section className="mb-10 rounded-[24px] border border-slate-200 bg-white px-4 py-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:px-5 dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">Latest Blog</h3>
        <Link to="/products" className="text-sm font-semibold text-[#ff3366] transition-colors hover:text-[#ff1f58]">
          View All
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {posts.map((post) => (
          <article
            key={post.image}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-[#111827]"
          >
            <div className="overflow-hidden rounded-xl">
              <img
                src={post.image}
                alt={post.title}
                className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.src = 'https://placehold.co/900x500?text=Blog';
                }}
              />
            </div>

            <div className="pt-3">
              <span className="inline-flex rounded-full bg-[#ff3366]/10 px-2.5 py-1 text-[10px] font-semibold text-[#ff3366]">
                {post.category}
              </span>

              <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9Zm-1-5H6a1 1 0 0 0-1 1v1h14V6a1 1 0 0 0-1-1Z" />
                  </svg>
                  {post.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 3H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.6l2.7 2.7a1 1 0 0 0 1.4 0L14.4 19H20a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 14h-6a1 1 0 0 0-.7.3L12 19.6l-1.3-1.3a1 1 0 0 0-.7-.3H4V5h16v12Z" />
                  </svg>
                  Comment ({post.comments})
                </span>
              </div>

              <h4 className="mt-3 min-h-[40px] text-base font-semibold leading-6 text-slate-900 dark:text-white">
                {post.title}
              </h4>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600 dark:text-slate-300">
                {post.excerpt}
              </p>

              <Link
                to="/products"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0f8f84] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#117b72]"
              >
                Read More
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs">↗</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default LatestBlogSection;
