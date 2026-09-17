/* =============================================================
   transactions.js
   -------------------------------------------------------------
   A list of every completed order, newest first.
   Staff can search, filter by date, and re-open any receipt.
   ============================================================= */

const Transactions = {
  searchText: "",
  dateFrom: "",
  dateTo: "",

  init() {
    const self = this;

    document.getElementById("txnSearch").addEventListener("input", function (event) {
      self.searchText = event.target.value.trim().toLowerCase();
      self.render();
    });

    document.getElementById("txnDateFrom").addEventListener("change", function (event) {
      self.dateFrom = event.target.value;
      self.render();
    });

    document.getElementById("txnDateTo").addEventListener("change", function (event) {
      self.dateTo = event.target.value;
      self.render();
    });

    document.getElementById("txnClearFilters").addEventListener("click", function () {
      self.searchText = "";
      self.dateFrom = "";
      self.dateTo = "";
      document.getElementById("txnSearch").value = "";
      document.getElementById("txnDateFrom").value = "";
      document.getElementById("txnDateTo").value = "";
      self.render();
    });
  },

  /* Apply search text and the two date boxes. */
  filteredTransactions() {
    const self = this;
    let transactions = Store.getTransactions().slice().reverse(); /* newest first */

    if (this.searchText) {
      transactions = transactions.filter(function (transaction) {
        const itemNames = transaction.lines.map(function (line) {
          return line.name;
        }).join(" ").toLowerCase();
        return transaction.orderNumber.toLowerCase().includes(self.searchText) ||
               itemNames.includes(self.searchText);
      });
    }

    if (this.dateFrom) {
      const from = new Date(this.dateFrom + "T00:00:00");
      transactions = transactions.filter(function (transaction) {
        return new Date(transaction.dateTime) >= from;
      });
    }

    if (this.dateTo) {
      const to = new Date(this.dateTo + "T23:59:59");
      transactions = transactions.filter(function (transaction) {
        return new Date(transaction.dateTime) <= to;
      });
    }

    return transactions;
  },

  render() {
    const transactions = this.filteredTransactions();
    const table = document.getElementById("txnTable");
    const emptyBox = document.getElementById("txnEmpty");
    const self = this;

    if (transactions.length === 0) {
      table.innerHTML = "";
      const hasFilters = this.searchText || this.dateFrom || this.dateTo;
      emptyBox.innerHTML = hasFilters
        ? App.emptyState("No transactions match these filters", "Try clearing the filters.")
        : App.emptyState("No transactions yet", "Completed orders will be listed here.");
      return;
    }

    emptyBox.innerHTML = "";

    /* A small running total of what is currently shown. */
    const shownTotal = transactions.reduce(function (sum, transaction) {
      return sum + transaction.total;
    }, 0);

    table.innerHTML =
      "<thead><tr><th>Order</th><th>Date and time</th><th>Items</th>" +
      '<th class="num">Total</th><th class="num">Change</th><th></th></tr></thead><tbody>' +
      transactions.map(function (transaction) {
        const itemCount = transaction.lines.reduce(function (sum, line) {
          return sum + line.quantity;
        }, 0);
        const preview = transaction.lines.map(function (line) {
          return line.name;
        }).slice(0, 2).join(", ") + (transaction.lines.length > 2 ? "…" : "");

        return "<tr>" +
          "<td><strong>" + App.escape(transaction.orderNumber) + "</strong></td>" +
          "<td>" + App.formatDateTime(transaction.dateTime) + "</td>" +
          "<td>" + itemCount + (itemCount === 1 ? " item" : " items") +
            '<div style="font-size:12px;color:var(--ink-faint)">' + App.escape(preview) + "</div></td>" +
          '<td class="num">' + App.money(transaction.total) + "</td>" +
          '<td class="num">' + App.money(transaction.change) + "</td>" +
          '<td class="num"><button class="btn btn-sm" data-view="' +
            App.escape(transaction.orderNumber) + '">Receipt</button></td>' +
        "</tr>";
      }).join("") +
      "</tbody>" +
      '<tfoot><tr><td colspan="3" style="color:var(--ink-soft)">' +
        transactions.length + (transactions.length === 1 ? " transaction shown" : " transactions shown") +
      '</td><td class="num"><strong>' + App.money(shownTotal) + "</strong></td><td></td><td></td></tr></tfoot>";

    table.querySelectorAll("[data-view]").forEach(function (button) {
      button.addEventListener("click", function () {
        self.viewReceipt(button.dataset.view);
      });
    });
  },

  /* Re-open a saved receipt. Uses the same builder as checkout. */
  viewReceipt(orderNumber) {
    const transaction = Store.getTransactionByNumber(orderNumber);
    if (!transaction) return;

    App.openModal(
      '<div class="modal-head">' +
        '<h2 class="modal-title">Receipt ' + App.escape(transaction.orderNumber) + "</h2>" +
        '<div class="modal-sub">' + App.formatDateTime(transaction.dateTime) + "</div>" +
      "</div>" +
      '<div id="receiptPrintArea">' + Orders.buildReceiptHtml(transaction) + "</div>" +
      '<div class="modal-foot">' +
        '<button class="btn" id="printOldReceipt">Print receipt</button>' +
        '<button class="btn btn-primary" id="closeOldReceipt">Close</button>' +
      "</div>"
    );

    document.getElementById("printOldReceipt").addEventListener("click", function () {
      window.print();
    });
    document.getElementById("closeOldReceipt").addEventListener("click", function () {
      App.closeModal();
    });
  },
};
