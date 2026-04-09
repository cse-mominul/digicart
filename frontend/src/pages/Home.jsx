import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import HeroSlider from '../components/HeroSlider';
import AiHighlights from '../components/AiHighlights';
import AiDealsSection from '../components/AiDealsSection';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topSellingLoading, setTopSellingLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    if (categoryName) {
      setCategory(decodeURIComponent(categoryName));
    } else {
      setCategory('All');
    }
  }, [categoryName]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/products');
        const latestProducts = Array.isArray(data)
          ? [...data]
              .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
              .slice(0, 15)
          : [];

        setProducts(latestProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const { data } = await API.get('/products/top-selling?limit=20');
        setTopSellingProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch top selling products:', error);
        setTopSellingProducts([]);
      } finally {
        setTopSellingLoading(false);
      }
    };

    fetchTopSellingProducts();
  }, []);

  const filtered = products.filter((p) => category === 'All' || p.category === category);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-6 sm:pb-8">
      <HeroSlider />

      <AiHighlights />

      <AiDealsSection products={topSellingProducts} loading={topSellingLoading} />

      <div className="mb-4 flex flex-col items-center text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Featured Products</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} items</p>
      </div>

      {loading ? (
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 justify-center">
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
        <div className="mx-auto flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 justify-center">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
