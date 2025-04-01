import { createContext, useContext, useMemo } from 'react';
import { useProducts } from './ProductsContext';
import { useFeaturedProducts } from './FeaturedProductsContext';
import backupData from '../utils/products';

export const BackupProductContext = createContext();

export const BackupProductProvider = ({ children }) => {
  const { products: apiProducts, loading: productsLoading } = useProducts();
  const { featuredProducts } = useFeaturedProducts();

  const normalizeProduct = (product, fallbackCategory = 'Others') => {
    const name = product.name || product.title || 'Unnamed Product';
    const _id =
      product._id || product.id || product.productId || product.productId;
    const price = parseFloat(product.price) || 0;

    let imageUrl = product.imageUrl || product.image || '';

    // 🔧 Handle local/static vs external (API) image paths
    const isExternal =
      typeof imageUrl === 'string' && imageUrl.startsWith('http');
    if (!imageUrl) {
      imageUrl = '/images/products/default.jpg';
    } else if (!isExternal && !imageUrl.startsWith('/images/products/')) {
      imageUrl = `/images/products/${imageUrl}`;
    }

    const categories = Array.isArray(product.categories)
      ? [...new Set(product.categories)]
      : [fallbackCategory];

    return {
      _id,
      name: name.trim(),
      price,
      description: product.description || 'No description available',
      imageUrl,
      isFeatured: Boolean(product.isFeatured),
      categories,
      isSaved: Boolean(product.isSaved),
      savedQuantity:
        typeof product.savedQuantity === 'number' ? product.savedQuantity : 1,
    };
  };

  const extractFromBackup = () => {
    return backupData.flatMap((group) =>
      group.items.map((item) => normalizeProduct(item, group.category)),
    );
  };

  const { products: combinedProducts, categories: sortedCategories } =
    useMemo(() => {
      const backupProducts = extractFromBackup();
      const productMap = new Map();
      const allCategories = new Set(['Featured']);

      backupProducts.forEach((p) => {
        if (p && p._id) {
          p.categories.forEach((cat) => allCategories.add(cat));
          productMap.set(p._id, {
            ...p,
            categories: [...new Set(p.categories)],
          });
        }
      });

      const validApiProducts = Array.isArray(apiProducts)
        ? apiProducts.filter((p) => p && (p.name || p.title) && p.price)
        : [];

      const normalizedApiProducts = validApiProducts.map((p) => {
        const norm = normalizeProduct(p);
        norm.categories.forEach((cat) => allCategories.add(cat));
        return norm;
      });

      normalizedApiProducts.forEach((p) => {
        if (!productMap.has(p._id)) {
          productMap.set(p._id, p);
        }
      });

      const baseProducts = Array.from(productMap.values());

      const featuredMap = new Map();
      featuredProducts?.forEach((fp) => {
        const norm = normalizeProduct(fp);
        allCategories.add('Featured');
        featuredMap.set(fp._id, {
          ...norm,
          isFeatured: true,
          categories: [...new Set([...(norm.categories || []), 'Featured'])],
        });
      });

      const mergedProducts = baseProducts.map((prod) => {
        const featured = featuredMap.get(prod._id);
        const finalProduct = featured || prod;

        if (
          finalProduct.isFeatured &&
          !finalProduct.categories.includes('Featured')
        ) {
          finalProduct.categories.push('Featured');
        }

        finalProduct.categories = [...new Set(finalProduct.categories)];
        finalProduct.categories.forEach((cat) => allCategories.add(cat));
        return finalProduct;
      });

      featuredMap.forEach((fp, id) => {
        if (!mergedProducts.some((p) => p._id === id)) {
          mergedProducts.push(fp);
        }
      });

      const sortedCategory = [
        'Featured',
        ...Array.from(allCategories).filter((cat) => cat !== 'Featured'),
      ];

      return {
        products: mergedProducts,
        categories: sortedCategory,
      };
    }, [apiProducts, featuredProducts]);

  return (
    <BackupProductContext.Provider
      value={{
        products: combinedProducts,
        loading: productsLoading,
        categories: sortedCategories,
      }}
    >
      {children}
    </BackupProductContext.Provider>
  );
};

export const useBackupProducts = () => useContext(BackupProductContext);

export default BackupProductProvider;
