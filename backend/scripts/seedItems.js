const mongoose = require('mongoose');
const Item = require('../models/item'); // Your item schema
const products = require('../utils/products'); // The product array

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/taylormade_db'
);

// Generate fake productId (like your frontend expects)
const generateId = () =>
  `gen-${Date.now()}-${Math.random().toFixed(6).slice(2)}`;

const seedItems = async () => {
  try {
    console.log('🌱 Seeding items...');

    await Item.deleteMany(); // Clear collection

    const itemsToInsert = [];

    // Flatten and format items
    products.forEach((section) => {
      const { category, items } = section;

      items.forEach((item) => {
        itemsToInsert.push({
          ...item,
          productId: generateId(),
          categories: [category],
        });
      });
    });

    const inserted = await Item.insertMany(itemsToInsert);
    console.log(`✅ Successfully inserted ${inserted.length} items`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedItems();
