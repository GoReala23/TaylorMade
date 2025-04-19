import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useBackupProducts } from '../../context/BackupProductContext';
import { useFavorites } from '../../context/FavoritesContext';
import { CartContext } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import BuyModal from '../Modals/BuyModal/BuyModal';
import PreviewOverlay from '../Modals/PreviewOverlay/PreviewOverlay';
import Card from '../Card/Card';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  const { products, isFeatured } = useBackupProducts();
  const { favorites, toggleFavorite } = useFavorites();
  const { cartItems, addToCart, fetchCart, getSavedItems } =
    useContext(CartContext);
  const { orders, fetchOrders, createOrder } = useOrders();

  const [modalStates, setModalStates] = useState({
    showPreview: false,
    showBuyModal: false,
    previewProduct: null,
    productToBuy: null,
  });
  const [previewQuantity, setPreviewQuantity] = useState(1);

  useEffect(() => {
    const initializeData = async () => {
      const token = localStorage.getItem('token');
      if (!isLoggedIn || !token) return;

      try {
        await fetchCart();
        setTimeout(() => getSavedItems(), 100);
        setTimeout(() => fetchOrders(), 200);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    initializeData();
  }, [isLoggedIn]);

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

  const handleAddToCart = async (product) => {
    const response = await addToCart({
      productId: product.productId || product._id,
      quantity: 1,
    });

    if (response.success) {
      console.log(' Item added to cart:', response);
    } else {
      console.error(' Error adding to cart:', response.message);
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

  const handlePurchase = async (product, quantity, address) => {
    try {
      await createOrder(product._id, quantity, address);

      setModalStates((prev) => ({
        ...prev,
        showBuyModal: false,
      }));
      await fetchOrders();
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const renderProductGrid = useCallback(
    (productList, title, limit = 4) => {
      if (!productList) {
        console.warn(
          `Invalid productList for ${title}: productList is null or undefined`,
        );
        return null;
      }
      if (!Array.isArray(productList)) {
        console.warn(
          `Invalid productList for ${title}: not an array`,
          productList,
        );
        return null;
      }
      if (productList.length === 0) {
        return null;
      }

      const validProducts = productList.filter((product) => {
        if (!product || typeof product !== 'object') {
          console.warn(`Invalid product in ${title}:`, product);
          return false;
        }
        if (
          !product.name ||
          typeof product.name !== 'string' ||
          product.name.trim().length === 0
        ) {
          console.warn('Invalid product name:', product);
          return false;
        }
        return true;
      });

      return (
        <section className='home__section'>
          <h1 className='home__title'>{title}</h1>
          <div className='home__grid'>
            {validProducts.slice(0, limit).map((product) => (
              <Card
                key={product._id}
                product={product}
                isFeatured={product.isFeatured}
                onAddToCart={() => handleAddToCart(product)}
                onBuyNow={() => handleShowBuyModal(product)}
                onFavorite={toggleFavorite}
                onClick={() => handleShowPreview(product)}
              />
            ))}
          </div>
          <button
            className='home__view-more'
            onClick={() => handleViewMore(title)}
          >
            View More
          </button>
        </section>
      );
    },
    [
      handleAddToCart,
      handleShowBuyModal,
      handleShowPreview,
      toggleFavorite,
      handleViewMore,
    ],
  );
  const renderFeaturedSection = () => {
    const featuredProducts = products.filter(
      (product) => product.isFeatured === true,
    );
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
            if (!product) {
              console.warn('Order is missing product details:', order);
              return null;
            }

            return (
              <Card
                key={
                  order?._id ||
                  `${product?.name || 'unknown'}-${order?.price || '0'}`
                }
                product={product}
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
          {cartItems.map((item) => {
            if (!item || !item.product) {
              console.warn('Cart item is missing product details:', item);
              return null;
            }

            return (
              <Card
                isFeatured={item.isFeatured || isFeatured || false}
                key={item._id}
                product={item.product}
                onAddToCart={() => handleAddToCart(item.product)}
                onBuyNow={() => handleShowBuyModal(item.product)}
                onFavorite={toggleFavorite}
                onClick={() => handleShowPreview(item.product)}
                initialQuantity={item.quantity}
              />
            );
          })}
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
        isFeatured={modalStates.previewProduct?.isFeatured || false}
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
