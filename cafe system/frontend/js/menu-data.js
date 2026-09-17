/* =============================================================
   menu-data.js
   -------------------------------------------------------------
   This file holds the REAL Six-Four-Five Cafe menu, transcribed
   from the printed menu boards.

   IMPORTANT (read this before Step 5 of the project):
   This file is TEMPORARY. It exists so the frontend can be built
   and tested before the Python + SQLite backend is written.
   Later, the backend will send this exact same shape of data to
   the browser, and we simply delete this file. No screen code
   needs to change, because nothing else in the app knows where
   the data came from.
   ============================================================= */

/* Settings the staff can change later on the Settings page. */
const SETTINGS = {
  cafeName: "Six-Four-Five Cafe",
  tagline: "Coffee · Sizzling",
  currency: "\u20B1",          // Philippine peso sign
  lowStockThreshold: 10,       // anything at or below this is "Low stock"
};

/* Categories exactly as they appear on the menu boards. */
const CATEGORIES = [
  { id: "coffee",     name: "Coffee" },
  { id: "special",    name: "Special Drinks" },
  { id: "non-coffee", name: "Non-Coffee" },
  { id: "blended",    name: "Blended" },
  { id: "tea-soda",   name: "Tea & Soda" },
  { id: "food",       name: "Food" },
];

/* -------------------------------------------------------------
   PRODUCTS
   Each product has:
     id        - unique number (this becomes the primary key in SQL)
     name      - product name as printed on the board
     category  - which category id above it belongs to
     group     - optional sub-heading for food (Burger, Sweets, ...)
     note      - the small description printed under some food items
     signature - true for items marked *** on the board
     addonType - which add-on list applies: "drink" or "food"
     stock     - how many are available (PLACEHOLDER: set to 50)
     sizes     - one or more sizes, each with its own price
     choice    - optional required pick-one option (flavored fries)
   ------------------------------------------------------------- */
const PRODUCTS = [
  /* ---------- COFFEE ---------- */
  { id: 1,  name: "Americano",               category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 100 }, { name: "Iced 16oz", price: 105 }, { name: "Iced 20oz", price: 120 } ] },
  { id: 2,  name: "Cafe Mocha",              category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 120 }, { name: "Iced 16oz", price: 135 }, { name: "Iced 20oz", price: 150 } ] },
  { id: 3,  name: "Cafe Latte",              category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 105 }, { name: "Iced 16oz", price: 115 }, { name: "Iced 20oz", price: 130 } ] },
  { id: 4,  name: "Caramel Macchiato",       category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 120 }, { name: "Iced 16oz", price: 140 }, { name: "Iced 20oz", price: 155 } ] },
  { id: 5,  name: "Salted Caramel Macchiato", category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 120 }, { name: "Iced 16oz", price: 140 }, { name: "Iced 20oz", price: 160 } ] },
  { id: 6,  name: "White Chocolate Mocha",   category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 120 }, { name: "Iced 16oz", price: 135 }, { name: "Iced 20oz", price: 150 } ] },
  { id: 7,  name: "Spanish Latte",           category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 115 }, { name: "Iced 16oz", price: 130 }, { name: "Iced 20oz", price: 145 } ] },
  { id: 8,  name: "French Vanilla Latte",    category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 120 }, { name: "Iced 16oz", price: 135 }, { name: "Iced 20oz", price: 150 } ] },
  { id: 9,  name: "Caramel Latte",           category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 120 }, { name: "Iced 16oz", price: 140 }, { name: "Iced 20oz", price: 160 } ] },
  { id: 10, name: "Vanilla Latte",           category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 115 }, { name: "Iced 16oz", price: 130 }, { name: "Iced 20oz", price: 145 } ] },
  { id: 11, name: "Brown Sugar Espresso",    category: "coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 115 }, { name: "Iced 16oz", price: 130 }, { name: "Iced 20oz", price: 145 } ] },

  /* ---------- SPECIAL DRINKS ---------- */
  { id: 12, name: "Six Four Five Latte", category: "special", addonType: "drink", stock: 50, signature: true,
    sizes: [ { name: "Hot 12oz", price: 130 }, { name: "Iced 16oz", price: 145 }, { name: "Iced 20oz", price: 160 } ] },
  { id: 13, name: "Sea Salt Latte",      category: "special", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 130 }, { name: "Iced 16oz", price: 145 }, { name: "Iced 20oz", price: 160 } ] },
  { id: 14, name: "Dirty Matcha",        category: "special", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 140 }, { name: "Iced 16oz", price: 155 }, { name: "Iced 20oz", price: 170 } ] },
  { id: 15, name: "White Americano",     category: "special", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 160 }, { name: "Iced 20oz", price: 175 } ] },

  /* ---------- NON-COFFEE ---------- */
  { id: 16, name: "Matcha Latte",               category: "non-coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 120 }, { name: "Iced 16oz", price: 145 }, { name: "Iced 20oz", price: 160 } ] },
  { id: 17, name: "Vanilla Milk",               category: "non-coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 110 }, { name: "Iced 16oz", price: 120 }, { name: "Iced 20oz", price: 130 } ] },
  { id: 18, name: "Strawberry Milk",            category: "non-coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 120 }, { name: "Iced 20oz", price: 130 } ] },
  { id: 19, name: "Chocolate Milk",             category: "non-coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 110 }, { name: "Iced 16oz", price: 120 }, { name: "Iced 20oz", price: 130 } ] },
  { id: 20, name: "Strawberry White Chocolate", category: "non-coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 135 }, { name: "Iced 20oz", price: 145 } ] },
  { id: 21, name: "White Chocolate Matcha",     category: "non-coffee", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 140 }, { name: "Iced 16oz", price: 155 }, { name: "Iced 20oz", price: 170 } ] },

  /* ---------- BLENDED (iced only: 16oz and 20oz) ---------- */
  { id: 22, name: "Mocha",                 category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 150 }, { name: "Iced 20oz", price: 165 } ] },
  { id: 23, name: "Caramel",               category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 150 }, { name: "Iced 20oz", price: 165 } ] },
  { id: 24, name: "Salted Caramel",        category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 150 }, { name: "Iced 20oz", price: 165 } ] },
  { id: 25, name: "Coffee Jelly",          category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 155 }, { name: "Iced 20oz", price: 165 } ] },
  { id: 26, name: "White Chocolate Mocha", category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 165 }, { name: "Iced 20oz", price: 175 } ] },
  { id: 27, name: "Matcha",                category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 150 }, { name: "Iced 20oz", price: 165 } ] },
  { id: 28, name: "Strawberry",            category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 120 }, { name: "Iced 20oz", price: 135 } ] },
  { id: 29, name: "Java Chip",             category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 165 }, { name: "Iced 20oz", price: 180 } ] },
  { id: 30, name: "Cookies and Cream",     category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 170 }, { name: "Iced 20oz", price: 185 } ] },
  { id: 31, name: "Peppermint Mocha",      category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 185 }, { name: "Iced 20oz", price: 200 } ] },
  { id: 32, name: "Strawberry Matcha",     category: "blended", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 165 }, { name: "Iced 20oz", price: 180 } ] },

  /* ---------- TEA & SODA ---------- */
  { id: 33, name: "Chamomile Tea",        category: "tea-soda", addonType: "drink", stock: 50,
    sizes: [ { name: "Hot 12oz", price: 80 }, { name: "Iced 16oz", price: 90 }, { name: "Iced 20oz", price: 100 } ] },
  { id: 34, name: "House Blend Iced Tea", category: "tea-soda", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 20oz", price: 95 } ] },
  { id: 35, name: "Strawberry Black Tea", category: "tea-soda", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 90 }, { name: "Iced 20oz", price: 100 } ] },
  { id: 36, name: "Lychee Soda",          category: "tea-soda", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 90 }, { name: "Iced 20oz", price: 100 } ] },
  { id: 37, name: "Blueberry Soda",       category: "tea-soda", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 90 }, { name: "Iced 20oz", price: 100 } ] },
  { id: 38, name: "Green Apple Soda",     category: "tea-soda", addonType: "drink", stock: 50,
    sizes: [ { name: "Iced 16oz", price: 90 }, { name: "Iced 20oz", price: 100 } ] },

  /* ---------- FOOD ---------- */
  { id: 39, name: "Cheesy Eggdesal", category: "food", addonType: "food", stock: 50,
    sizes: [ { name: "Regular", price: 50 } ] },

  { id: 40, name: "Classic Burger", category: "food", group: "Burger", addonType: "food", stock: 50,
    note: "Patty and dressing",
    sizes: [ { name: "Regular", price: 50 } ] },
  { id: 41, name: "Cheese Burger", category: "food", group: "Burger", addonType: "food", stock: 50,
    note: "Patty, dressing and cheese",
    sizes: [ { name: "Regular", price: 60 } ] },
  { id: 42, name: "645 Burger", category: "food", group: "Burger", addonType: "food", stock: 50, signature: true,
    note: "Patty, dressing, onion, tomato, cheese and coleslaw",
    sizes: [ { name: "Regular", price: 75 } ] },

  { id: 43, name: "Classic Tuna", category: "food", group: "Tuna Sandwich", addonType: "food", stock: 50,
    note: "Tuna and filling, 2 slices of bread",
    sizes: [ { name: "Regular", price: 75 } ] },
  { id: 44, name: "645 Tuna Sandwich", category: "food", group: "Tuna Sandwich", addonType: "food", stock: 50, signature: true,
    note: "Tuna, filling, cheese, egg and coleslaw, 3 slices of bread",
    sizes: [ { name: "Regular", price: 105 } ] },

  { id: 45, name: "Plain Fries", category: "food", group: "French Fries", addonType: "food", stock: 50,
    sizes: [ { name: "Regular", price: 50 } ] },
  { id: 46, name: "Flavored Fries", category: "food", group: "French Fries", addonType: "food", stock: 50,
    note: "Choose one flavor",
    sizes: [ { name: "Regular", price: 70 } ],
    choice: { label: "Flavor", options: ["Cheese", "BBQ", "Sour Cream", "Sweet Corn"] } },

  { id: 47, name: "Chocolate Chip Cookie", category: "food", group: "Sweets", addonType: "food", stock: 50, signature: true,
    sizes: [ { name: "Regular", price: 35 } ] },
  { id: 48, name: "Smore's Cookie", category: "food", group: "Sweets", addonType: "food", stock: 50,
    sizes: [ { name: "Regular", price: 50 } ] },
  { id: 49, name: "Chocolate Crinkles", category: "food", group: "Sweets", addonType: "food", stock: 50,
    sizes: [ { name: "Regular", price: 15 } ] },
];

/* -------------------------------------------------------------
   ADD-ONS
   appliesTo tells us which products can use this add-on.
   Drink add-ons only show on drinks, food add-ons only on food.
   ------------------------------------------------------------- */
const ADDONS = [
  /* Drink add-ons (from the Tea/Soda board) */
  { id: 101, name: "Shot",            price: 35, appliesTo: "drink" },
  { id: 102, name: "Milk",            price: 15, appliesTo: "drink" },
  { id: 103, name: "Sugar Syrup",     price: 15, appliesTo: "drink" },
  { id: 104, name: "Oat Milk",        price: 50, appliesTo: "drink" },
  { id: 105, name: "Syrup",           price: 20, appliesTo: "drink" },
  { id: 106, name: "Strawberry",      price: 15, appliesTo: "drink" },
  { id: 107, name: "White Chocolate", price: 30, appliesTo: "drink" },
  { id: 108, name: "Whip Cream",      price: 20, appliesTo: "drink" },
  { id: 109, name: "Coffee Jelly",    price: 20, appliesTo: "drink" },
  { id: 110, name: "Crushed Oreo",    price: 20, appliesTo: "drink" },
  { id: 111, name: "Chocolate Chips", price: 20, appliesTo: "drink" },

  /* Food add-ons (from the Food board) */
  { id: 201, name: "Cheese",   price: 10, appliesTo: "food" },
  { id: 202, name: "Egg",      price: 20, appliesTo: "food" },
  { id: 203, name: "Coleslaw", price: 20, appliesTo: "food" },
];
