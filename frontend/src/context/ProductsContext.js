import { createContext, useContext, useState, useEffect } from 'react';
import Api from '../utils/Api';

export const ProductsContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('api');

  useEffect(() => {
    const normalizeProduct = (product, category = 'Others') => {
      if (!product || typeof product !== 'object') {
        return null;
      }

      const productId = product.productId || product._id || product.id;
      if (!productId) {
        console.warn('Skipping product without a valid ID:', product);
        return null;
      }

      const name = product.name || product.title || 'Unnamed Product';
      const price =
        typeof product.price === 'number'
          ? product.price
          : parseFloat(product.price) || 0;
      const description = product.description || 'No description available';
      const imageUrl =
        product.imageUrl || product.image || '/images/products/default.jpg';

      return {
        productId,
        name: name.trim(),
        price,
        description,
        imageUrl: imageUrl.startsWith('http')
          ? imageUrl
          : `/images/products/${imageUrl}`,
        isFeatured: Boolean(product.isFeatured),
        categories: Array.isArray(product.categories)
          ? product.categories
          : [category],
      };
    };

    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Fetch products from the local server
        const fetchedStructured = await Api.getItems();

        if (!fetchedStructured || !Array.isArray(fetchedStructured)) {
          throw new Error('Invalid server response format');
        }

        // Fetch products from the third-party API
        const thirdParty = await Api.getThirdPartyProducts();

        // Normalize and validate server products
        const normalizedFromStructured = fetchedStructured
          .map((product) => normalizeProduct(product))
          .filter(Boolean); // Remove invalid products

        // Normalize and validate third-party products
        const normalizedFromThirdParty = Array.isArray(thirdParty)
          ? thirdParty.map((p) => normalizeProduct(p)).filter(Boolean)
          : [];

        // Combine both sets of products
        const finalCombined = [
          ...normalizedFromStructured,
          ...normalizedFromThirdParty,
        ];

        if (finalCombined.length === 0) {
          throw new Error('No valid products available');
        }

        setProducts(finalCombined);

        setDataSource('api');
      } catch (error) {
        console.error('Error fetching products:', error);

        setProducts([]);
        setDataSource('none');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, dataSource }}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsContext;
