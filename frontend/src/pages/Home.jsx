import { useState, useEffect } from 'react';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import CategoryChips from '../components/CategoryChips';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/products');
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => category === 'All' || p.category === category);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-6 sm:pb-8">
      <section className="sticky top-[104px] md:top-[76px] z-40 pt-0 mt-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 mb-6">
        <CategoryChips categories={categories} activeCategory={category} onChange={setCategory} />
      </section>

      <HeroSlider />

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Featured Products</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} items</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-xl font-medium">No products found</p>
          <p className="text-sm mt-2">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
