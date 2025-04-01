const products = [
  {
    category: 'Sweets',
    items: [
      {
        name: 'Chocolate Cake',
        price: 15.99,
        description: 'Rich chocolate cake',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926167/chocolate_cake_ub4vsp.webp',
        isFeatured: true,
      },
      {
        name: 'Colorful Macarons',
        price: 10.99,
        description: 'Assorted macarons in various flavors',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926178/macarons_kjne5p.webp',
      },
      {
        name: 'Caramel Pudding',
        price: 7.99,
        description: 'Creamy caramel pudding',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926165/caramel_pudding_gyvkke.webp',
      },
      {
        name: 'Strawberry Shortcake',
        price: 12.99,
        description: 'Classic strawberry shortcake',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926178/strawberry_shortcake_rzyon7.webp',
      },
      {
        name: 'Fudge Brownies',
        price: 8.99,
        description: 'Dense and chocolatey fudge brownies',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926168/fudge_brownies_d6d9r8.webp',
      },
      {
        name: 'Vanilla Cupcakes',
        price: 6.99,
        description: 'Vanilla cupcakes with buttercream frosting',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926181/vanilla_cupcakes_s96wfb.webp',
      },
    ],
  },
  {
    category: 'Meals',
    items: [
      {
        name: 'Chicken Pasta',
        price: 12.99,
        description: 'Creamy chicken pasta',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926166/chicken_pasta_-_Copy_qqdotz.webp',
      },
      {
        name: 'Grilled Steak',
        price: 18.99,
        description: 'Juicy grilled steak with vegetables',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926168/grilled_steak_ir66ju.webp',
      },
      {
        name: 'Herb-Roasted Chicken',
        price: 15.99,
        description: 'Tender herb-roasted chicken',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926168/herb_chicken_rrvjzl.webp',
      },
      {
        name: 'Salmon with Lemon',
        price: 19.99,
        description: 'Pan-seared salmon with lemon garnish',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926178/salmon_vqtosq.webp',
        isFeatured: true,
      },
      {
        name: 'Vegetarian Lasagna',
        price: 13.99,
        description: 'Vegetarian lasagna with layers of veggies',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926179/vegetarian_lasagna_pofugw.webp',
      },
      {
        name: 'Beef Stir Fry',
        price: 14.99,
        description: 'Savory beef stir fry',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926165/beef_stir_fry_pnz4je.webp',
      },
    ],
  },
  {
    category: 'Breads',
    items: [
      {
        name: 'Crusty Baguette',
        price: 3.99,
        description: 'Freshly baked crusty baguette',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926165/baguette_pdlty4.webp',
      },
      {
        name: 'Sourdough Loaf',
        price: 5.99,
        description: 'Tangy sourdough loaf',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926178/sourdough_srsiet.webp',
        isFeatured: true,
      },
      {
        name: 'Croissants',
        price: 4.99,
        description: 'Flaky and buttery croissants',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926167/croissants_woqume.webp',
      },
      {
        name: 'Whole Wheat Rolls',
        price: 4.49,
        description: 'Healthy whole wheat rolls',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926179/wheat_rolls_fsajpw.webp',
      },
      {
        name: 'Focaccia with Herbs',
        price: 5.99,
        description: 'Focaccia topped with herbs',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926167/focaccia_odksjg.webp',
      },
      {
        name: 'Pretzels',
        price: 3.49,
        description: 'Soft and salty pretzels',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926178/pretzel_u5elde.webp',
      },
    ],
  },
  {
    category: 'Butters',
    items: [
      {
        name: 'Peanut Butter',
        price: 3.99,
        description: 'Smooth and creamy peanut butter',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926178/peanut_butter_sea8lj.webp',
      },
      {
        name: 'Whipped Honey Butter',
        price: 4.99,
        description: 'Honey butter whipped to perfection',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926178/honey_butter_gert6i.webp',
      },
      {
        name: 'Garlic Herb Butter',
        price: 5.49,
        description: 'Butter infused with garlic and herbs',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926167/garlic_butter_wbmkuy.webp',
        isFeatured: true,
      },
      {
        name: 'Almond Butter',
        price: 6.99,
        description: 'Nutty almond butter',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926165/almond_butter_k9mltq.webp',
      },
      {
        name: 'Chocolate Spread',
        price: 4.99,
        description: 'Rich chocolate spread',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926167/chocolate_spread_hmpohd.webp',
      },
      {
        name: 'Cashew Butter',
        price: 7.49,
        description: 'Creamy cashew butter',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926166/cashew_butter_t4zivg.webp',
      },
    ],
  },
  {
    category: 'Others',
    items: [
      {
        name: 'Mixed Fruit Salad',
        price: 8.99,
        description: 'Freshly made fruit salad',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926167/fruit_salad_yz25da.webp',
        isFeatured: true,
      },
      {
        name: 'Jar of Pickles',
        price: 4.99,
        description: 'Crunchy homemade pickles',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926178/pickles_qix58u.webp',
      },
      {
        name: 'Cheese Platter',
        price: 14.99,
        description: 'Assorted cheeses on a platter',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926166/cheese_platter_yqxjx7.webp',
      },
      {
        name: 'Sushi Rolls',
        price: 12.99,
        description: 'Freshly prepared sushi rolls',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926179/sushi_qadtyy.webp',
        isFeatured: true,
      },
      {
        name: 'Boiled Peanuts',
        price: 5.99,
        description: 'Delicious boiled peanuts',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926165/boiled_peanuts_dyh6cj.webp',
      },
      {
        name: 'Bowl of Guacamole',
        price: 7.49,
        description: 'Creamy guacamole dip',
        imageUrl:
          'https://res.cloudinary.com/dqrnaqgpy/image/upload/v1742926168/guacamole_vghp7e.webp',
      },
    ],
  },
];
module.exports = products;
