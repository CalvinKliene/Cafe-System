"""
menu_data.py
---------------------------------------------------------------
The REAL Six-Four-Five Cafe menu, as Python data.

This is generated directly from frontend/js/menu-data.js so the
two never drift apart - every product, size, price and add-on
here is exactly what is in the frontend.

seed_database.py reads this file and inserts everything into
the database. This file itself does NOT touch the database -
it just holds the data.
---------------------------------------------------------------
"""

import json
import os

_SEED_JSON_PATH = os.path.join(os.path.dirname(__file__), "menu-seed.json")

with open(_SEED_JSON_PATH, "r", encoding="utf-8") as _file:
    _data = json.load(_file)

SETTINGS = _data["SETTINGS"]
CATEGORIES = _data["CATEGORIES"]
PRODUCTS = _data["PRODUCTS"]
ADDONS = _data["ADDONS"]


if __name__ == "__main__":
    # Quick sanity check when run directly: python menu_data.py
    print("Categories:", len(CATEGORIES))
    print("Products:", len(PRODUCTS))
    print("Add-ons:", len(ADDONS))
