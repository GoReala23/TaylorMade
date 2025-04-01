import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import './Dashboard.css';

const Dashboard = () => {
  const [isLeftSide, setIsLeftSide] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { cartItems, fetchCart } = useContext(CartContext);
  const { orders, fetchOrders } = useOrders();
  useEffect(() => {
    fetchOrders();
    fetchCart();
  }, []);

  const togglePosition = () => {
    setIsLeftSide(!isLeftSide);
    document.body.classList.toggle('dashboard__left', isLeftSide);
  };

  return (
    <div
      className={`dashboard ${isLeftSide ? 'dashboard__left' : 'dashboard__top'}`}
    >
      <nav className='dashboard__nav'>
        <ul className='dashboard__nav-list'>
          <li className='dashboard__nav-item'>
            <Link to='/orders' className='dashboard__nav-link'>
              Orders ({orders.length})
            </Link>
          </li>
          <li className='dashboard__nav-item'>
            <Link to='/cart' className='dashboard__nav-link'>
              Cart ({cartItems.length})
            </Link>
          </li>
          <li className='dashboard__nav-item'>
            <Link to='/settings' className='dashboard__nav-link'>
              Settings
            </Link>
          </li>
          {currentUser?.isAdmin && (
            <li className='dashboard__nav-item'>
              <Link to='/admin/products' className='dashboard__nav-link'>
                Manage Products
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <button className='dashboard__toggle' onClick={togglePosition}>
        {isLeftSide ? 'Move to Top' : 'Move to Left'}
      </button>
    </div>
  );
};

export default Dashboard;
