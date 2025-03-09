import React, { createContext, useState, useEffect, useContext } from 'react';
import { ProductsContext } from './ProductsContext';
import Api from '../utils/Api';

export const FeaturedProductsContext = createContext();

export const FeaturedProductsProvider = ({ children }) => {
  const { products, setProducts } = useContext(ProductsContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const productsFeatured = () => {
      const featured = products.filter((product) => product.isFeatured);
      setFeaturedProducts(featured);
    };

    productsFeatured();
  }, [products]);

  const toggleFeatured = async (productId) => {
    try {
      await Api.toggleFeaturedProduct(productId);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
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
  const context = React.useContext(FeaturedProductsContext);
  if (!context) {
    throw new Error(
      'useFeaturedProducts must be used within a FeaturedProductsProvider',
    );
  }
  return context;
};

export default FeaturedProductsProvider;
