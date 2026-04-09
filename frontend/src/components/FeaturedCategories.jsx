import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const toSlug = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const FeaturedCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/categories');
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Unable to load categories right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="my-6 sm:my-8 md:my-10 flex flex-col items-center text-center px-3 sm:px-4">
      <div className="mb-6 sm:mb-8 flex justify-center w-full">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Featured Categories</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4 w-full mx-auto justify-center">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-4 animate-pulse"
            >
              <div className="mx-auto h-8 sm:h-12 w-8 sm:w-12 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="mt-2 h-3 w-12 mx-auto rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="w-full max-w-md mx-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4 w-full mx-auto justify-center">
          {categories.map((category) => (
            <button
              type="button"
              key={category._id || category.name}
              onClick={() => navigate(`/products/${toSlug(category.name)}`)}
              className="aspect-square group cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 dark:hover:border-indigo-400/60 dark:hover:ring-1 dark:hover:ring-indigo-400/40 dark:hover:shadow-indigo-500/30"
            >
              <div className="mx-auto flex h-8 sm:h-12 w-8 sm:w-12 items-center justify-center overflow-hidden rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                {category.iconUrl ? (
                  <img src={category.iconUrl} alt={category.name} className="h-6 sm:h-8 w-6 sm:w-8 object-contain" />
                ) : (
                  <span className="text-xs sm:text-base font-semibold text-gray-500 dark:text-gray-300">
                    {category.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{category.name}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedCategories;