/* =============================================================
   inventory.js
   -------------------------------------------------------------
   Stock levels for every product.

   Stock status uses the low-stock threshold from Settings,
   so the number is set in one place instead of being written
   into the code over and over.
   ============================================================= */

const Inventory = {
  searchText: "",
  statusFilter: "all",

  init() {
    const self = this;

    document.getElementById("invSearch").addEventListener("input", function (event) {
      self.searchText = event.target.value.trim().toLowerCase();
      self.render();
    });

    document.getElementById("invStatusFilter").addEventListener("change", function (event) {
      self.statusFilter = event.target.value;
      self.render();
    });
  },

  render() {
    const self = this;
    const allProducts = Store.getProducts();
    const settings = Store.getSettings();

    /* ---- Three summary cards at the top ---- */
    const inStock = allProducts.filter(function (p) { return App.stockStatus(p) === "in"; });
    const lowStock = allProducts.filter(function (p) { return App.stockStatus(p) === "low"; });
    const outOfStock = allProducts.filter(function (p) { return App.stockStatus(p) === "out"; });

    document.getElementById("invStats").innerHTML =
      Dashboard.statCard("In stock", String(inStock.length),
        "Above " + settings.lowStockThreshold + " units") +
      Dashboard.statCard("Low stock", String(lowStock.length),
        lowStock.length === 0 ? "No low-stock products" : "At or below " + settings.lowStockThreshold,
        lowStock.length > 0) +
      Dashboard.statCard("Out of stock", String(outOfStock.length),
        outOfStock.length === 0 ? "Everything available" : "Cannot be ordered",
        outOfStock.length > 0);

    /* ---- Apply the search box and status dropdown ---- */
    let products = allProducts;

    if (this.statusFilter !== "all") {
      products = products.filter(function (product) {
        return App.stockStatus(product) === self.statusFilter;
      });
    }

    if (this.searchText) {
      products = products.filter(function (product) {
        return product.name.toLowerCase().includes(self.searchText);
      });
    }

    const table = document.getElementById("invTable");
    const emptyBox = document.getElementById("invEmpty");

    if (products.length === 0) {
      table.innerHTML = "";
      emptyBox.innerHTML = this.statusFilter === "low"
        ? App.emptyState("No low-stock products", "Everything is well stocked.")
        : App.emptyState("No products found", "Try a different search or filter.");
      return;
    }

    emptyBox.innerHTML = "";

    table.innerHTML =
      "<thead><tr><th>Product</th><th>Category</th><th>Status</th>" +
      '<th class="num">Stock</th><th class="num">Update</th></tr></thead><tbody>' +
      products.map(function (product) {
        return '<tr data-id="' + product.id + '">' +
          "<td><strong>" + App.escape(product.name) + "</strong></td>" +
          "<td>" + App.escape(product.group || App.categoryName(product.category)) + "</td>" +
          "<td>" + App.stockBadge(product) + "</td>" +
          '<td class="num">' + product.stock + "</td>" +
          '<td class="num" style="white-space:nowrap">' +
            '<input type="number" class="input" min="0" step="1" value="' + product.stock +
              '" data-stock="' + product.id + '" style="width:84px;display:inline-block">' +
            ' <button class="btn btn-sm" data-save="' + product.id + '">Save</button>' +
          "</td>" +
        "</tr>";
      }).join("") +
      "</tbody>";

    table.querySelectorAll("[data-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        self.updateStock(Number(button.dataset.save));
      });
    });
  },

  /* Read the typed number, check it, then save it. */
  updateStock(productId) {
    const input = document.querySelector('[data-stock="' + productId + '"]');
    const newStock = Number(input.value);

    if (!Number.isInteger(newStock) || newStock < 0) {
      App.toast("Stock must be a whole number of 0 or more", "error");
      return;
    }

    const product = Store.getProductById(productId);
    product.stock = newStock;
    Store.updateProduct(product);

    this.render();
    App.toast(product.name + " stock set to " + newStock, "good");
  },
};
