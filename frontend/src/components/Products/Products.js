import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useBackupProducts } from '../../context/BackupProductContext';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { useFavorites } from '../../context/FavoritesContext';

import PreviewOverlay from '../Modals/PreviewOverlay/PreviewOverlay';
import BuyModal from '../Modals/BuyModal/BuyModal';
import Card from '../Card/Card';
import './Products.css';

const Products = ({ modalStates = {}, setModalStates }) => {
  const { products, loading } = useBackupProducts();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { createOrder } = useOrders();
  const { isLoggedIn } = useContext(AuthContext);
  const { addToCart: addToCartContext } = useContext(CartContext);
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewQuantity, setPreviewQuantity] = useState(1);

  const categories = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return ['All'];
    }
    const uniqueCategories = new Set(['All']);
    products.forEach((product) => {
      if (product?.categories?.length) {
        product.categories.forEach((cat) => uniqueCategories.add(cat));
      } else if (product?.category) {
        uniqueCategories.add(product.category);
      }
    });
    if (favorites.length > 0) {
      uniqueCategories.add('Favorites');
    }
    return Array.from(uniqueCategories);
  }, [products]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const category = query.get('category');
    if (category) {
      setSelectedCategory(category.charAt(0).toUpperCase() + category.slice(1));
    }
  }, [location]);

  const handleShowPreview = (product) => {
    setModalStates((prev) => ({
      ...prev,
      showPreview: true,
      previewProduct: product,
      showBuyModal: false,
      productToBuy: null,
    }));
  };

  const handleShowBuyModal = (product) => {
    setModalStates((prev) => ({
      ...prev,
      showBuyModal: true,
      productToBuy: product,
      showPreview: false,
      previewProduct: null,
    }));
  };

  const handleAddToCart = (product) => {
    addToCartContext(product, 1);
  };

  const toggleFavorite = (product) => {
    const isFavorite = favorites.some((fav) => fav._id === product._id);
    if (isFavorite) {
      removeFavorite(product._id);
    } else {
      addFavorite(product);
    }
  };

  const renderCategory = () => {
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products);
      return <p>Error loading products. Please try again later.</p>;
    }

    const filterCategory = (product) => {
      if (selectedCategory === 'All') {
        return true;
      }

      if (selectedCategory === 'Favorites') {
        return favorites.some((fav) => fav._id === product._id);
      }
      return (
        product.categories?.includes(selectedCategory) ||
        product.category === selectedCategory ||
        false
      );
    };

    const productsToRender = products.filter(filterCategory);

    return (
      <div className='products__grid'>
        {productsToRender.map((product, index) => (
          <Card
            key={`${product._id}-${index}`}
            product={product}
            isFeatured={Boolean(product.isFeatured)}
            onAddToCart={() => handleAddToCart(product)}
            onBuyNow={() => handleShowBuyModal(product)}
            onFavorite={() => toggleFavorite(product)}
            onClick={() => handleShowPreview(product)}
          />
        ))}
      </div>
    );
  };
  return (
    <div
      className={`products ${isLoggedIn ? 'products--dashboard' : 'products--no-dashboard'}`}
    >
      <div className='products__container'>
        <div className='products__category-bar'>
          {categories.map((category, index) => (
            <button
              key={`${category}-${index}`}
              className={`products__category-button ${
                selectedCategory === category ? 'active' : ''
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {renderCategory()}
        <PreviewOverlay
          isOpen={modalStates?.showPreview || false}
          onClose={() =>
            setModalStates((prev) => ({ ...prev, showPreview: false }))
          }
          product={modalStates?.previewProduct}
          quantity={previewQuantity}
          isFeatured={modalStates.previewProduct?.isFeatured || false}
          isLiked={favorites.some(
            (fav) => fav._id === modalStates?.previewProduct?._id,
          )}
          onQuantityChange={(newQuantity) => setPreviewQuantity(newQuantity)}
          onAddToCart={() => handleAddToCart(modalStates.previewProduct)}
          onBuyNow={() => handleShowBuyModal(modalStates.previewProduct)}
          onFavorite={toggleFavorite}
        />

        {modalStates.showBuyModal && (
          <BuyModal
            isOpen={modalStates.showBuyModal}
            onClose={() =>
              setModalStates((prev) => ({ ...prev, showBuyModal: false }))
            }
            quantity={previewQuantity}
            product={modalStates.productToBuy}
            onPurchase={() => console.log('Purchase logic here')}
          />
        )}
      </div>
    </div>
  );
};

export default Products;
