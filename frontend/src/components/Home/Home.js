import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ProductsContext } from '../../context/ProductsContext';
import { useFeaturedProducts } from '../../context/FeaturedProductsContext';
import { useFavorites } from '../../context/FavoritesContext';
import { CartContext } from '../../context/CartContext';
import BuyModal from '../Modals/BuyModal/BuyModal';
import PreviewOverlay from '../Modals/PreviewOverlay/PreviewOverlay';
import Card, { formatProductData } from '../Card/Card';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  const { products, loading: productsLoading } = useContext(ProductsContext);
  const { featuredProducts } = useFeaturedProducts();
  const { favorites, toggleFavorite } = useFavorites();
  const {
    cartItems,
    addToCart,
    fetchCart,
    getSavedItems,
    fetchOrders,
    removeSavedItem,
  } = useContext(CartContext);

  const [modalStates, setModalStates] = useState({
    showPreview: false,
    showBuyModal: false,
    previewProduct: null,
    productToBuy: null,
  });
  const [previewQuantity, setPreviewQuantity] = useState(1);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (isLoggedIn) {
          await Promise.all([fetchOrders(), fetchCart(), getSavedItems()]);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    initializeData();
    console.log('Featured Products:', featuredProducts);
    console.log('Products:', products);
    console.log('Cart Items:', cartItems);
    console.log('Favorites:', favorites);
    console.log('Orders:', orders);
  }, [isLoggedIn, fetchOrders, fetchCart, getSavedItems]);

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
    addToCart(product, 1);
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

  const closeModal = () => {
    setModalStates({
      showPreview: false,
      showBuyModal: false,
      previewProduct: null,
      productToBuy: null,
    });
  };

  const handleViewMore = (section) => {
    if (section === 'Favorite Items') {
      navigate('/products?category=favorites');
    } else {
      navigate(`/${section.toLowerCase().replace(' ', '-')}`);
    }
  };

  const renderProductGrid = (productList, title, limit = 4) => {
    if (!productList || productList.length === 0) return null;

    return (
      <section className='home__section'>
        <h1 className='home__title'>{title}</h1>
        <div className='home__grid'>
          {productList.slice(0, limit).map((product) => {
            const isFeatured = featuredProducts.some(
              (featuredProduct) => featuredProduct._id === product._id,
            );

            return (
              <Card
                key={product._id || `${product.name}-${product.price}`}
                product={product}
                isFeatured={isFeatured}
                onAddToCart={() => handleAddToCart(product)}
                onBuyNow={() => handleShowBuyModal(product)}
                onFavorite={toggleFavorite}
                onClick={() => handleShowPreview(product)}
              />
            );
          })}
        </div>
        <button
          className='home__view-more'
          onClick={() => handleViewMore(title)}
        >
          View More
        </button>
      </section>
    );
  };

  const renderFeaturedSection = () => {
    return renderProductGrid(featuredProducts, 'Featured Items');
  };

  const renderFavoritesSection = () => {
    return renderProductGrid(favorites, 'Favorite Items');
  };

  const renderOrdersSection = () => {
    if (!orders || orders.length === 0) {
      return <p className='home__empty-message'>You have no orders.</p>;
    }

    return (
      <section className='home__section'>
        <h1 className='home__title'>My Orders</h1>
        <div className='home__grid'>
          {orders.slice(0, 4).map((order) => {
            const product = order.item[0];
            return (
              <Card
                key={order._id || `${product.name}-${order.price}`}
                product={{ ...product, price: product.price || order.price }}
                isFeatured={product.isFeatured}
                onAddToCart={() => handleAddToCart(product)}
                onBuyNow={() => handleShowBuyModal(product)}
                onFavorite={toggleFavorite}
                onClick={() => handleShowPreview(product)}
              />
            );
          })}
        </div>
        <button
          className='home__view-more'
          onClick={() => handleViewMore('orders')}
        >
          View More
        </button>
      </section>
    );
  };

  const renderCartSection = () => {
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return <p className='home__empty-message'>Your cart is empty.</p>;
    }

    return (
      <section className='home__section'>
        <h1 className='home__title'>My Cart</h1>
        <div className='home__grid'>
          {cartItems.map((item) => (
            <Card
              isFeatured={item.product.isFeatured}
              key={
                item.product?._id || `${item.product?.name}-${item.quantity}`
              }
              product={item.product || item.name}
              onAddToCart={() => handleAddToCart(item.product)}
              onBuyNow={() => handleShowBuyModal(item.product)}
              onFavorite={toggleFavorite}
              onClick={() => handleShowPreview(item.product)}
              initialQuantity={item.quantity}
            />
          ))}
        </div>
        <button
          className='home__view-more'
          onClick={() => handleViewMore('cart')}
        >
          View More
        </button>
      </section>
    );
  };

  return (
    <div
      className={`home ${isLoggedIn ? 'home--dashboard' : 'home--no-dashboard'}`}
    >
      <PreviewOverlay
        isOpen={modalStates.showPreview}
        onClose={closeModal}
        product={modalStates.previewProduct}
        quantity={previewQuantity}
        isLiked={favorites.some(
          (fav) => fav._id === modalStates.previewProduct?._id,
        )}
        onQuantityChange={(newQuantity) => setPreviewQuantity(newQuantity)}
        onAddToCart={() => handleAddToCart(modalStates.previewProduct)}
        onBuyNow={() => handleShowBuyModal(modalStates.previewProduct)}
        onFavorite={toggleFavorite}
      />

      {modalStates.showBuyModal && (
        <BuyModal
          isOpen={modalStates.showBuyModal}
          onClose={closeModal}
          quantity={previewQuantity}
          product={modalStates.productToBuy}
          onPurchase={handlePurchase}
        />
      )}

      {renderFeaturedSection()}
      {renderProductGrid(products, 'Products')}

      {isLoggedIn && (
        <>
          {renderOrdersSection()}
          {renderCartSection()}
          {renderFavoritesSection()}
        </>
      )}
    </div>
  );
};

export default Home;
