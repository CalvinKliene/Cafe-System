/* =============================================================
   settings.js
   -------------------------------------------------------------
   Two settings the staff can change, plus a reset button.

   The low-stock threshold lives here so it is set in ONE place.
   Inventory, the dashboard and the ordering screen all read it
   from here instead of each using their own number.
   ============================================================= */

const Settings = {
  init() {
    const self = this;

    document.getElementById("saveSettingsBtn").addEventListener("click", function () {
      self.save();
    });

    document.getElementById("resetDataBtn").addEventListener("click", function () {
      self.confirmReset();
    });
  },

  render() {
    const settings = Store.getSettings();
    document.getElementById("setCafeName").value = settings.cafeName;
    document.getElementById("setThreshold").value = settings.lowStockThreshold;
  },

  save() {
    const settings = Store.getSettings();
    const name = document.getElementById("setCafeName").value.trim();
    const threshold = Number(document.getElementById("setThreshold").value);

    if (name === "") {
      App.toast("Cafe name cannot be empty", "error");
      return;
    }
    if (!Number.isInteger(threshold) || threshold < 0) {
      App.toast("Low stock threshold must be a whole number of 0 or more", "error");
      return;
    }

    settings.cafeName = name;
    settings.lowStockThreshold = threshold;
    Store.saveSettings(settings);

    App.toast("Settings saved", "good");
  },

  confirmReset() {
    App.openModal(
      '<div class="modal-head"><h2 class="modal-title">Reset all data?</h2>' +
        '<div class="modal-sub">This cannot be undone</div></div>' +
      '<div class="modal-body"><p style="margin:0;font-size:14px;color:var(--ink-soft)">' +
        "Every saved transaction will be deleted and the menu will go back to " +
        "the original prices and stock levels.</p></div>" +
      '<div class="modal-foot">' +
        '<button class="btn" id="cancelReset">Cancel</button>' +
        '<button class="btn btn-danger" id="doReset">Reset everything</button>' +
      "</div>"
    );

    document.getElementById("cancelReset").addEventListener("click", function () {
      App.closeModal();
    });
    document.getElementById("doReset").addEventListener("click", function () {
      Store.resetAll();
      Orders.currentOrder = [];
      App.closeModal();
      App.showPage("dashboard");
      App.toast("All data reset");
    });
  },
};
