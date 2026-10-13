# Four Five Six Café — Console System

## Requirements
- Python 3.10 or newer recommended
- No external packages required

## Run
Open this folder in VS Code, open the terminal, and run:

```bash
python main.py
```

If your computer uses `py` instead:

```bash
py main.py
```

## Files and folders
- `main.py` — menu, ordering, calculations, inventory, reports, receipts
- `data/inventory.json` — created automatically on first run; stores current stock
- `data/transactions.json` — created automatically; stores completed transactions
- `data/receipts/` — generated digital receipt text files
- `data/transactions_export.csv` — optional transaction export created from the menu

## Important notes
- The product names and prices are based on the group code supplied for this project.
- Three-size drinks use the supplied labels: 12oz Hot, 16oz Cold, and 20oz Cold.
- Two-size items are temporarily labeled Small and Large because the supplied code did not specify their actual size names. Confirm these with the café.
- The original list has 18 two-size product names but only 17 price rows. To avoid inventing a price, the final item (`Green Apple Soda`) is not included in the active catalog until its two prices are confirmed. Add its actual price row to `TWO_SIZE_PRODUCTS` in `main.py` before submission.
- The source spelling `Strawberyy Matcha` and `Lychiee Soda` is preserved from the group code; confirm spelling against the official menu.
- This is file-based storage, not SQL. JSON files preserve inventory and transaction history between runs, but this does not satisfy an SQL-specific requirement if one is later reinstated.
- Back up the `data` folder before making major changes or deleting test records.
