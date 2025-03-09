import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { ProductsContext } from '../../context/ProductsContext';
import PreviewOverlay from '../Modals/PreviewOverlay/PreviewOverlay';
import BuyModal from '../Modals/BuyModal/BuyModal';
import Card, { formatProductData } from '../Card/Card';
import './Products.css';

const Products = ({
  addToCart,
  likeItem,
  openPreview,
  openBuyModal,
  modalStates = {},
  setModalStates,
  closeModal,
}) => {
  const { products } = useContext(ProductsContext);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { isLoggedIn } = useContext(AuthContext);
  const { addToCart: addToCartContext } = useContext(CartContext);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewQuantity, setPreviewQuantity] = useState(1);

  useEffect(() => {
    // Fetch categories from products
    const fetchedCategories = [
      'All',
      'Featured',
      'Favorites',
      ...new Set(products.flatMap((product) => product.categories || [])),
    ];
    setCategories(fetchedCategories);
    setLoading(false);
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
      previewProduct: formatProductData(product),
      showBuyModal: false,
      productToBuy: null,
    }));
  };

  const handleShowBuyModal = (product) => {
    setModalStates((prev) => ({
      ...prev,
      showBuyModal: true,
      productToBuy: formatProductData(product),
      showPreview: false,
      previewProduct: null,
    }));
  };

  const handleAddToCart = (product) => {
    addToCartContext(product, 1);
  };

  const handlePurchase = async () => {
    try {
      if (!modalStates.productToBuy || !modalStates.productToBuy._id) {
        throw new Error('Invalid product data');
      }
      setModalStates((prev) => ({
        ...prev,
        type: 'buy',
        showBuyModal: true,
        productToBuy: modalStates.productToBuy,
      }));
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Failed to process purchase. Please try again.');
    }
  };

  const toggleFavorite = (product) => {
    const isFavorite = favorites.some((fav) => fav._id === product._id);
    if (isFavorite) {
      removeFavorite(product._id);
    } else {
      addFavorite(product);
    }
  };

  const renderProductCard = (product) => (
    <Card
      key={product._id}
      product={formatProductData(product)}
      isFeatured={product.isFeatured}
      onAddToCart={() => handleAddToCart(product)}
      onBuyNow={() => handleShowBuyModal(product)}
      onFavorite={() => toggleFavorite(product)}
      onClick={() => handleShowPreview(product)}
    />
  );

  const renderCategory = () => {
    const productsToRender = products.filter((product) => {
      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Featured') return product.isFeatured;
      if (selectedCategory === 'Favorites')
        return favorites.some((fav) => fav._id === product._id);
      return product.categories?.includes(selectedCategory);
    });
    return (
      <div className='products__grid'>
        {productsToRender.map(renderProductCard)}
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`products ${isLoggedIn ? 'products--dashboard' : 'products--no-dashboard'}`}
    >
      <div className='products__container'>
        <div className='products__category-bar'>
          {categories.map((category) => (
            <button
              key={category}
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
            onPurchase={handlePurchase}
          />
        )}
      </div>
    </div>
  );
};

export default Products;
