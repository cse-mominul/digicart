import { useState, useEffect } from 'react';
import API from '../api/axios';
import HeroSlider from '../components/HeroSlider';
import AiHighlights from '../components/AiHighlights';
import AiDealsSection from '../components/AiDealsSection';
import NewLaunchProductsSection from '../components/NewLaunchProductsSection';
import LimitedTimeDealsSection from '../components/LimitedTimeDealsSection';
import OurProductsSection from '../components/OurProductsSection';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topSellingLoading, setTopSellingLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/products');
        setProducts(Array.isArray(data) ? data : []);
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

  return (
    <div className="max-w-7xl mx-auto overflow-x-hidden px-3 pb-6 sm:px-4 md:px-6 lg:px-8 sm:pb-8">
      <HeroSlider />

      <AiHighlights />

      <AiDealsSection products={topSellingProducts} loading={topSellingLoading} />

      <NewLaunchProductsSection products={products} loading={loading} />

      <LimitedTimeDealsSection products={topSellingProducts} loading={topSellingLoading} />

      <OurProductsSection products={products} loading={loading} />
    </div>
  );
};

export default Home;
