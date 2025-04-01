import { useContext, useState, useEffect, useCallback } from 'react';
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
import Locations from '../Locations/Locations';
import LandingPage from '../LandingPage/LandingPage';
import CartModal from '../Modals/CartModal/CartModal';
import Footer from '../Footer/Footer';
import Api from '../../utils/Api';
import './App.css';
import '../../fonts/fonts.css';
// import { formatProductData } from '../Card/Card';

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

  const updateUser = useCallback(
    async (userData) => {
      try {
        await Api.updateUser(token, userData);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    },
    [token],
  );

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
      product,
      quantity: 1,
    });
    console.log('Preview Product:', product);
    console.log(product);
  };

  const openBuyModal = (product) => {
    setModalStates({
      type: 'buy',
      product,
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
      const fetchData = async () => {
        await Promise.all([fetchItems(), fetchOrders()]);
      };
      fetchData();
    }
  }, [isLoggedIn]);

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
      <main
        className={`App__content ${isLoggedIn ? 'App__content--dashboard' : 'App__content--no-dashboard'}`}
      >
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
                likeItem={likeItem}
                openPreview={openPreview}
                openBuyModal={openBuyModal}
                featuredProducts={featuredProducts}
              />
            }
          />
          <Route
            path='/products'
            element={
              <Products
                items={items}
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
          <Route path='/locations' element={<Locations />} />
        </Routes>
        <Footer />
      </main>
    </div>
  );
};

export default App;
