import products from './products';

const BASE_URL = 'http://localhost:5000' || 'https://fakestoreapi.com/products';

const checkIfAdmin = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/check-admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
const handleResponse = async (response) => {
  try {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Error: ${response.status}`);
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'An unknown error occurred');
  }
};

const handleError = (error, methodCalled) => {
  console.error('Error in', methodCalled, ':', error);
  throw new Error(error.message);
};

const Api = {
  register: async (name, email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'register');
    }
  },

  login: async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Both email and password are required');
      }

      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'login');
    }
  },

  getCurrentUser: async (token) => {
    if (!token) {
      throw new Error('No authentication token provided');
    }

    try {
      const response = await fetch(`${BASE_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'getCurrentUser');
    }
  },

  updateUser: async (token, userData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/user/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'updateUser');
    }
  },
  getItems: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/item`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      return await response.json();
    } catch (error) {
      console.warn('Failed to fetchs from Api. Using hardcoded data');
      return products.flatMap((category) => category.items);
    }
  },
  addToCart: async (data, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      alert('Item added to cart');
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'addToCart');
    }
  },

  moveToCart: async (productId, token) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/cart/move-to-cart/${productId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'moveToCart');
    }
  },

  removeSaved: async (productId, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart/saved/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove saved item');
      }
      return response.json();
    } catch (error) {
      return handleError(error, 'removeSaved');
    }
  },

  removeFromCart: async (productId, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'removeFromCart');
    }
  },

  // Like an item
  likeItem: async (itemId, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/item/${itemId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'likeItem');
    }
  },

  // Get User Orders
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
      return handleError(error, 'getUserOrders');
    }
  },

  getAllOrders: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          // Check if the user is an admin
          const isAdmin = await checkIfAdmin(token);
          if (isAdmin) {
            // If the user is an admin, retry the request
            const adminResponse = await fetch(`${BASE_URL}/api/orders/all`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (!adminResponse.ok) {
              throw new Error('Failed to get all orders as admin');
            }

            return adminResponse.json();
          }
        }
        throw new Error('Network response was not ok');
      }

      return response.json();
    } catch (error) {
      return handleError(error, 'getAllOrders');
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
      if (!response.ok) {
        throw new Error('Failed to remove order');
      }
      return response.json();
    } catch (error) {
      return handleError(error, 'removeOrder');
    }
  },

  cancelOrder: async (orderId, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/cancel/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }
      return response.json();
    } catch (error) {
      return handleError(error, 'cancelOrder');
    }
  },
  updateCartQuantity: async (productId, newQuantity, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, newQuantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update cart quantity');
      }

      return await response.json();
    } catch (error) {
      return handleError(error, 'updateCartQuantity');
    }
  },

  updateSavedItemQuantity: async (savedItemId, newQuantity, token) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/cart/saved/update/${savedItemId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ savedItemId, newQuantity }),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to update saved item quantity',
        );
      }
      return await response.json();
    } catch (error) {
      return handleError(error, 'updateSavedItemQuantity');
    }
  },

  getSavedItems: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart/saved`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch saved items');
      }
      return await response.json();
    } catch (error) {
      return handleError(error, 'getSavedItems');
    }
  },

  getCart: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await handleResponse(response);

      return data;
    } catch (error) {
      return handleError(error, 'getCart');
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
      return handleError(error, 'saveForLater');
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
        body: JSON.stringify({
          productId,
          quantity,
          address,
        }),
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'createOrder');
    }
  },
  updateOrderStatus: async (orderId, status, token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'updateOrderStatus');
    }
  },

  getFeaturedProducts: async () => {
    try {
      console.log('getFeaturedProducts');
      const response = await fetch(`${BASE_URL}/api/item/featured`);
      console.log(response);
      const data = await handleResponse(response);
      console.log('Processed data:', data);
      return data;
    } catch (error) {
      return handleError(error, 'getFeaturedProducts');
    }
  },

  toggleFeaturedProduct: async (productId) => {
    const response = await fetch(
      `${BASE_URL}/api/items/${productId}/featured`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return handleResponse(response);
  },

  setupTwoFactor: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/setup-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'setupTwoFactor');
    }
  },

  verifyTwoFactor: async (token, twoFactorToken) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: twoFactorToken }),
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'verifyTwoFactor');
    }
  },
};

export default Api;
