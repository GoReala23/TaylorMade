import { createContext, useState, useEffect } from 'react';
import Api from '../utils/Api';
import backup from '../utils/products';

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
        setLoading(true);
        const fetchedProducts = await Api.getItems();
        // Check if the fetched data is an array or empty
        if (!fetchedProducts.length || !Array.isArray(fetchedProducts)) {
          console.warn('Could not fetch products from Api, using backup data');
          const normalizedBackup = backup.flatMap((category) =>
            category.items.map(normalizeProductData),
          );
          setProducts(normalizedBackup);
          return;
        }
        // Normalize the fetched data
        const normalizedProducts = fetchedProducts.map(normalizeProductData);
        setProducts(normalizedProducts);
        //  Extract all normalized categories
        const categories = new Set();
        normalizedProducts.forEach((product) => {
          if (Array.isArrray(product.categories)) {
            product.categories
              .flat()
              .forEach((category) => categories.add(category));
          } else if (product.categories) {
            categories.add(product.categories);
          }
        });

        // Group products by category
        const categoryGroups = {};
        Array.from(categories).forEach((category) => {
          categoryGroups[category] = normalizedProducts.filter((product) =>
            Array.isArray(product.categories)
              ? product.categories.flat().includes(category)
              : product.categories === category,
          );
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        const normalizedBackup = backup.flatMap((category) =>
          category.items.map(normalizeProductData),
        );
        setProducts(normalizedBackup);
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
