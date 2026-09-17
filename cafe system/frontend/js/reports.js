/* =============================================================
   reports.js
   -------------------------------------------------------------
   Two reports, both built only from saved transactions:

     MONTHLY - pick a month, see total sales, how many
               transactions, and the top-selling products
     ANNUAL  - pick a year, see the yearly total and a
               month-by-month breakdown
   ============================================================= */

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];

const Reports = {
  activeReport: "monthly",

  init() {
    const self = this;

    document.querySelectorAll("[data-report]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        self.activeReport = tab.dataset.report;
        document.querySelectorAll("[data-report]").forEach(function (other) {
          other.classList.toggle("is-on", other === tab);
        });
        self.render();
      });
    });
  },

  render() {
    if (this.activeReport === "monthly") this.renderMonthly();
    else this.renderAnnual();
  },

  /* ---------------------------------------------------------
     SHARED CALCULATIONS
     These are also used by the dashboard.
     --------------------------------------------------------- */

  /* Returns an array of 12 numbers: total sales per month. */
  totalsByMonth(transactions, year) {
    const totals = new Array(12).fill(0);
    transactions.forEach(function (transaction) {
      const date = new Date(transaction.dateTime);
      if (date.getFullYear() === year) {
        totals[date.getMonth()] += transaction.total;
      }
    });
    return totals;
  },

  /* Returns an array of 12 numbers: transaction count per month. */
  countsByMonth(transactions, year) {
    const counts = new Array(12).fill(0);
    transactions.forEach(function (transaction) {
      const date = new Date(transaction.dateTime);
      if (date.getFullYear() === year) {
        counts[date.getMonth()] += 1;
      }
    });
    return counts;
  },

  /* Counts how many of each product were sold, highest first. */
  countProductsSold(transactions) {
    const tally = {};

    transactions.forEach(function (transaction) {
      transaction.lines.forEach(function (line) {
        if (!tally[line.name]) tally[line.name] = 0;
        tally[line.name] += line.quantity;
      });
    });

    return Object.keys(tally)
      .map(function (name) { return { name: name, quantity: tally[name] }; })
      .sort(function (a, b) { return b.quantity - a.quantity; });
  },

  /* Which years actually have transactions? */
  yearsWithSales(transactions) {
    const years = [];
    transactions.forEach(function (transaction) {
      const year = new Date(transaction.dateTime).getFullYear();
      if (!years.includes(year)) years.push(year);
    });
    if (years.length === 0) years.push(new Date().getFullYear());
    return years.sort(function (a, b) { return b - a; });
  },

  /* ---------------------------------------------------------
     MONTHLY REPORT
     --------------------------------------------------------- */
  renderMonthly() {
    const transactions = Store.getTransactions();
    const years = this.yearsWithSales(transactions);
    const self = this;

    /* Remember the month/year the staff picked, or start with now. */
    if (this.selectedMonth === undefined) this.selectedMonth = new Date().getMonth();
    if (this.selectedYear === undefined) this.selectedYear = years[0];

    const monthOptions = MONTH_NAMES.map(function (name, index) {
      return '<option value="' + index + '"' +
        (index === self.selectedMonth ? " selected" : "") + ">" + name + "</option>";
    }).join("");

    const yearOptions = years.map(function (year) {
      return '<option value="' + year + '"' +
        (year === self.selectedYear ? " selected" : "") + ">" + year + "</option>";
    }).join("");

    /* Filter to the chosen month. */
    const monthTransactions = transactions.filter(function (transaction) {
      const date = new Date(transaction.dateTime);
      return date.getFullYear() === self.selectedYear && date.getMonth() === self.selectedMonth;
    });

    const totalSales = monthTransactions.reduce(function (sum, transaction) {
      return sum + transaction.total;
    }, 0);

    const averageSale = monthTransactions.length > 0 ? totalSales / monthTransactions.length : 0;
    const topProducts = this.countProductsSold(monthTransactions);

    let body =
      '<div class="report-controls">' +
        '<div class="field"><label for="reportMonth">Month</label>' +
          '<select class="input" id="reportMonth">' + monthOptions + "</select></div>" +
        '<div class="field"><label for="reportYear">Year</label>' +
          '<select class="input" id="reportYear">' + yearOptions + "</select></div>" +
      "</div>";

    if (monthTransactions.length === 0) {
      body += '<div class="card">' + App.emptyState(
        "No sales recorded for " + MONTH_NAMES[this.selectedMonth] + " " + this.selectedYear,
        "Completed orders for this month will appear here.") + "</div>";
    } else {
      body +=
        '<div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">' +
          Dashboard.statCard("Total sales", App.money(totalSales),
            MONTH_NAMES[this.selectedMonth] + " " + this.selectedYear) +
          Dashboard.statCard("Transactions", String(monthTransactions.length), "Completed orders") +
          Dashboard.statCard("Average order", App.money(averageSale), "Total divided by orders") +
        "</div>" +
        '<div class="card panel">' +
          '<div class="panel-head"><h2 class="panel-title">Top selling products</h2>' +
          '<span class="panel-note">' + MONTH_NAMES[this.selectedMonth] + "</span></div>" +
          topProducts.slice(0, 10).map(function (entry, index) {
            return '<div class="rank-row">' +
              '<span class="rank-num">' + (index + 1) + "</span>" +
              '<span class="rank-name">' + App.escape(entry.name) + "</span>" +
              '<span class="rank-count">' + entry.quantity + " sold</span>" +
            "</div>";
          }).join("") +
        "</div>";
    }

    document.getElementById("reportBody").innerHTML = body;

    document.getElementById("reportMonth").addEventListener("change", function (event) {
      self.selectedMonth = Number(event.target.value);
      self.renderMonthly();
    });
    document.getElementById("reportYear").addEventListener("change", function (event) {
      self.selectedYear = Number(event.target.value);
      self.renderMonthly();
    });
  },

  /* ---------------------------------------------------------
     ANNUAL REPORT
     --------------------------------------------------------- */
  renderAnnual() {
    const transactions = Store.getTransactions();
    const years = this.yearsWithSales(transactions);
    const self = this;

    if (this.selectedAnnualYear === undefined) this.selectedAnnualYear = years[0];

    const yearOptions = years.map(function (year) {
      return '<option value="' + year + '"' +
        (year === self.selectedAnnualYear ? " selected" : "") + ">" + year + "</option>";
    }).join("");

    const monthlyTotals = this.totalsByMonth(transactions, this.selectedAnnualYear);
    const monthlyCounts = this.countsByMonth(transactions, this.selectedAnnualYear);

    const yearTotal = monthlyTotals.reduce(function (sum, amount) { return sum + amount; }, 0);
    const yearCount = monthlyCounts.reduce(function (sum, count) { return sum + count; }, 0);
    const highest = Math.max.apply(null, monthlyTotals);

    let body =
      '<div class="report-controls">' +
        '<div class="field"><label for="annualYear">Year</label>' +
          '<select class="input" id="annualYear">' + yearOptions + "</select></div>" +
      "</div>";

    if (yearCount === 0) {
      body += '<div class="card">' + App.emptyState(
        "No sales recorded for " + this.selectedAnnualYear,
        "Completed orders for this year will appear here.") + "</div>";
    } else {
      /* Find the best month so far. */
      let bestMonthIndex = 0;
      monthlyTotals.forEach(function (amount, index) {
        if (amount > monthlyTotals[bestMonthIndex]) bestMonthIndex = index;
      });

      body +=
        '<div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">' +
          Dashboard.statCard("Total annual sales", App.money(yearTotal),
            String(this.selectedAnnualYear)) +
          Dashboard.statCard("Transactions", String(yearCount), "Completed orders this year") +
          Dashboard.statCard("Best month", MONTH_NAMES[bestMonthIndex],
            App.money(monthlyTotals[bestMonthIndex])) +
        "</div>" +

        '<div class="card panel" style="margin-bottom:16px">' +
          '<div class="panel-head"><h2 class="panel-title">Monthly breakdown</h2></div>' +
          '<div class="bars">' +
            monthlyTotals.map(function (amount, index) {
              const heightPercent = highest > 0 ? (amount / highest) * 100 : 0;
              return '<div class="bar-col' + (amount === 0 ? " is-empty" : "") + '">' +
                '<span class="bar-value">' + (amount > 0 ? Math.round(amount).toLocaleString() : "") + "</span>" +
                '<div class="bar" style="height:' + Math.max(heightPercent, 1) + '%"></div>' +
                '<span class="bar-label">' + MONTH_NAMES[index].slice(0, 3) + "</span>" +
              "</div>";
            }).join("") +
          "</div>" +
        "</div>" +

        '<div class="card panel">' +
          '<div class="panel-head"><h2 class="panel-title">Month by month</h2></div>' +
          '<div class="month-grid">' +
            monthlyTotals.map(function (amount, index) {
              return '<div class="month-cell' + (amount === 0 ? " is-zero" : "") + '">' +
                '<div class="month-name">' + MONTH_NAMES[index] + "</div>" +
                '<div class="month-amount">' + App.money(amount) + "</div>" +
                '<div class="month-count">' + monthlyCounts[index] +
                  (monthlyCounts[index] === 1 ? " transaction" : " transactions") + "</div>" +
              "</div>";
            }).join("") +
          "</div>" +
        "</div>";
    }

    document.getElementById("reportBody").innerHTML = body;

    document.getElementById("annualYear").addEventListener("change", function (event) {
      self.selectedAnnualYear = Number(event.target.value);
      self.renderAnnual();
    });
  },
};
