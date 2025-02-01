const users = require('./users');

const BASE_URL = 'http://localhost:5000';
const THIRD_PARTY_API_URL = 'https://fakestoreapi.com/products';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch data');
  }
  return response.json();
};

const getToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
};
const Api = {
  register: async (name, email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.warn(
        'Backend unavailable. Using local storage for registration.',
      );

      const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

      if (storedUsers.some((user) => user.email === email)) {
        throw new Error('Email is already registered');
      }

      const newUser = { name, email, password, isAdmin: false };
      storedUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(storedUsers));
      localStorage.setItem('user', JSON.stringify(newUser));

      return { token: `fake-jwt-${Date.now()}`, user: newUser };
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Using local storage for login.');

      const storedUsers = JSON.parse(localStorage.getItem('users')) || [
        ...users,
      ];
      const user = storedUsers.find(
        (u) => u.email === email && u.password === password,
      );

      if (!user) throw new Error('Invalid email or password');

      const token = `fake-jwt-${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    }
  },

  getCurrentUser: async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token provided');

      const response = await fetch(`${BASE_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Using local storage for user.');

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found');

      return user;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getItems: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/item`, { method: 'GET' });
      return await handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Fetching from third-party API.');

      try {
        const response = await fetch(THIRD_PARTY_API_URL);
        if (!response.ok) throw new Error('Third-party API error');

        const data = await response.json();
        return data.map((product) => ({
          _id: product.id,
          name: product.title,
          price: product.price,
          description: product.description,
          imageUrl: product.image,
          categories: ['Others'],
          isFeatured: false,
        }));
      } catch (thirdPartyError) {
        console.error('Failed to fetch third-party products:', thirdPartyError);
        return [];
      }
    }
  },

  getCart: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Using local storage for cart.');

      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      return cart;
    }
  },

  saveForLater: async (productId, token, quantity) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/cart/save-for-later/${productId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        },
      );
      return handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Saving item locally.');

      const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
      const existingItem = savedItems.find(
        (item) => item.productId === productId,
      );

      if (existingItem) {
        existingItem.quantity += quantity; // Prevent duplicates
      } else {
        savedItems.push({ productId, quantity });
      }

      localStorage.setItem('savedItems', JSON.stringify(savedItems));
      return { productId, quantity };
    }
  },
  getSavedItems: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart/saved`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Using local storage for saved items.');

      const savedItems = localStorage.getItem('savedItems');
      return savedItems ? JSON.parse(savedItems) : [];
    }
  },

  createOrder: async (productId, quantity, address, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity, address }),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Saving order locally.');

      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const newOrder = {
        id: Date.now(),
        productId,
        quantity,
        address,
        status: 'Pending',
      };
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));

      return newOrder;
    }
  },

  getUserOrders: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Using local storage for user orders.');

      return JSON.parse(localStorage.getItem('orders')) || [];
    }
  },

  removeOrder: async (orderId, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Removing order locally.');

      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const orderIndex = orders.findIndex((order) => order.id === orderId);

      if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        return { success: true };
      }
      return { success: false };
    }
  },

  getFeaturedProducts: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/item/fetaured`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.warn('Backend unavailable. Fetching from third-party API.');
      const items = await Api.getItems();
      return items.filter((item) => item.isFeatured);
    }
  },
};

export default Api;
