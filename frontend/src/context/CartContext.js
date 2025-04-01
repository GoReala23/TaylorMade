import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Api from '../utils/Api';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);

  const fetchCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return setCartItems([]);

      const response = await Api.getCart(token);
      if (response?.items?.length) {
        setCartItems(response.items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.warn('Failed to fetch cart:', error);
      setCartItems([]);
    }
    return cartItems;
  }, []);

  const getSavedItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Api.getSavedItems(token);
      setSavedItems(response);
    } catch (error) {
      console.warn('Failed to fetch saved items:', error);
      setSavedItems([]);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
      getSavedItems();
    }
  }, [isLoggedIn, fetchCart, getSavedItems]);

  const addToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const productId = product._id;
      if (!productId) {
        console.error(' Missing productId in CartContext.addToCart');
        throw new Error('Product ID is required');
      }

      const quantity = product.quantity || 1;

      const response = await Api.addToCart(
        {
          productId,
          quantity: parseInt(quantity, 10),
        },
        token,
      );

      if (!response || !response.items || !Array.isArray(response.items)) {
        console.error(' Invalid response from addToCart API:', response);
        throw new Error('Failed to add item to cart');
      }

      // Update the cartItems state with the response from the backend
      setCartItems(response.items);

      alert('✅ Item successfully added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('❌ Failed to add item to cart. Please try again.');
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem('token');
    await Api.removeFromCart(productId, token);
    fetchCart();
  };

  const updateCartItemQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem('token');
    await Api.updateCartQuantity(productId, newQuantity, token);
    fetchCart();
  };

  const removeSavedItem = async (productId) => {
    const token = localStorage.getItem('token');
    await Api.removeSaved(productId, token);
    getSavedItems();
  };

  const saveForLater = async (productId) => {
    const token = localStorage.getItem('token');
    await Api.saveForLater(productId, token, 1);
    fetchCart();
    getSavedItems();
  };

  const moveToCart = async (productId) => {
    const token = localStorage.getItem('token');
    await Api.moveToCart(productId, token);
    fetchCart();
    getSavedItems();
  };

  const handleQuantityChange = async (id, newQuantity, isSavedItem) => {
    if (isSavedItem) {
      await Api.updateSavedItemQuantity(
        id,
        newQuantity,
        localStorage.getItem('token'),
      );
      getSavedItems();
    } else {
      await updateCartItemQuantity(id, newQuantity);
    }
  };

  const calculateTotal = (price, quantity) => {
    if (typeof price !== 'number' || typeof quantity !== 'number')
      return '0.00';
    return (price * quantity).toFixed(2);
  };

  const calculateCartTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const price = item.product?.price || 0;
        const quantity = item.quantity || 1;
        return total + price * quantity;
      }, 0)
      .toFixed(2);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        addToCart,
        removeFromCart,
        fetchCart,
        updateCartItemQuantity,
        moveToCart,
        removeSavedItem,
        saveForLater,
        calculateTotal,
        calculateCartTotal,
        getSavedItems,
        handleQuantityChange,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
