import React, { createContext, useContext, useState, useCallback } from 'react';
import Api from '../utils/Api';

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return setOrders([]);
      const data = await Api.getUserOrders(token);
      setOrders(data);
    } catch (error) {
      console.error(' Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
    return orders;
  }, []);

  const createOrder = async (productId, quantity, address) => {
    try {
      const token = localStorage.getItem('token');

      if (!productId || !quantity || !address) {
        throw new Error(
          'Missing required fields: productId, quantity, or address',
        );
      }

      // Make API call
      const newOrder = await Api.createOrder(
        productId,
        quantity,
        address,
        token,
      );

      // Update state
      setOrders((prevOrders) => {
        const currentOrders = Array.isArray(prevOrders) ? prevOrders : [];
        return [...currentOrders, newOrder];
      });

      return newOrder;
    } catch (error) {
      console.error(' Failed to create order:', error);
      throw error;
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const updated = await Api.cancelOrder(orderId, token);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updated : order)),
      );
      return updated;
    } catch (error) {
      console.error(' Failed to cancel order:', error);
      throw error;
    }
  };

  const removeOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await Api.removeOrder(orderId, token);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error('Failed to remove order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const updated = await Api.updateOrderStatus(orderId, newStatus, token);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updated : order)),
      );
      return updated;
    } catch (error) {
      console.error(' Failed to update order status:', error);
      throw error;
    }
  };

  const clearOrders = () => setOrders([]);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        fetchOrders,
        createOrder,
        cancelOrder,
        removeOrder,
        updateOrderStatus,
        clearOrders,
        setOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};
