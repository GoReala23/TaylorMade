import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import Api from '../../utils/Api';
import './Orders.css';
import Card from '../Card/Card';

const Orders = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { orders, fetchOrders } = useOrders();
  useEffect(() => {
    fetchOrders().then(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return <div className='orders__loading'>Loading...</div>;
  }

  if (!orders.length) {
    return <div className='orders__empty'>No orders found.</div>;
  }

  return (
    <div
      className={`orders ${isLoggedIn ? 'orders--dashboard' : 'orders--no-dashboard'}`}
    >
      <div className='orders__container'>
        {' '}
        <h1>Your Orders</h1>
        <div className='orders__filter'>
          <label htmlFor='filter'>Filter by status:</label>
          <select
            className='orders__filter-select'
            id='filter'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value='all'>All</option>
            <option value='pending'>Pending</option>
            <option value='shipped'>Shipped</option>
            <option value='delivered'>Delivered</option>
          </select>
        </div>
        <div className='orders__list'>
          {filteredOrders.map((order) => (
            <div key={order._id} className='orders__item'>
              {order.item && order.item.length > 0 && (
                <div className='orders__products'>
                  {order.item.map((item) => (
                    <Card
                      key={item._id}
                      product={item}
                      showQuantity={false}
                      initialQuantity={1}
                      isFeatured={item.isFeatured}
                      isSaved={item.isSaved}
                      savedQuantity={item.savedQuantity}
                      isOrder={true}
                      isAdmin={false}
                    />
                  ))}
                </div>
              )}
              <p>Created At: {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
