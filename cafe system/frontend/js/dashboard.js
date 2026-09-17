/* =============================================================
   dashboard.js
   -------------------------------------------------------------
   Everything on the dashboard is worked out from real saved
   transactions. Nothing here is made up. If there are no
   transactions, the screen says so plainly.
   ============================================================= */

const Dashboard = {
  render() {
    const transactions = Store.getTransactions();
    const products = Store.getProducts();
    const settings = Store.getSettings();

    /* ---- Which transactions happened today? ---- */
    const today = new Date().toDateString();
    const todaysTransactions = transactions.filter(function (transaction) {
      return new Date(transaction.dateTime).toDateString() === today;
    });

    const todaysSales = todaysTransactions.reduce(function (sum, transaction) {
      return sum + transaction.total;
    }, 0);

    /* ---- How many products are running low? ---- */
    const lowStockProducts = products.filter(function (product) {
      return product.stock > 0 && product.stock <= settings.lowStockThreshold;
    });
    const outOfStockProducts = products.filter(function (product) {
      return product.stock <= 0;
    });

    /* ---- The four summary cards ---- */
    document.getElementById("statGrid").innerHTML =
      this.statCard("Today's sales", App.money(todaysSales),
        todaysTransactions.length === 0 ? "No sales recorded yet" : "So far today") +
      this.statCard("Today's transactions", String(todaysTransactions.length),
        transactions.length + " recorded in total") +
      this.statCard("Products on the menu", String(products.length),
        CATEGORIES.length + " categories") +
      this.statCard("Low stock items", String(lowStockProducts.length + outOfStockProducts.length),
        outOfStockProducts.length > 0
          ? outOfStockProducts.length + " out of stock"
          : (lowStockProducts.length === 0 ? "Nothing to restock" : "At or below " + settings.lowStockThreshold),
        lowStockProducts.length + outOfStockProducts.length > 0);

    this.renderYearChart(transactions);
    this.renderTopProducts(transactions);
  },

  statCard(label, value, footnote, isWarning) {
    return '<div class="stat">' +
      '<div class="stat-label">' + App.escape(label) + "</div>" +
      '<div class="stat-value">' + App.escape(value) + "</div>" +
      '<div class="stat-foot' + (isWarning ? " is-warn" : "") + '">' +
        App.escape(footnote) + "</div>" +
    "</div>";
  },

  /* ---------------------------------------------------------
     Monthly bar chart for the current year.
     Drawn with plain CSS - no chart library needed.
     --------------------------------------------------------- */
  renderYearChart(transactions) {
    const year = new Date().getFullYear();
    document.getElementById("dashYearNote").textContent = String(year);

    const monthlyTotals = Reports.totalsByMonth(transactions, year);
    const highest = Math.max.apply(null, monthlyTotals);

    if (highest === 0) {
      document.getElementById("dashChart").innerHTML =
        App.emptyState("No sales recorded yet",
          "Complete an order and it will appear here.");
      return;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    document.getElementById("dashChart").innerHTML = '<div class="bars">' +
      monthlyTotals.map(function (amount, index) {
        const heightPercent = highest > 0 ? (amount / highest) * 100 : 0;
        return '<div class="bar-col' + (amount === 0 ? " is-empty" : "") + '">' +
          '<span class="bar-value">' + (amount > 0 ? Math.round(amount).toLocaleString() : "") + "</span>" +
          '<div class="bar" style="height:' + Math.max(heightPercent, 1) + '%"></div>' +
          '<span class="bar-label">' + monthNames[index] + "</span>" +
        "</div>";
      }).join("") + "</div>";
  },

  /* ---------------------------------------------------------
     Which products have been ordered the most?
     --------------------------------------------------------- */
  renderTopProducts(transactions) {
    const counts = Reports.countProductsSold(transactions);
    const container = document.getElementById("dashTopProducts");

    if (counts.length === 0) {
      container.innerHTML = App.emptyState("Nothing sold yet",
        "Top sellers appear once orders are completed.");
      return;
    }

    container.innerHTML = counts.slice(0, 7).map(function (entry, index) {
      return '<div class="rank-row">' +
        '<span class="rank-num">' + (index + 1) + "</span>" +
        '<span class="rank-name">' + App.escape(entry.name) + "</span>" +
        '<span class="rank-count">' + entry.quantity + " sold</span>" +
      "</div>";
    }).join("");
  },
};
