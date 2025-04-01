import { createContext, useContext, useState, useEffect } from 'react';
import { useProducts } from './ProductsContext';
import Api from '../utils/Api';

export const FeaturedProductsContext = createContext();

export const FeaturedProductsProvider = ({ children }) => {
  const { products } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const filteredFeatured = products.filter((product) => {
      // Basic null/undefined check
      if (!product) {
        console.warn('Null or undefined product found in featured products');
        return false;
      }
      // Validate required fields
      if (
        !product.name ||
        typeof product.name !== 'string' ||
        !product.name.trim()
      ) {
        console.warn('Invalid or missing name in featured product:', product);
        return false;
      }
      if (
        !product.price ||
        typeof product.price !== 'number' ||
        product.price <= 0
      ) {
        console.warn('Invalid or missing price in featured product:', product);
        return false;
      }
      if (!product.imageUrl || typeof product.imageUrl !== 'string') {
        console.warn(
          'Invalid or missing imageUrl in featured product:',
          product,
        );
        return false;
      }
      // Check if product is actually featured
      return product.isFeatured === true;
    });

    setFeaturedProducts(filteredFeatured);
  }, [products]);

  const toggleFeatured = async (productId) => {
    try {
      await Api.toggleFeaturedProduct(productId);
      setFeaturedProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: !product.isFeatured }
            : product,
        ),
      );
    } catch (error) {
      console.error('Error toggling featured product:', error);
    }
  };

  return (
    <FeaturedProductsContext.Provider
      value={{ featuredProducts, toggleFeatured }}
    >
      {children}
    </FeaturedProductsContext.Provider>
  );
};

export const useFeaturedProducts = () => {
  return useContext(FeaturedProductsContext);
};

export default FeaturedProductsProvider;
