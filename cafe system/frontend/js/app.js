/* =============================================================
   app.js
   -------------------------------------------------------------
   The shared parts every screen uses:
     - switching between pages
     - formatting money and dates
     - showing pop-up messages (toasts)
     - opening and closing modal windows
   ============================================================= */

const App = {
  currentPage: "dashboard",

  /* Titles shown in the top bar for each page. */
  pageInfo: {
    dashboard:    { title: "Dashboard",      subtitle: "Today at a glance" },
    orders:       { title: "New Order",      subtitle: "Build an order and take payment" },
    menu:         { title: "Menu",           subtitle: "Products, prices and categories" },
    inventory:    { title: "Inventory",      subtitle: "Stock levels for every product" },
    reports:      { title: "Sales Reports",  subtitle: "Monthly and annual sales" },
    transactions: { title: "Transactions",   subtitle: "Every completed order" },
    settings:     { title: "Settings",       subtitle: "Cafe details and system data" },
  },

  /* ---------------------------------------------------------
     STARTUP
     --------------------------------------------------------- */
  start() {
    this.setupNavigation();
    this.startClock();

    /* Build each screen once at startup. */
    Orders.init();
    MenuPage.init();
    Inventory.init();
    Reports.init();
    Transactions.init();
    Settings.init();

    this.showPage("dashboard");
  },

  /* ---------------------------------------------------------
     NAVIGATION
     --------------------------------------------------------- */
  setupNavigation() {
    const self = this;

    document.querySelectorAll(".nav-item").forEach(function (button) {
      button.addEventListener("click", function () {
        self.showPage(button.dataset.page);
        document.getElementById("sidebar").classList.remove("is-open");
      });
    });

    document.getElementById("menuToggle").addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("is-open");
    });

    /* Close any modal with the Escape key. */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") self.closeModal();
    });

    /* Click the dark area outside a modal to close it. */
    document.getElementById("modalBackdrop").addEventListener("click", function (event) {
      if (event.target.id === "modalBackdrop") self.closeModal();
    });
  },

  showPage(pageName) {
    this.currentPage = pageName;

    /* Hide every page, then show the one we want. */
    document.querySelectorAll(".page").forEach(function (page) {
      page.hidden = true;
    });
    document.getElementById("page-" + pageName).hidden = false;

    /* Highlight the matching sidebar button. */
    document.querySelectorAll(".nav-item").forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.page === pageName);
    });

    /* Update the heading. */
    const info = this.pageInfo[pageName];
    document.getElementById("pageTitle").textContent = info.title;
    document.getElementById("pageSubtitle").textContent = info.subtitle;

    /* Redraw the page so it shows the latest data. */
    if (pageName === "dashboard")    Dashboard.render();
    if (pageName === "orders")       Orders.render();
    if (pageName === "menu")         MenuPage.render();
    if (pageName === "inventory")    Inventory.render();
    if (pageName === "reports")      Reports.render();
    if (pageName === "transactions") Transactions.render();
    if (pageName === "settings")     Settings.render();
  },

  /* ---------------------------------------------------------
     FORMATTING HELPERS
     --------------------------------------------------------- */

  /* Turn 1234.5 into "₱1,234.50" */
  money(amount) {
    const settings = Store.getSettings();
    return settings.currency + Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  /* Turn a saved date string into "17 Sep 2026, 3:04 PM" */
  formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString("en-PH", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  },

  formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-PH", { day: "2-digit", month: "short", year: "numeric" });
  },

  /* Make text safe before putting it inside HTML. */
  escape(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  },

  /* Work out the stock status of one product. */
  stockStatus(product) {
    const threshold = Store.getSettings().lowStockThreshold;
    if (product.stock <= 0) return "out";
    if (product.stock <= threshold) return "low";
    return "in";
  },

  stockBadge(product) {
    const status = this.stockStatus(product);
    if (status === "out") return '<span class="badge badge-out">Out of stock</span>';
    if (status === "low") return '<span class="badge badge-low">Low stock</span>';
    return '<span class="badge badge-in">In stock</span>';
  },

  categoryName(categoryId) {
    const category = CATEGORIES.find(function (item) { return item.id === categoryId; });
    return category ? category.name : categoryId;
  },

  /* Reusable empty-state block. */
  emptyState(title, hint) {
    return '<div class="empty">' +
      '<div class="empty-title">' + this.escape(title) + "</div>" +
      (hint ? '<div class="empty-hint">' + this.escape(hint) + "</div>" : "") +
      "</div>";
  },

  /* ---------------------------------------------------------
     TOASTS (small messages in the corner)
     --------------------------------------------------------- */
  toast(message, kind) {
    const stack = document.getElementById("toastStack");
    const element = document.createElement("div");
    element.className = "toast" + (kind ? " is-" + kind : "");
    element.textContent = message;
    stack.appendChild(element);

    setTimeout(function () { element.remove(); }, 3200);
  },

  /* ---------------------------------------------------------
     MODALS
     --------------------------------------------------------- */
  openModal(htmlContent, isWide) {
    const box = document.getElementById("modalBox");
    box.className = "modal" + (isWide ? " modal-wide" : "");
    box.innerHTML = htmlContent;
    document.getElementById("modalBackdrop").hidden = false;
  },

  closeModal() {
    document.getElementById("modalBackdrop").hidden = true;
    document.getElementById("modalBox").innerHTML = "";
  },

  /* ---------------------------------------------------------
     CLOCK in the top bar
     --------------------------------------------------------- */
  startClock() {
    function tick() {
      const now = new Date();
      document.getElementById("clockTime").textContent =
        now.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
      document.getElementById("clockDate").textContent =
        now.toLocaleDateString("en-PH", { weekday: "long", day: "numeric", month: "long" });
    }
    tick();
    setInterval(tick, 1000 * 20);
  },
};
