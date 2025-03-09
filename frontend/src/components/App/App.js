import { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useFeaturedProducts } from '../../context/FeaturedProductsContext';
import { useCurrentUser } from '../../context/CurrentUserContext';
import Header from '../Header/Header';
import Dashboard from '../Dashboard/Dashboard';
import Home from '../Home/Home';
import Products from '../Products/Products';
import Profile from '../Profile/Profile';
import Orders from '../Orders/Orders';
import Settings from '../Settings/Settings';
import About from '../About/About';
// import Locations from '../Locations/Locations';
import LandingPage from '../LandingPage/LandingPage';
import CartModal from '../Modals/CartModal/CartModal';
import Footer from '../Footer/Footer';
import Api from '../../utils/Api';
import './App.css';
import { formatProductData } from '../Card/Card';

const App = ({ token }) => {
  const { isLoggedIn, currentUser } = useContext(AuthContext);
  const { cartItems, fetchCart } = useContext(CartContext);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const { featuredProducts } = useFeaturedProducts();
  const [modalStates, setModalStates] = useState({
    type: null,
    product: null,
    quantity: 1,
    showPreview: false,
    showBuyModal: false,
    previewProduct: null,
    productToBuy: null,
  });

  const [showCartModal, setShowCartModal] = useState(false);

  const updateUser = async (userData) => {
    try {
      await Api.updateUser(token, userData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  //  Fetch Items
  const fetchItems = async () => {
    try {
      const data = await Api.getItems(token);
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  //  Fetch Orders
  const fetchOrders = async () => {
    try {
      const tokenFetched = localStorage.getItem('token');
      const data = await Api.getUserOrders(tokenFetched);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Like Item
  const likeItem = async (itemId) => {
    try {
      await Api.likeItem(itemId, token);
      fetchItems();
    } catch (error) {
      console.error('Error liking item:', error);
    }
  };

  const openPreview = (product) => {
    setModalStates({
      type: 'preview',
      product: formatProductData(product),
      quantity: 1,
    });
    console.log('Preview Product:', product);
    console.log(product);
  };

  const openBuyModal = (product) => {
    setModalStates({
      type: 'buy',
      product: formatProductData(product),
      quantity: 1,
    });
  };

  const closeModal = () => {
    setModalStates({
      type: null,
      product: null,
      quantity: 1,
    });
  };

  // Fetch Data When Logged In
  useEffect(() => {
    if (isLoggedIn) {
      fetchItems();
      fetchOrders();
      // fetchCart();
      // fetchSavedItems();
    }
  }, [isLoggedIn, token]);

  //  Fetch Cart
  // const fetchCart = async () => {
  //   try {
  //     const tokenFetched = localStorage.getItem('token');
  //     const data = await Api.getCart(tokenFetched);
  //     setCart(data);
  //     // console.log(data);
  //   } catch (error) {
  //     console.error('Error fetching cart:', error);
  //   }
  // };

  //  Fetch Saved Items
  // const fetchSavedItems = async () => {
  //   try {
  //     const tokenFetched = localStorage.getItem('token');
  //     const data = await Api.getSavedItems(tokenFetched);
  //     setSavedItems(data);
  //     // console.log(data);
  //   } catch (error) {
  //     console.error('Error fetching saved items:', error);
  //   }
  // };

  // Update User Profile

  //  Add Item to Cart
  // const addToCart = async (product) => {
  //   try {
  //     await Api.addToCart(product, token);
  //     fetchCart();
  //   } catch (error) {
  //     console.error('Error adding to cart:', error);
  //   }
  // };

  //  Remove Item from Cart
  // const removeFromCart = async (productId) => {
  //   try {
  //     await Api.removeFromCart(productId, token);
  //     fetchCart();
  //   } catch (error) {
  //     console.error('Error removing from cart:', error);
  //   }
  // };

  //  Save Item for Later
  // const saveForLater = async (productId, quantity) => {
  //   try {
  //     await Api.saveForLater(productId, token, quantity);
  //     fetchCart();
  //     fetchSavedItems();
  //   } catch (error) {
  //     console.error('Error saving item for later:', error);
  //   }
  // };
  //  Move Saved Item to Cart
  // const moveToCart = async (productId) => {
  //   try {
  //     await Api.moveToCart(productId, token);
  //     fetchCart();
  //     fetchSavedItems();
  //   } catch (error) {
  //     console.error('Error moving saved item to cart:', error);
  //   }
  // };

  //  Remove Saved Item
  // const removeSavedItem = async (productId) => {
  //   try {
  //     await Api.removeSaved(productId, token);
  //     fetchSavedItems();
  //   } catch (error) {
  //     console.error('Error removing saved item:', error);
  //   }
  // };

  //  Update Cart Quantity
  // const updateCartQuantity = async (productId, newQuantity) => {
  //   try {
  //     await Api.updateCartQuantity(productId, newQuantity, token);
  //     fetchCart();
  //   } catch (error) {
  //     console.error('Error updating cart quantity:', error);
  //   }
  // };

  // //  Update Saved Item Quantity
  // const updateSavedItemQuantity = async (savedItemId, newQuantity) => {
  //   try {
  //     await Api.updateSavedItemQuantity(savedItemId, newQuantity, token);
  //     // fetchSavedItems();
  //   } catch (error) {
  //     console.error('Error updating saved item quantity:', error);
  //   }
  // };

  return (
    <div className='App'>
      <Header />
      {isLoggedIn && (
        <Dashboard
          user={currentUser}
          cartItems={cart}
          orders={orders}
          fetchCart={fetchCart}
          fetchOrders={fetchOrders}
        />
      )}
      <main className='App__content'>
        <Routes>
          <Route
            path='/'
            element={!isLoggedIn ? <LandingPage /> : <Navigate to='/home' />}
          />
          <Route
            path='/dashboard'
            element={
              isLoggedIn ? (
                <Home
                  items={items}
                  orders={orders}
                  fetchItems={fetchItems}
                  fetchOrders={fetchOrders}
                  savedItems={savedItems}
                  // cartItems={cart}
                  // addToCart={addToCart}
                  // removeFromCart={removeFromCart}
                  // updateCartQuantity={updateCartQuantity}
                  // saveForLater={saveForLater}
                  // fetchCart={fetchCart}
                  // fetchSavedItems={fetchSavedItems}
                  // likeItem={likeItem}
                  // moveToCart={moveToCart}
                  // removeSavedItem={removeSavedItem}
                />
              ) : (
                <Navigate to='/' state={{ openLogin: true }} />
              )
            }
          />
          <Route
            path='/home'
            element={
              <Home
                items={items}
                orders={orders}
                cartItems={cart}
                savedItems={savedItems}
                fetchItems={fetchItems}
                fetchOrders={fetchOrders}
                fetchCart={fetchCart}
                // fetchSavedItems={fetchSavedItems}
                likeItem={likeItem}
                // moveToCart={moveToCart}
                // removeSavedItem={removeSavedItem}
                openPreview={openPreview}
                openBuyModal={openBuyModal}
                featuredProducts={featuredProducts}
                // modalState={modalStates || {}}
                // setModalState={setModalStates}
                // closeModal={closeModal}                // addToCart={addToCart}
                // removeFromCart={removeFromCart}
                // updateCartQuantity={updateCartQuantity}
                // saveForLater={saveForLater}
              />
            }
          />
          <Route
            path='/products'
            element={
              <Products
                items={items}
                // addToCart={addToCart}
                likeItem={likeItem}
                fetchItems={fetchItems}
                openPreview={openPreview}
                openBuyModal={openBuyModal}
                closeModal={closeModal}
                modalStates={modalStates || {}}
                setModalStates={setModalStates}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route
            path='/profile'
            element={isLoggedIn ? <Profile /> : <Navigate to='/?login=true' />}
          />
          <Route
            path='/orders'
            element={
              isLoggedIn ? (
                <Orders
                  orders={orders}
                  fetchOrders={fetchOrders}
                  setOrders={setOrders}
                />
              ) : (
                <Navigate to='/' />
              )
            }
          />
          <Route
            path='/settings'
            element={isLoggedIn ? <Settings /> : <Navigate to='/' />}
          />
          <Route
            path='/cart'
            element={isLoggedIn ? <CartModal /> : <Navigate to='/' />}
          />
          <Route path='/about' element={<About />} />
          {/* <Route path='/locations' element={<Locations />} /> */}
        </Routes>
        <Footer />
      </main>
    </div>
  );
};

export default App;
