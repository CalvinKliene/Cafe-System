-- =============================================================
-- schema.sql
-- -------------------------------------------------------------
-- This file creates every table the cafe system needs.
-- Run it once (seed_database.py does this for you) to build
-- cafe.db from scratch.
--
-- Quick vocabulary for the project defense:
--   TABLE          a labeled spreadsheet, e.g. "products"
--   ROW            one record inside a table, e.g. one product
--   COLUMN         one piece of info every row has, e.g. "price"
--   PRIMARY KEY    a column that uniquely identifies each row
--   FOREIGN KEY    a column that points to another table's
--                  primary key, linking the two tables together
-- =============================================================

-- Turning this on makes SQLite actually enforce foreign keys.
-- Without it, SQLite will silently allow broken links between
-- tables, which defeats the purpose of using them.
PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------
-- CATEGORIES
-- The 6 sections of the menu: Coffee, Special Drinks,
-- Non-Coffee, Blended, Tea & Soda, Food.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    slug    TEXT NOT NULL UNIQUE,   -- short code, e.g. "coffee"
    name    TEXT NOT NULL           -- display name, e.g. "Coffee"
);

-- -------------------------------------------------------------
-- PRODUCTS
-- One row per menu item (Cafe Latte, Classic Burger, etc).
-- The price is NOT stored here, because most drinks come in
-- several sizes at different prices - see product_sizes below.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id     INTEGER NOT NULL,
    name            TEXT NOT NULL,
    product_group   TEXT,               -- e.g. "Burger" (optional)
    note            TEXT,               -- e.g. "Patty and dressing"
    addon_type      TEXT NOT NULL CHECK (addon_type IN ('drink', 'food')),
    is_signature    INTEGER NOT NULL DEFAULT 0 CHECK (is_signature IN (0, 1)),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),

    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- -------------------------------------------------------------
-- PRODUCT_SIZES
-- Each size a product comes in, with its own price.
-- A product with only one size (like a burger) still gets one
-- row here, e.g. "Regular".
-- This is a one-to-many relationship: one product can have
-- MANY sizes, but each size row belongs to exactly ONE product.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_sizes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  INTEGER NOT NULL,
    size_name   TEXT NOT NULL,      -- e.g. "Iced 20oz" or "Regular"
    price       REAL NOT NULL CHECK (price > 0),

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- PRODUCT_CHOICES
-- Only used by products like Flavored Fries, where the staff
-- must pick one option (Cheese / BBQ / Sour Cream / Sweet Corn)
-- with no extra charge. Most products have zero rows here.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_choices (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id      INTEGER NOT NULL,
    choice_label    TEXT NOT NULL,      -- e.g. "Flavor"
    choice_value    TEXT NOT NULL,      -- e.g. "BBQ"

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- ADDONS
-- Extras like Shot, Milk, Cheese, Egg. applies_to controls
-- whether an addon is offered on drinks or on food.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addons (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    price       REAL NOT NULL CHECK (price > 0),
    applies_to  TEXT NOT NULL CHECK (applies_to IN ('drink', 'food'))
);

-- -------------------------------------------------------------
-- SETTINGS
-- A single row of cafe-wide settings (cafe name, low stock
-- threshold). Only one row ever exists, with id = 1.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    id                  INTEGER PRIMARY KEY CHECK (id = 1),
    cafe_name           TEXT NOT NULL,
    tagline             TEXT,
    currency            TEXT NOT NULL DEFAULT '\u20B1',
    low_stock_threshold INTEGER NOT NULL DEFAULT 10
);

-- -------------------------------------------------------------
-- TRANSACTIONS
-- One row per completed order (one digital receipt).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number        TEXT NOT NULL UNIQUE,   -- e.g. "645-0001"
    date_time           TEXT NOT NULL,          -- ISO format timestamp
    items_subtotal      REAL NOT NULL,
    addons_subtotal     REAL NOT NULL,
    total                REAL NOT NULL,
    cash_received       REAL NOT NULL,
    change_due          REAL NOT NULL
);

-- -------------------------------------------------------------
-- TRANSACTION_ITEMS
-- One row per product line inside one order.
-- IMPORTANT: product_name, size_name and unit_price are COPIED
-- here at the moment of sale, instead of only linking to
-- products/product_sizes. This means an old receipt still shows
-- the correct price even if that product's price changes later.
-- product_id is kept too, so we still know which product it was
-- if it still exists.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaction_items (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id      INTEGER NOT NULL,
    product_id          INTEGER,                -- may become NULL if the product is later deleted
    product_name        TEXT NOT NULL,
    size_name            TEXT NOT NULL,
    unit_price          REAL NOT NULL,
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    choice_value        TEXT,                   -- e.g. "BBQ", or NULL if not applicable

    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- TRANSACTION_ITEM_ADDONS
-- One row per add-on chosen on one order line.
-- Also copies the name and price at sale time, for the same
-- receipt-accuracy reason as transaction_items.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaction_item_addons (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_item_id    INTEGER NOT NULL,
    addon_name              TEXT NOT NULL,
    addon_price              REAL NOT NULL,
    quantity                INTEGER NOT NULL CHECK (quantity > 0),

    FOREIGN KEY (transaction_item_id) REFERENCES transaction_items(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Helpful indexes - these make common lookups faster as the
-- transactions table grows. Not required for a small class
-- project, but good practice and easy to explain: an index is
-- like a book's index, letting the database jump straight to
-- matching rows instead of checking every row one by one.
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_sizes_product ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_txn_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(date_time);
