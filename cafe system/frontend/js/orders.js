/* =============================================================
   orders.js
   -------------------------------------------------------------
   The ordering screen. This is the heart of the system.

   The flow is:
     1. Staff picks a product        -> a window opens
     2. Staff picks size, quantity and add-ons
     3. The item is added to the order ticket on the right
     4. Totals are computed automatically
     5. Staff enters cash, change is computed automatically
     6. "Complete order" saves the transaction, reduces stock
        and shows the digital receipt

   IMPORTANT: no price is ever typed into this file. Every price
   is read from the product data.
   ============================================================= */

const Orders = {
  /* The order being built right now. Each entry is one line
     on the receipt. */
  currentOrder: [],

  /* Which category filter and search text are active. */
  activeCategory: "all",
  searchText: "",

  /* Counter so each line on the ticket has its own id. */
  nextLineId: 1,

  /* ---------------------------------------------------------
     SETUP — runs once when the app starts
     --------------------------------------------------------- */
  init() {
    const self = this;

    /* Category filter chips */
    const filterBox = document.getElementById("categoryFilters");
    let chipsHtml = '<button class="chip is-on" data-category="all">All</button>';
    CATEGORIES.forEach(function (category) {
      chipsHtml += '<button class="chip" data-category="' + category.id + '">' +
                   App.escape(category.name) + "</button>";
    });
    filterBox.innerHTML = chipsHtml;

    filterBox.addEventListener("click", function (event) {
      const chip = event.target.closest(".chip");
      if (!chip) return;
      self.activeCategory = chip.dataset.category;
      filterBox.querySelectorAll(".chip").forEach(function (item) {
        item.classList.toggle("is-on", item === chip);
      });
      self.renderProducts();
    });

    /* Search box */
    document.getElementById("productSearch").addEventListener("input", function (event) {
      self.searchText = event.target.value.trim().toLowerCase();
      self.renderProducts();
    });

    /* Cash box — recompute change on every keystroke */
    document.getElementById("cashInput").addEventListener("input", function () {
      self.renderTotals();
    });

    /* Quick cash buttons */
    document.getElementById("quickCash").addEventListener("click", function (event) {
      const chip = event.target.closest(".chip");
      if (!chip) return;
      document.getElementById("cashInput").value = chip.dataset.amount;
      self.renderTotals();
    });

    document.getElementById("checkoutBtn").addEventListener("click", function () {
      self.completeOrder();
    });

    document.getElementById("clearOrderBtn").addEventListener("click", function () {
      if (self.currentOrder.length === 0) return;
      self.currentOrder = [];
      self.render();
      App.toast("Order cleared");
    });
  },

  /* Redraw the whole screen. */
  render() {
    this.renderProducts();
    this.renderTicket();
    this.renderQuickCash();
    this.renderTotals();
  },

  /* ---------------------------------------------------------
     PRODUCT GRID
     --------------------------------------------------------- */
  renderProducts() {
    const grid = document.getElementById("productGrid");
    const self = this;

    /* Start with every product, then narrow it down. */
    let products = Store.getProducts();

    if (this.activeCategory !== "all") {
      products = products.filter(function (product) {
        return product.category === self.activeCategory;
      });
    }

    if (this.searchText) {
      products = products.filter(function (product) {
        const haystack = (product.name + " " + (product.group || "") + " " +
                          App.categoryName(product.category)).toLowerCase();
        return haystack.includes(self.searchText);
      });
    }

    if (products.length === 0) {
      grid.innerHTML = "";
      grid.insertAdjacentHTML("beforeend",
        App.emptyState("No products found", "Try a different search or category."));
      return;
    }

    grid.innerHTML = products.map(function (product) {
      /* Show the cheapest size as the "from" price. */
      const lowestPrice = Math.min.apply(null, product.sizes.map(function (size) {
        return size.price;
      }));
      const hasManySizes = product.sizes.length > 1;
      const status = App.stockStatus(product);

      let stockText = product.stock + " in stock";
      if (status === "low") stockText = "Only " + product.stock + " left";
      if (status === "out") stockText = "Out of stock";

      return '<button class="product-card" data-id="' + product.id + '"' +
             (status === "out" ? " disabled" : "") + ">" +
        (product.signature ? '<span class="sig-dot" title="Signature item"></span>' : "") +
        '<span class="product-cat">' + App.escape(product.group || App.categoryName(product.category)) + "</span>" +
        '<span class="product-name">' + App.escape(product.name) + "</span>" +
        (product.note ? '<span class="product-note">' + App.escape(product.note) + "</span>" : "") +
        '<span class="product-foot">' +
          '<span class="product-price">' +
            (hasManySizes ? "<small>from </small>" : "") + App.money(lowestPrice) +
          "</span>" +
          '<span class="product-stock is-' + status + '">' + stockText + "</span>" +
        "</span>" +
      "</button>";
    }).join("");

    /* Clicking a card opens the item window. */
    grid.querySelectorAll(".product-card").forEach(function (card) {
      card.addEventListener("click", function () {
        self.openItemModal(Number(card.dataset.id));
      });
    });
  },

  /* ---------------------------------------------------------
     ITEM WINDOW — pick size, quantity and add-ons
     --------------------------------------------------------- */
  openItemModal(productId) {
    const product = Store.getProductById(productId);
    if (!product) return;

    const self = this;

    /* Which add-ons apply to this product? */
    const addons = ADDONS.filter(function (addon) {
      return addon.appliesTo === product.addonType;
    });

    /* Build the size buttons. The first size starts selected. */
    let sizesHtml = "";
    product.sizes.forEach(function (size, index) {
      sizesHtml += '<button type="button" class="size-option' + (index === 0 ? " is-on" : "") +
        '" data-index="' + index + '">' +
        '<span class="size-option-name">' + App.escape(size.name) + "</span>" +
        '<span class="size-option-price">' + App.money(size.price) + "</span>" +
      "</button>";
    });

    /* Build the pick-one choice (only Flavored Fries has this). */
    let choiceHtml = "";
    if (product.choice) {
      choiceHtml = '<div class="field"><label>' + App.escape(product.choice.label) + "</label>" +
        '<div class="chip-row" id="choiceRow">' +
        product.choice.options.map(function (option, index) {
          return '<button type="button" class="chip' + (index === 0 ? " is-on" : "") +
                 '" data-value="' + App.escape(option) + '">' + App.escape(option) + "</button>";
        }).join("") +
        "</div></div>";
    }

    /* Build the add-on rows. */
    let addonsHtml = "";
    if (addons.length > 0) {
      addonsHtml = '<div class="field"><label>Add-ons (optional)</label><div id="addonList">' +
        addons.map(function (addon) {
          return '<div class="addon-row">' +
            '<input type="checkbox" id="addon-' + addon.id + '" data-id="' + addon.id + '">' +
            '<label for="addon-' + addon.id + '">' + App.escape(addon.name) + "</label>" +
            '<span class="addon-price">' + App.money(addon.price) + "</span>" +
            '<input type="number" min="1" value="1" data-qty-for="' + addon.id + '" disabled>' +
          "</div>";
        }).join("") +
        "</div></div>";
    }

    App.openModal(
      '<div class="modal-head">' +
        '<h2 class="modal-title">' + App.escape(product.name) + "</h2>" +
        '<div class="modal-sub">' + App.escape(App.categoryName(product.category)) +
          (product.note ? " · " + App.escape(product.note) : "") +
          " · " + product.stock + " in stock</div>" +
      "</div>" +
      '<div class="modal-body">' +
        '<div class="field"><label>Size</label>' + sizesHtml + "</div>" +
        choiceHtml +
        '<div class="field"><label for="itemQty">Quantity</label>' +
          '<div class="stepper">' +
            '<button type="button" id="qtyMinus">\u2212</button>' +
            '<input type="number" id="itemQty" value="1" min="1">' +
            '<button type="button" id="qtyPlus">+</button>' +
          "</div>" +
        "</div>" +
        addonsHtml +
        '<div class="validation" id="itemValidation"></div>' +
        '<div class="total-row is-grand"><span>Line total</span>' +
          '<span class="money" id="itemLineTotal">' + App.money(product.sizes[0].price) + "</span></div>" +
      "</div>" +
      '<div class="modal-foot">' +
        '<button class="btn" id="cancelItem">Cancel</button>' +
        '<button class="btn btn-brass" id="confirmItem">Add to order</button>' +
      "</div>",
      false
    );

    /* ---- Wire up the window ---- */
    let selectedSizeIndex = 0;

    const box = document.getElementById("modalBox");

    /* Size buttons */
    box.querySelectorAll(".size-option").forEach(function (button) {
      button.addEventListener("click", function () {
        selectedSizeIndex = Number(button.dataset.index);
        box.querySelectorAll(".size-option").forEach(function (other) {
          other.classList.toggle("is-on", other === button);
        });
        updateLineTotal();
      });
    });

    /* Flavor choice */
    const choiceRow = document.getElementById("choiceRow");
    if (choiceRow) {
      choiceRow.addEventListener("click", function (event) {
        const chip = event.target.closest(".chip");
        if (!chip) return;
        choiceRow.querySelectorAll(".chip").forEach(function (other) {
          other.classList.toggle("is-on", other === chip);
        });
      });
    }

    /* Quantity stepper */
    const qtyInput = document.getElementById("itemQty");
    document.getElementById("qtyMinus").addEventListener("click", function () {
      qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
      updateLineTotal();
    });
    document.getElementById("qtyPlus").addEventListener("click", function () {
      qtyInput.value = Number(qtyInput.value) + 1;
      updateLineTotal();
    });
    qtyInput.addEventListener("input", updateLineTotal);

    /* Add-on checkboxes turn their quantity box on and off. */
    const addonList = document.getElementById("addonList");
    if (addonList) {
      addonList.addEventListener("change", function (event) {
        if (event.target.type === "checkbox") {
          const qtyBox = addonList.querySelector('[data-qty-for="' + event.target.dataset.id + '"]');
          qtyBox.disabled = !event.target.checked;
          if (!event.target.checked) qtyBox.value = 1;
        }
        updateLineTotal();
      });
      addonList.addEventListener("input", updateLineTotal);
    }

    document.getElementById("cancelItem").addEventListener("click", function () {
      App.closeModal();
    });

    document.getElementById("confirmItem").addEventListener("click", function () {
      addItemToOrder();
    });

    /* ---- Reading the window's current values ---- */
    function readSelectedAddons() {
      if (!addonList) return [];
      const chosen = [];
      addonList.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
        if (!checkbox.checked) return;
        const addonId = Number(checkbox.dataset.id);
        const addon = ADDONS.find(function (item) { return item.id === addonId; });
        const qtyBox = addonList.querySelector('[data-qty-for="' + addonId + '"]');
        const addonQuantity = Math.max(1, Number(qtyBox.value) || 1);
        chosen.push({
          addonId: addon.id,
          name: addon.name,
          price: addon.price,
          quantity: addonQuantity,
        });
      });
      return chosen;
    }

    /* Line total = item price x quantity + each add-on price x its own quantity */
    function computeLineTotal() {
      const quantity = Math.max(1, Number(qtyInput.value) || 1);
      const itemTotal = product.sizes[selectedSizeIndex].price * quantity;
      const addonTotal = readSelectedAddons().reduce(function (sum, addon) {
        return sum + addon.price * addon.quantity;
      }, 0);
      return itemTotal + addonTotal;
    }

    function updateLineTotal() {
      document.getElementById("itemLineTotal").textContent = App.money(computeLineTotal());
    }

    /* ---- Validation, then add to the order ---- */
    function addItemToOrder() {
      const validation = document.getElementById("itemValidation");
      const quantity = Number(qtyInput.value);

      /* Rule 1: quantity must be a whole number of at least 1. */
      if (!Number.isInteger(quantity) || quantity < 1) {
        validation.textContent = "Quantity must be at least 1.";
        return;
      }

      /* Rule 2: we cannot order more than we have in stock,
         counting what is already on the ticket. */
      const alreadyOnTicket = self.currentOrder
        .filter(function (line) { return line.productId === product.id; })
        .reduce(function (sum, line) { return sum + line.quantity; }, 0);

      if (alreadyOnTicket + quantity > product.stock) {
        validation.textContent = "Only " + (product.stock - alreadyOnTicket) +
          " left in stock for this product.";
        return;
      }

      /* Build the line and put it on the ticket. */
      const size = product.sizes[selectedSizeIndex];
      const selectedChoice = choiceRow
        ? choiceRow.querySelector(".chip.is-on").dataset.value
        : null;

      self.currentOrder.push({
        lineId: self.nextLineId++,
        productId: product.id,
        name: product.name,
        category: App.categoryName(product.category),
        sizeName: size.name,
        unitPrice: size.price,
        quantity: quantity,
        choice: selectedChoice,
        addons: readSelectedAddons(),
      });

      App.closeModal();
      self.render();
      App.toast(product.name + " added to the order", "good");
    }
  },

  /* ---------------------------------------------------------
     THE ORDER TICKET
     --------------------------------------------------------- */
  renderTicket() {
    const container = document.getElementById("ticketLines");
    const subtitle = document.getElementById("ticketSub");
    const self = this;

    if (this.currentOrder.length === 0) {
      container.innerHTML = App.emptyState("Current order is empty",
        "Pick a product on the left to start.");
      subtitle.textContent = "No items yet";
      return;
    }

    const itemCount = this.currentOrder.reduce(function (sum, line) {
      return sum + line.quantity;
    }, 0);
    subtitle.textContent = itemCount + (itemCount === 1 ? " item" : " items");

    container.innerHTML = this.currentOrder.map(function (line) {
      return '<div class="line-item" data-line="' + line.lineId + '">' +
        '<div class="line-top">' +
          "<div>" +
            '<div class="line-name">' + App.escape(line.name) + "</div>" +
            '<div class="line-size">' + App.escape(line.sizeName) +
              (line.choice ? " · " + App.escape(line.choice) : "") +
              " · " + App.money(line.unitPrice) + " each</div>" +
          "</div>" +
          '<div class="line-total">' + App.money(line.unitPrice * line.quantity) + "</div>" +
        "</div>" +
        (line.addons.length > 0
          ? '<ul class="line-addons">' + line.addons.map(function (addon) {
              return "<li><span>+ " + App.escape(addon.name) +
                     (addon.quantity > 1 ? " \u00D7" + addon.quantity : "") + "</span>" +
                     "<span>" + App.money(addon.price * addon.quantity) + "</span></li>";
            }).join("") + "</ul>"
          : "") +
        '<div class="line-controls">' +
          '<div class="stepper">' +
            '<button type="button" data-act="minus">\u2212</button>' +
            '<input type="number" min="1" value="' + line.quantity + '" data-act="qty">' +
            '<button type="button" data-act="plus">+</button>' +
          "</div>" +
          '<button class="line-remove" data-act="remove">Remove</button>' +
        "</div>" +
      "</div>";
    }).join("");

    /* Handle the + / - / remove buttons on each line. */
    container.querySelectorAll(".line-item").forEach(function (element) {
      const lineId = Number(element.dataset.line);

      element.querySelector('[data-act="minus"]').addEventListener("click", function () {
        self.changeQuantity(lineId, -1);
      });
      element.querySelector('[data-act="plus"]').addEventListener("click", function () {
        self.changeQuantity(lineId, 1);
      });
      element.querySelector('[data-act="remove"]').addEventListener("click", function () {
        self.removeLine(lineId);
      });
      element.querySelector('[data-act="qty"]').addEventListener("change", function (event) {
        self.setQuantity(lineId, Number(event.target.value));
      });
    });
  },

  findLine(lineId) {
    return this.currentOrder.find(function (line) { return line.lineId === lineId; });
  },

  changeQuantity(lineId, step) {
    const line = this.findLine(lineId);
    if (!line) return;
    this.setQuantity(lineId, line.quantity + step);
  },

  setQuantity(lineId, newQuantity) {
    const line = this.findLine(lineId);
    if (!line) return;

    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      App.toast("Quantity must be at least 1", "error");
      this.render();
      return;
    }

    /* Check stock across every line using this product. */
    const product = Store.getProductById(line.productId);
    const otherLines = this.currentOrder
      .filter(function (other) {
        return other.productId === line.productId && other.lineId !== lineId;
      })
      .reduce(function (sum, other) { return sum + other.quantity; }, 0);

    if (otherLines + newQuantity > product.stock) {
      App.toast("Only " + product.stock + " " + product.name + " in stock", "error");
      this.render();
      return;
    }

    line.quantity = newQuantity;
    this.render();
  },

  removeLine(lineId) {
    this.currentOrder = this.currentOrder.filter(function (line) {
      return line.lineId !== lineId;
    });
    this.render();
  },

  /* ---------------------------------------------------------
     AUTOMATIC COMPUTATION
     This is the "computation" part the professor asked for.
     --------------------------------------------------------- */
  computeTotals() {
    let itemsSubtotal = 0;
    let addonsSubtotal = 0;

    this.currentOrder.forEach(function (line) {
      itemsSubtotal += line.unitPrice * line.quantity;
      line.addons.forEach(function (addon) {
        addonsSubtotal += addon.price * addon.quantity;
      });
    });

    const total = itemsSubtotal + addonsSubtotal;
    const cashReceived = Number(document.getElementById("cashInput").value) || 0;
    const change = cashReceived - total;

    return {
      itemsSubtotal: itemsSubtotal,
      addonsSubtotal: addonsSubtotal,
      total: total,
      cashReceived: cashReceived,
      change: change,
    };
  },

  renderTotals() {
    const totals = this.computeTotals();
    const box = document.getElementById("ticketTotals");

    box.innerHTML =
      '<div class="total-row"><span>Items</span><span class="money">' +
        App.money(totals.itemsSubtotal) + "</span></div>" +
      '<div class="total-row"><span>Add-ons</span><span class="money">' +
        App.money(totals.addonsSubtotal) + "</span></div>" +
      '<div class="total-row is-grand"><span>Total</span><span class="money">' +
        App.money(totals.total) + "</span></div>" +
      (totals.cashReceived > 0
        ? '<div class="total-row"><span>Cash received</span><span class="money">' +
            App.money(totals.cashReceived) + "</span></div>" +
          '<div class="total-row is-change"><span>Change</span><span class="money">' +
            App.money(Math.max(0, totals.change)) + "</span></div>"
        : "");

    /* Live validation message under the cash box. */
    const validation = document.getElementById("orderValidation");
    if (this.currentOrder.length === 0) {
      validation.textContent = "";
    } else if (totals.cashReceived === 0) {
      validation.textContent = "";
    } else if (totals.cashReceived < totals.total) {
      validation.textContent = "Cash received is " +
        App.money(totals.total - totals.cashReceived) + " short of the total.";
    } else {
      validation.textContent = "";
    }
  },

  /* Suggest handy cash amounts based on the total. */
  renderQuickCash() {
    const totals = this.computeTotals();
    const box = document.getElementById("quickCash");

    if (totals.total <= 0) { box.innerHTML = ""; return; }

    /* Exact amount, then the next round 50, 100, 500 and 1000. */
    const suggestions = [totals.total];
    [50, 100, 500, 1000].forEach(function (step) {
      const rounded = Math.ceil(totals.total / step) * step;
      if (!suggestions.includes(rounded)) suggestions.push(rounded);
    });

    box.innerHTML = suggestions.slice(0, 4).map(function (amount, index) {
      return '<button type="button" class="chip" data-amount="' + amount + '">' +
        (index === 0 ? "Exact" : App.money(amount)) + "</button>";
    }).join("");
  },

  /* ---------------------------------------------------------
     CHECKOUT
     --------------------------------------------------------- */
  completeOrder() {
    const validation = document.getElementById("orderValidation");
    const totals = this.computeTotals();

    /* Rule 1: the order cannot be empty. */
    if (this.currentOrder.length === 0) {
      validation.textContent = "Add at least one item before completing the order.";
      return;
    }

    /* Rule 2: cash must cover the total. */
    if (totals.cashReceived < totals.total) {
      validation.textContent = "Cash received must be at least " + App.money(totals.total) + ".";
      document.getElementById("cashInput").focus();
      return;
    }

    /* Rule 3: re-check stock one last time before saving. */
    const products = Store.getProducts();
    const neededPerProduct = {};
    this.currentOrder.forEach(function (line) {
      neededPerProduct[line.productId] = (neededPerProduct[line.productId] || 0) + line.quantity;
    });

    for (const productId in neededPerProduct) {
      const product = products.find(function (item) { return item.id === Number(productId); });
      if (!product || neededPerProduct[productId] > product.stock) {
        validation.textContent = "Not enough stock for " +
          (product ? product.name : "one of the items") + ".";
        return;
      }
    }

    /* Everything checks out — build the transaction record. */
    const transaction = {
      orderNumber: Store.getNextOrderNumber(),
      dateTime: new Date().toISOString(),
      lines: JSON.parse(JSON.stringify(this.currentOrder)),
      itemsSubtotal: totals.itemsSubtotal,
      addonsSubtotal: totals.addonsSubtotal,
      total: totals.total,
      cashReceived: totals.cashReceived,
      change: totals.change,
    };

    /* Save it, then reduce stock. Stock only moves here, at the
       moment the order is actually completed. */
    Store.saveTransaction(transaction);
    Store.deductStock(this.currentOrder);

    /* Start a fresh order. */
    this.currentOrder = [];
    document.getElementById("cashInput").value = "";
    this.render();

    this.showReceipt(transaction);
  },

  /* ---------------------------------------------------------
     DIGITAL RECEIPT
     --------------------------------------------------------- */
  showReceipt(transaction) {
    App.openModal(
      '<div class="modal-head">' +
        '<h2 class="modal-title">Order complete</h2>' +
        '<div class="modal-sub">Change due: ' + App.money(transaction.change) + "</div>" +
      "</div>" +
      '<div id="receiptPrintArea">' + Orders.buildReceiptHtml(transaction) + "</div>" +
      '<div class="modal-foot">' +
        '<button class="btn" id="printReceipt">Print receipt</button>' +
        '<button class="btn btn-brass" id="newOrder">New order</button>' +
      "</div>",
      false
    );

    document.getElementById("printReceipt").addEventListener("click", function () {
      window.print();
    });
    document.getElementById("newOrder").addEventListener("click", function () {
      App.closeModal();
    });
  },

  /* Builds the receipt markup. Also used by the Transactions
     page when re-opening an old receipt. */
  buildReceiptHtml(transaction) {
    const settings = Store.getSettings();

    const linesHtml = transaction.lines.map(function (line) {
      let html = '<div class="receipt-line">' +
        '<span class="r-name">' + line.quantity + " \u00D7 " + App.escape(line.name) + "</span>" +
        '<span class="r-amt">' + App.money(line.unitPrice * line.quantity) + "</span>" +
      "</div>" +
      '<div class="receipt-sub">' + App.escape(line.sizeName) +
        (line.choice ? " · " + App.escape(line.choice) : "") +
        " @ " + App.money(line.unitPrice) + "</div>";

      line.addons.forEach(function (addon) {
        html += '<div class="receipt-line receipt-sub">' +
          '<span class="r-name">+ ' + App.escape(addon.name) + " \u00D7" + addon.quantity + "</span>" +
          '<span class="r-amt">' + App.money(addon.price * addon.quantity) + "</span>" +
        "</div>";
      });

      return html;
    }).join('<div style="height:7px"></div>');

    return '<div class="receipt">' +
      '<div class="receipt-head">' +
        '<div class="receipt-name">' + App.escape(settings.cafeName) + "</div>" +
        '<div class="receipt-tag">' + App.escape(settings.tagline || "") + "</div>" +
      "</div>" +
      '<div class="receipt-rule"></div>' +
      '<div class="receipt-meta"><span>Order</span><span>' +
        App.escape(transaction.orderNumber) + "</span></div>" +
      '<div class="receipt-meta"><span>Date</span><span>' +
        App.formatDateTime(transaction.dateTime) + "</span></div>" +
      '<div class="receipt-rule"></div>' +
      linesHtml +
      '<div class="receipt-rule"></div>' +
      '<div class="receipt-line"><span class="r-name">Items subtotal</span>' +
        '<span class="r-amt">' + App.money(transaction.itemsSubtotal) + "</span></div>" +
      '<div class="receipt-line"><span class="r-name">Add-ons subtotal</span>' +
        '<span class="r-amt">' + App.money(transaction.addonsSubtotal) + "</span></div>" +
      '<div class="receipt-line receipt-grand"><span class="r-name">TOTAL</span>' +
        '<span class="r-amt">' + App.money(transaction.total) + "</span></div>" +
      '<div class="receipt-rule"></div>' +
      '<div class="receipt-line"><span class="r-name">Cash received</span>' +
        '<span class="r-amt">' + App.money(transaction.cashReceived) + "</span></div>" +
      '<div class="receipt-line"><span class="r-name">Change</span>' +
        '<span class="r-amt">' + App.money(transaction.change) + "</span></div>" +
      '<div class="receipt-rule"></div>' +
      '<div class="receipt-foot">Thank you and see you again</div>' +
    "</div>";
  },
};
