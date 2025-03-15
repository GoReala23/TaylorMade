const Cart = require('../models/cart');
const Item = require('../models/item');
const User = require('../models/user');
const Product = require('../models/item');

const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ServerError,
} = require('../errors/errors');
const { default: mongoose, get } = require('mongoose');

// Add item to cart
const addItemToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;

  try {
    if (!productId) {
      return next(new BadRequestError('Product ID is required'));
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // console.log(`Cart updated successfully for user: ${userId}: ${productId}`);
    res.status(200).json(cart);
  } catch (error) {
    next(new ServerError('An error occurred while adding item to cart'));
  }
};
// Remove item from cart
const removeItemFromCart = async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.userId;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return next(new NotFoundError('Cart not found'));

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    next(new ServerError('An error occurred while removing item from cart'));
  }
};

// Update item quantity in cart
const updateCartItemQuantity = async (req, res, next) => {
  const { productId, newQuantity } = req.body;
  console.log('productId:', productId);

  const userId = req.user.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(
        new BadRequestError(
          'Invalid product ID format. Please check the product ID'
        )
      );
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return next(new NotFoundError('Cart not found'));

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem) return next(new NotFoundError('Item not found in cart'));

    cartItem.quantity = newQuantity;

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    next(
      new ServerError('An error occurred while updating cart item quantity')
    );
  }
};

// Update saved item quantity
const updateSavedItemQuantity = async (req, res, next) => {
  const { productId } = req.params;
  const { newQuantity } = req.body;
  const userId = req.user.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new BadRequestError('Invalid product ID format'));
    }

    const user = await User.findById(userId);
    if (!user) return next(new NotFoundError('User not found'));

    const savedItem = user.savedItems.find(
      (item) => item.product.toString() === productId
    );
    if (!savedItem) return next(new NotFoundError('Saved item not found'));

    savedItem.quantity = newQuantity;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    next(
      new ServerError('An error occurred while updating saved item quantity')
    );
  }
};

// Get cart contents
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    // console.log('Existing Cart data:', cart);

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
      console.log('Created new Cart:', cart);
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching or creating cart:', error);
    next(
      new ServerError('An error occurred while fetching or creating the cart')
    );
  }
};
const moveToCart = async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    const savedItem = user.savedItems.find(
      (item) => item.product && item.product.toString() === productId
    );
    if (!savedItem) {
      return next(new NotFoundError('Saved item not found'));
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const existingCartItem = cart.items.find(
      (item) => item.product && item.product.toString() === productId
    );
    if (existingCartItem) {
      existingCartItem.quantity += savedItem.quantity;
    } else {
      cart.items.push({
        product: savedItem.product,
        quantity: savedItem.quantity,
      });
    }

    user.savedItems = user.savedItems.filter(
      (item) => item.product && item.product.toString() !== productId
    );
    await Promise.all([cart.save(), user.save()]);

    await cart.populate('items.product');
    res.status(200).json({ message: 'Item moved to cart', cart });
  } catch (error) {
    res;
    next(new ServerError('An error occurred while moving saved item to cart'));
  }
};
const removeSaved = async (req, res, next) => {
  // console.log('Removing saved item:', req.params.productId);
  const { productId } = req.params;
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    user.savedItems = user.savedItems.filter(
      (item) => item.product && item.product.toString() !== productId
    );

    await user.save();
    res.status(200).json({ message: 'Saved item removed successfully' });
  } catch (error) {
    console.error('Error removing saved item:', error);
    next(new ServerError('An error occurred while removing saved item'));
  }
};
const getSavedItems = async (req, res, next) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId).populate('savedItems.product');
    if (!user) {
      return next(new NotFoundError('User not found'));
    }
    res.status(200).json(user.savedItems);
  } catch (error) {
    next(new ServerError('An error occurred while fetching saved items'));
  }
};
const saveForLater = async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.userId;
  try {
    const cart = await Cart.findOne({ user: userId });
    const user = await User.findById(userId);

    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (cartItem) {
      user.savedItems.push({
        product: productId,
        quantity: cartItem.quantity,
      });
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );

      await Promise.all([cart.save(), user.save()]);
    }

    // Return the saved items for better visualization
    res
      .status(200)
      .json({ message: 'Item saved for later', savedItems: user.savedItems });
  } catch (error) {
    next(new ServerError('An error occurred while saving for later'));
    ac;
  }
};

module.exports = {
  saveForLater,
  removeSaved,
  moveToCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  updateSavedItemQuantity,
  getCart,
  getSavedItems,
};

// Update item quantity in cart

// const updateCartItemQuantity = async (productId, newQuantity) => {
//   try {
//     const token = localStorage.getItem('token');
//     const response = await Api.updateCartQuantity(
//       productId,
//       newQuantity,
//       token
//     );
//     if (response && response.cart) {
//       setCartItems((prev) =>
//         prev.map((item) =>
//           item.product._id === productId
//             ? { ...item, quantity: newQuantity }
//             : item
//         )
//       );
//     }
//   } catch (error) {
//     console.error('Error updating cart quantity:', error);
//   }
// };
// Update saved item quantity
// const updateSavedItemQuantity = async (savedItemId, newQuantity) => {
//   try {
//     const token = localStorage.getItem('token');
//     const response = await Api.updateSavedItemQuantity(
//       savedItemId,
//       newQuantity,
//       token
//     );
//     if (response && response.savedItems) {
//       setSavedItems(response.savedItems);
//     }
//   } catch (error) {
//     console.error('Error updating saved item quantity:', error);
//   }
// };
