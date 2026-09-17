/* =============================================================
   menu-page.js
   -------------------------------------------------------------
   Product and price management.
   This screen covers the CRUD operations:
     CREATE - Add product
     READ   - the table below
     UPDATE - Edit product
     DELETE - Remove product
   ============================================================= */

const MenuPage = {
  searchText: "",
  categoryFilter: "all",

  init() {
    const self = this;

    /* Fill the category dropdown. */
    const select = document.getElementById("menuCategoryFilter");
    select.innerHTML = '<option value="all">All categories</option>' +
      CATEGORIES.map(function (category) {
        return '<option value="' + category.id + '">' + App.escape(category.name) + "</option>";
      }).join("");

    select.addEventListener("change", function (event) {
      self.categoryFilter = event.target.value;
      self.render();
    });

    document.getElementById("menuSearch").addEventListener("input", function (event) {
      self.searchText = event.target.value.trim().toLowerCase();
      self.render();
    });

    document.getElementById("addProductBtn").addEventListener("click", function () {
      self.openProductForm(null);
    });
  },

  /* Apply the search box and category dropdown. */
  filteredProducts() {
    const self = this;
    let products = Store.getProducts();

    if (this.categoryFilter !== "all") {
      products = products.filter(function (product) {
        return product.category === self.categoryFilter;
      });
    }

    if (this.searchText) {
      products = products.filter(function (product) {
        return product.name.toLowerCase().includes(self.searchText);
      });
    }

    return products;
  },

  render() {
    const products = this.filteredProducts();
    const table = document.getElementById("menuTable");
    const emptyBox = document.getElementById("menuEmpty");
    const self = this;

    if (products.length === 0) {
      table.innerHTML = "";
      emptyBox.innerHTML = App.emptyState("No products found",
        "Try a different search or category.");
      return;
    }

    emptyBox.innerHTML = "";

    table.innerHTML =
      "<thead><tr>" +
        "<th>Product</th><th>Category</th><th>Sizes and prices</th>" +
        '<th class="num">Stock</th><th></th>' +
      "</tr></thead><tbody>" +
      products.map(function (product) {
        const priceList = product.sizes.map(function (size) {
          return App.escape(size.name) + " " + App.money(size.price);
        }).join("  ·  ");

        return "<tr>" +
          "<td><strong>" + App.escape(product.name) + "</strong>" +
            (product.signature ? ' <span class="badge badge-sig">Signature</span>' : "") +
            (product.note ? '<div style="font-size:12px;color:var(--ink-faint)">' +
              App.escape(product.note) + "</div>" : "") +
          "</td>" +
          "<td>" + App.escape(product.group || App.categoryName(product.category)) + "</td>" +
          '<td style="font-size:13px;color:var(--ink-soft)">' + priceList + "</td>" +
          '<td class="num">' + product.stock + "</td>" +
          '<td class="num" style="white-space:nowrap">' +
            '<button class="btn btn-sm" data-edit="' + product.id + '">Edit</button> ' +
            '<button class="btn btn-sm btn-danger" data-delete="' + product.id + '">Delete</button>' +
          "</td>" +
        "</tr>";
      }).join("") +
      "</tbody>";

    table.querySelectorAll("[data-edit]").forEach(function (button) {
      button.addEventListener("click", function () {
        self.openProductForm(Number(button.dataset.edit));
      });
    });

    table.querySelectorAll("[data-delete]").forEach(function (button) {
      button.addEventListener("click", function () {
        self.confirmDelete(Number(button.dataset.delete));
      });
    });
  },

  /* ---------------------------------------------------------
     ADD / EDIT FORM
     Pass null to add a new product, or an id to edit one.
     --------------------------------------------------------- */
  openProductForm(productId) {
    const isEditing = productId !== null;
    const product = isEditing
      ? JSON.parse(JSON.stringify(Store.getProductById(productId)))
      : {
          name: "", category: CATEGORIES[0].id, group: "", note: "",
          addonType: "drink", stock: 0,
          sizes: [{ name: "Regular", price: 0 }],
        };

    const categoryOptions = CATEGORIES.map(function (category) {
      return '<option value="' + category.id + '"' +
        (category.id === product.category ? " selected" : "") + ">" +
        App.escape(category.name) + "</option>";
    }).join("");

    App.openModal(
      '<div class="modal-head">' +
        '<h2 class="modal-title">' + (isEditing ? "Edit product" : "Add product") + "</h2>" +
        '<div class="modal-sub">Prices are used everywhere in the system</div>' +
      "</div>" +
      '<div class="modal-body">' +
        '<div class="field"><label for="pName">Product name</label>' +
          '<input type="text" class="input" id="pName" value="' + App.escape(product.name) + '"></div>' +
        '<div class="field"><label for="pCategory">Category</label>' +
          '<select class="input" id="pCategory">' + categoryOptions + "</select></div>" +
        '<div class="field"><label for="pGroup">Sub-group (optional, e.g. Burger)</label>' +
          '<input type="text" class="input" id="pGroup" value="' + App.escape(product.group || "") + '"></div>' +
        '<div class="field"><label for="pNote">Description (optional)</label>' +
          '<input type="text" class="input" id="pNote" value="' + App.escape(product.note || "") + '"></div>' +
        '<div class="field"><label for="pAddonType">Which add-ons apply</label>' +
          '<select class="input" id="pAddonType">' +
            '<option value="drink"' + (product.addonType === "drink" ? " selected" : "") + ">Drink add-ons</option>" +
            '<option value="food"' + (product.addonType === "food" ? " selected" : "") + ">Food add-ons</option>" +
          "</select></div>" +
        '<div class="field"><label for="pStock">Stock on hand</label>' +
          '<input type="number" class="input" id="pStock" min="0" step="1" value="' + product.stock + '"></div>' +
        '<div class="field"><label>Sizes and prices</label><div id="sizeRows"></div>' +
          '<button type="button" class="btn btn-sm" id="addSizeBtn">Add another size</button></div>' +
        '<div class="validation" id="productValidation"></div>' +
      "</div>" +
      '<div class="modal-foot">' +
        '<button class="btn" id="cancelProduct">Cancel</button>' +
        '<button class="btn btn-primary" id="saveProduct">' +
          (isEditing ? "Save changes" : "Add product") + "</button>" +
      "</div>",
      false
    );

    /* ---- Size rows can be added and removed ---- */
    let sizes = product.sizes.slice();

    function drawSizeRows() {
      document.getElementById("sizeRows").innerHTML = sizes.map(function (size, index) {
        return '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">' +
          '<input type="text" class="input" data-size-name="' + index + '" value="' +
            App.escape(size.name) + '" placeholder="Size name" style="flex:2">' +
          '<input type="number" class="input" data-size-price="' + index + '" value="' +
            size.price + '" min="0" step="1" placeholder="Price" style="flex:1">' +
          (sizes.length > 1
            ? '<button type="button" class="btn btn-sm btn-danger" data-remove-size="' + index + '">\u00D7</button>'
            : "") +
        "</div>";
      }).join("");

      document.querySelectorAll("[data-remove-size]").forEach(function (button) {
        button.addEventListener("click", function () {
          readSizeInputs();
          sizes.splice(Number(button.dataset.removeSize), 1);
          drawSizeRows();
        });
      });
    }

    function readSizeInputs() {
      sizes = sizes.map(function (size, index) {
        const nameBox = document.querySelector('[data-size-name="' + index + '"]');
        const priceBox = document.querySelector('[data-size-price="' + index + '"]');
        return {
          name: nameBox ? nameBox.value.trim() : size.name,
          price: priceBox ? Number(priceBox.value) : size.price,
        };
      });
    }

    drawSizeRows();

    document.getElementById("addSizeBtn").addEventListener("click", function () {
      readSizeInputs();
      sizes.push({ name: "", price: 0 });
      drawSizeRows();
    });

    document.getElementById("cancelProduct").addEventListener("click", function () {
      App.closeModal();
    });

    /* ---- Validation, then save ---- */
    document.getElementById("saveProduct").addEventListener("click", function () {
      readSizeInputs();
      const validation = document.getElementById("productValidation");

      const name = document.getElementById("pName").value.trim();
      const stock = Number(document.getElementById("pStock").value);

      if (name === "") {
        validation.textContent = "Product name cannot be empty.";
        return;
      }
      if (!Number.isInteger(stock) || stock < 0) {
        validation.textContent = "Stock must be a whole number of 0 or more.";
        return;
      }
      if (sizes.length === 0) {
        validation.textContent = "Add at least one size.";
        return;
      }
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i].name === "") {
          validation.textContent = "Every size needs a name.";
          return;
        }
        if (!(sizes[i].price > 0)) {
          validation.textContent = "Every price must be greater than zero.";
          return;
        }
      }

      const saved = {
        id: product.id,
        name: name,
        category: document.getElementById("pCategory").value,
        group: document.getElementById("pGroup").value.trim() || undefined,
        note: document.getElementById("pNote").value.trim() || undefined,
        addonType: document.getElementById("pAddonType").value,
        stock: stock,
        signature: product.signature,
        choice: product.choice,
        sizes: sizes,
      };

      if (isEditing) {
        Store.updateProduct(saved);
        App.toast("Product updated", "good");
      } else {
        Store.addProduct(saved);
        App.toast("Product added", "good");
      }

      App.closeModal();
      MenuPage.render();
      Inventory.render();
    });
  },

  confirmDelete(productId) {
    const product = Store.getProductById(productId);
    if (!product) return;

    App.openModal(
      '<div class="modal-head"><h2 class="modal-title">Delete this product?</h2>' +
        '<div class="modal-sub">' + App.escape(product.name) + "</div></div>" +
      '<div class="modal-body"><p style="margin:0;font-size:14px;color:var(--ink-soft)">' +
        "It will be removed from the menu and from inventory. " +
        "Past transactions keep their own record and are not affected.</p></div>" +
      '<div class="modal-foot">' +
        '<button class="btn" id="cancelDelete">Keep it</button>' +
        '<button class="btn btn-danger" id="doDelete">Delete product</button>' +
      "</div>"
    );

    document.getElementById("cancelDelete").addEventListener("click", function () {
      App.closeModal();
    });
    document.getElementById("doDelete").addEventListener("click", function () {
      Store.deleteProduct(productId);
      App.closeModal();
      MenuPage.render();
      Inventory.render();
      App.toast("Product deleted");
    });
  },
};
