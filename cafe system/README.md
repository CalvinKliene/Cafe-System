# Six-Four-Five Cafe — Ordering and Inventory System

Web-Based Café Ordering and Inventory Management System with Sales Reporting
and Digital Receipt Generation.

This folder currently contains **Step 6: the frontend**. The Python backend and
SQLite database come next.

## How to run it right now

Open `frontend/index.html` in a browser. That's it — no server needed yet.

In VS Code, the Live Server extension works well: right-click `index.html`
→ "Open with Live Server".

## Folder structure

```
cafe-system/
│
├── frontend/
│   ├── index.html          the page itself: sidebar, top bar, seven screens
│   │
│   ├── css/
│   │   └── styles.css      all styling, organised into numbered sections
│   │
│   └── js/
│       ├── menu-data.js    the real menu (TEMPORARY - backend replaces it)
│       ├── storage.js      saves data (TEMPORARY - backend replaces it)
│       ├── app.js          shared helpers: navigation, money, modals, toasts
│       ├── orders.js       the ordering screen and the digital receipt
│       ├── dashboard.js    summary cards and charts
│       ├── menu-page.js    product management (add, edit, delete)
│       ├── inventory.js    stock levels and stock updates
│       ├── reports.js      monthly and annual sales reports
│       ├── transactions.js transaction history and saved receipts
│       └── settings.js     cafe name, low stock threshold, reset
│
└── README.md
```

One file per screen. Nothing is hidden inside one giant file.

## What is temporary

`menu-data.js` and `storage.js` are placeholders for the backend.

- `menu-data.js` holds the menu that will live in the SQL `products` table.
- `storage.js` saves data in the browser instead of a database.

When the Python backend is built, the **inside** of `storage.js` changes to call
the server. The function names stay the same, so none of the screen files need
to be touched. That separation is the point.

## Input → Process → Output

| Stage | What happens |
|---|---|
| Input | Product, size, quantity, add-ons, cash received |
| Process | Price lookup, item subtotal, add-on subtotal, total, change, stock deduction, transaction saved |
| Output | Digital receipt, change due, updated inventory, transaction record, monthly report, annual report |

## Rules the system enforces

- Quantity must be a whole number of at least 1
- An order cannot be completed while empty
- Cash received must be at least the total
- A product cannot be ordered beyond its stock
- Prices must be greater than zero
- Stock is only reduced when an order is **completed**, never while it is
  still being built

## Notes on the data

- Every product, price and add-on was transcribed from the cafe's menu boards.
- Stock quantities are **placeholders set to 50**. Real numbers can be entered
  on the Inventory page.
- Items marked `***` on the boards are stored as `signature: true`.
- *White Chocolate Mocha* appears twice on purpose — once under Coffee and once
  under Blended, at different prices, exactly as printed.
