/* =============================================================
   storage.js
   -------------------------------------------------------------
   This is a TEMPORARY stand-in for the Python + SQLite backend.

   Right now it saves products and transactions in the browser's
   own small storage box (called localStorage) so we can build and
   test every screen before the backend exists.

   In Step 5 of the project we replace the inside of each function
   with a call to the Python server. The function NAMES and what
   they return stay exactly the same, so no screen has to change.

   Think of this file as the "database drawer" of the app.
   ============================================================= */

const Store = {
  /* Keys are just labels for each saved item, like drawer labels. */
  KEY_PRODUCTS: "645_products",
  KEY_TRANSACTIONS: "645_transactions",
  KEY_SETTINGS: "645_settings",

  /* ---------------------------------------------------------
     Small helpers for reading and writing saved data safely.
     Everything is stored as text, so we convert to/from JSON.
     --------------------------------------------------------- */
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn("Could not read saved data for " + key, error);
      return fallback;
    }
  },

  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Could not save data for " + key, error);
      return false;
    }
  },

  /* ---------------------------------------------------------
     SETTINGS
     --------------------------------------------------------- */
  getSettings() {
    return this.read(this.KEY_SETTINGS, { ...SETTINGS });
  },

  saveSettings(settings) {
    return this.save(this.KEY_SETTINGS, settings);
  },

  /* ---------------------------------------------------------
     PRODUCTS
     The first time the app runs, we copy the menu from
     menu-data.js. After that we use the saved copy, so stock
     changes and price edits are remembered.
     --------------------------------------------------------- */
  getProducts() {
    const saved = this.read(this.KEY_PRODUCTS, null);
    if (saved && saved.length > 0) return saved;

    /* First run: start from the real menu. */
    const starting = JSON.parse(JSON.stringify(PRODUCTS));
    this.save(this.KEY_PRODUCTS, starting);
    return starting;
  },

  saveProducts(products) {
    return this.save(this.KEY_PRODUCTS, products);
  },

  getProductById(id) {
    return this.getProducts().find(function (product) {
      return product.id === id;
    });
  },

  /* Replace one product with an edited version. */
  updateProduct(updatedProduct) {
    const products = this.getProducts();
    const index = products.findIndex(function (product) {
      return product.id === updatedProduct.id;
    });
    if (index === -1) return false;
    products[index] = updatedProduct;
    return this.saveProducts(products);
  },

  /* Add a brand new product. Returns the new product. */
  addProduct(newProduct) {
    const products = this.getProducts();
    /* Next id = highest existing id + 1 */
    const highestId = products.reduce(function (highest, product) {
      return Math.max(highest, product.id);
    }, 0);
    newProduct.id = highestId + 1;
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(function (product) {
      return product.id !== id;
    });
    return this.saveProducts(products);
  },

  /* ---------------------------------------------------------
     TRANSACTIONS
     Every completed order is saved here.
     --------------------------------------------------------- */
  getTransactions() {
    return this.read(this.KEY_TRANSACTIONS, []);
  },

  saveTransaction(transaction) {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.save(this.KEY_TRANSACTIONS, transactions);
    return transaction;
  },

  getTransactionByNumber(orderNumber) {
    return this.getTransactions().find(function (transaction) {
      return transaction.orderNumber === orderNumber;
    });
  },

  /* Order numbers look like 645-0001, 645-0002, and so on. */
  getNextOrderNumber() {
    const count = this.getTransactions().length + 1;
    return "645-" + String(count).padStart(4, "0");
  },

  /* ---------------------------------------------------------
     Reduce stock after an order is completed.
     This is the INVENTORY DEDUCTION step. It only runs at
     checkout, never while the staff is still building an order.
     --------------------------------------------------------- */
  deductStock(orderLines) {
    const products = this.getProducts();

    orderLines.forEach(function (line) {
      const product = products.find(function (item) {
        return item.id === line.productId;
      });
      if (product) {
        product.stock = Math.max(0, product.stock - line.quantity);
      }
    });

    return this.saveProducts(products);
  },

  /* Wipe everything and start over (used on the Settings page). */
  resetAll() {
    localStorage.removeItem(this.KEY_PRODUCTS);
    localStorage.removeItem(this.KEY_TRANSACTIONS);
    localStorage.removeItem(this.KEY_SETTINGS);
  },
};
