const mongoose = require('mongoose');
const Item = require('../models/item');
const fetch = require('node-fetch');
const Like = require('../models/likes');

const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ServerError,
} = require('../errors/errors');

const THIRD_PARTY_API_URL = 'https://fakestoreapi.com/products';

// Function to fetch products from the third-party API
const fetchThirdPartyProducts = async () => {
  try {
    const response = await fetch(THIRD_PARTY_API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Third-party API error:', errorData);
      throw new Error(
        errorData.message || 'Failed to fetch third-party products'
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching third-party products:', error);
    return [];
  }
};

const transformFakeApiData = (fakeStoreItems) => {
  return fakeStoreItems.map((item) => {
    // Validate and handle image URL
    let validImageUrl = item.image;
    try {
      new URL(item.image);
    } catch (e) {
      validImageUrl = '/Images/products/default.jpg';
      console.error(`Invalid image URL for product ${item.title}:`, e);
    }

    // Category mapping logic
    const categories = mapCategories(item);

    return {
      name: item.title,
      price: item.price,
      description: item.description,
      imageUrl: item.image,
      categories: categories,
      isSaved: false,
      savedQuantity: 1,
      comments: [],
      likes: [],
      isFeatured: false,
    };
  });
};

const mapCategories = (item) => {
  const searchText =
    `${item.category} ${item.title} ${item.description}`.toLowerCase();
  const categories = [];

  // Category mapping rules
  const categoryMappings = {
    others: ['electronics', 'gaming', 'computer', 'phone', 'digital'],
    meals: ['food', 'meal', 'dish', 'cuisine'],
    sweets: ['candy', 'sweet', 'dessert', 'chocolate'],
    breads: ['bread', 'bakery', 'pastry', 'baked'],
    butters: ['butter', 'spread', 'margarine'],
  };

  // Check each category's keywords
  Object.entries(categoryMappings).forEach(([category, keywords]) => {
    if (keywords.some((keyword) => searchText.includes(keyword))) {
      categories.push(category.charAt(0).toUpperCase() + category.slice(1));
    }
  });

  // Default to 'Others' if no category matched
  return categories.length > 0 ? categories : ['Others'];
};

// get all items
const getItems = async (req, res, next) => {
  try {
    // Get local database items
    const dbItems = await Item.find({});

    // Fetch third-party products
    let fakeStoreItems = [];
    try {
      fakeStoreItems = await fetchThirdPartyProducts();
    } catch (error) {
      next(
        new ServerError('An error occurred while fetching third-party products')
      );
    }

    // Filter food products
    const filterFoodProducts = (products) => {
      const foodKeywords = [
        'food',
        'meal',
        'dish',
        'snack',
        'candy',
        'sweet',
        'dessert',
      ];

      return products.filter((product) => {
        const lowerCaseTitle = product.title.toLowerCase();
        const lowerCaseDescription = product.description.toLowerCase();

        return (
          foodKeywords.some((keyword) => lowerCaseTitle.includes(keyword)) ||
          foodKeywords.some((keyword) => lowerCaseDescription.includes(keyword))
        );
      });
    };

    const filteredFakeStoreItems = filterFoodProducts(fakeStoreItems);

    // Transform and save products
    const transformedFakeItems =
      filteredFakeStoreItems.length > 0
        ? transformFakeApiData(filteredFakeStoreItems)
        : [];

    for (const product of transformedFakeItems) {
      const existingItem = await Item.findOne({ name: product.name });
      if (!existingItem) {
        await Item.create(product);
      }
    }

    const markedDbItems = dbItems.map((item) => ({
      ...item.toObject(),
      source: 'database',
    }));

    const markedFakeItems = transformedFakeItems.map((item) => ({
      ...item,
      source: 'third-party',
    }));

    // Combine local database items with transformed fake store items
    const allItems = [...markedDbItems, ...markedFakeItems];
    res.json(allItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    res
      .status(500)
      .json({ message: 'Error fetching items', error: error.message });
  }
};

// Create a new item
async function createItem(req, res) {
  const { name, price, description, imageUrl, categories, isFeatured } =
    req.body;
  try {
    // Validate request body
    if (!name || !price || !description || !imageUrl || !categories) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const itemCategories = Array.isArray(categories) ? categories : ['Others'];

    // Create new item
    const newItem = new Item({
      name,
      price,
      description,
      imageUrl,
      categories: itemCategories,
      isFeatured: isFeatured || false,
    });

    await newItem.save();

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error creating item:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get an item by ID

const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return next(new NotFoundError('Item not found'));
    }
    res.json(item);
  } catch (err) {
    next(new ServerError('An error occurred while fetching the item'));
  }
};

const updateItem = async (req, res, next) => {
  const { name, price, description, imageUrl, categories } = req.body;

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name, price, description, imageUrl, categories },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return next(new NotFoundError('Item not found'));
    }
    res.json(updatedItem);
  } catch (err) {
    next(new ServerError('An error occurred while updating the item'));
  }
};

// Delete an item by ID
const deleteItem = async (req, res, next) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return next(new NotFoundError('Item not found'));
    }
    res.json({ message: 'Item deleted' });
  } catch (err) {
    next(new ServerError('An error occurred while deleting the item'));
  }
};

const likeItem = async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user ? req.user.id : null;

  try {
    if (!itemId || !userId) {
      return next(new BadRequestError('Item ID and User ID are required'));
    }

    const existingLike = await Like.findOne({ user: userId, item: itemId });
    if (existingLike) {
      return next(new ConflictError('Item already liked'));
    }

    const like = new Like({ user: userId, item: itemId });
    await like.save();
    res.status(201).json(like);
  } catch (err) {
    next(new ServerError('An error occurred while liking the item'));
  }
};
const toggleFeatured = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return next(new NotFoundError('Item not found'));

    item.isFeatured = !item.isFeatured;
    await item.save();
    res.json(item);
  } catch (error) {
    next(new ServerError('An error occurred while toggling featured status'));
  }
};

// For Emergency Product Adds

const bulkCreateItems = async (req, res) => {
  try {
    const items = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: 'Request body must be an array of items',
      });
    }

    // Validate each item
    const invalidItems = items.filter(
      (item) =>
        !item.name ||
        !item.price ||
        !item.description ||
        !item.imageUrl ||
        !item.category ||
        !['Sweets', 'Meals', 'Breads', 'Butters', 'Others'].includes(
          item.category
        )
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        message: 'Invalid items found',
        invalidItems,
      });
    }

    // Convert category to an array of strings
    const itemsWithCategories = items.map((item) => ({
      ...item,
      categories: [item.category], // Convert single category to an array
    }));

    const createdItems = await Item.insertMany(itemsWithCategories);

    res.status(201).json({
      message: `Successfully created ${createdItems.length} items`,
      items: createdItems,
    });
  } catch (error) {
    console.error('Error in bulkCreateItems:', error.message);
    res.status(500).json({
      message: 'Error creating items',
      error: error.message,
    });
  }
};
const getFeaturedProducts = async (req, res, next) => {
  try {
    const items = getItems().find({ isFeatured: true });
    if (!items) {
      return next(new NotFoundError('Featured items not found'));
    }
    res.json(items);
  } catch (err) {
    next(new ServerError('An error occurred while fetching featured items'));
  }
};

// For Emergency Product Adds

// const bulkCreateItems = async (req, res) => {
//   try {
//     const items = req.body;

//     if (!Array.isArray(items)) {
//       return res.status(400).json({
//         message: 'Request body must be an array of items',
//       });
//     }

//     // Validate each item
//     const invalidItems = items.filter(
//       (item) =>
//         !item.name ||
//         !item.price ||
//         !item.description ||
//         !item.imageUrl ||
//         !item.category ||
//         !['Sweets', 'Meals', 'Breads', 'Butters', 'Others'].includes(
//           item.category
//         )
//     );

//     if (invalidItems.length > 0) {
//       return res.status(400).json({
//         message: 'Invalid items found',
//         invalidItems,
//       });
//     }

//     const createdItems = await Item.insertMany(items);

//     res.status(201).json({
//       message: `Successfully created ${createdItems.length} items`,
//       items: createdItems,
//     });
//   } catch (error) {
//     console.error('Error in bulkCreateItems:', error.message);
//     res.status(500).json({
//       message: 'Error creating items',
//       error: error.message,
//     });
//   }
// };

module.exports = {
  bulkCreateItems,
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  toggleFeatured,
  getFeaturedProducts,
  likeItem,
};
