import { createContext, useState, useEffect } from 'react';
import Api from '../utils/Api';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeProductData = (product) => {
    return {
      _id: product._id || product.id, // Support different ID formats
      name: product.name || product.title || 'Unknown Product',
      price: product.price || 0,
      description: product.description || 'No description available',
      imageUrl:
        product.image || product.imageUrl?.startsWith('http')
          ? product.imageUrl
          : `http://localhost:5000${product.imageUrl}`, // Local fallback
      isFeatured: product.isFeatured || false,
      categories: product.categories || [],
      isSaved: product.isSaved || false,
      savedQuantity: product.savedQuantity || 1,
    };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await Api.getItems();

        const normalizedProducts = fetchedProducts.map(normalizeProductData);
        setProducts(normalizedProducts);

        const categories = normalizedProducts.reduce((acc, product) => {
          const productCategories = Array.isArray(product.categories)
            ? product.categories.flat()
            : [product.categories];
          productCategories.forEach((category) => {
            if (!acc.includes(category)) {
              acc.push(category);
            }
          });
          return acc;
        }, []);

        categories.forEach((category) => {
          const categoryItems = normalizedProducts.filter((product) =>
            Array.isArray(product.categories)
              ? product.categories.flat().includes(category)
              : product.categories.includes(category),
          );
        });
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsContext;
