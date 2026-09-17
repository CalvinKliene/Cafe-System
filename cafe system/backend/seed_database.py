"""
seed_database.py
---------------------------------------------------------------
Run this ONCE to build cafe.db and fill it with the real
Six-Four-Five Cafe menu.

    python seed_database.py

What it does, step by step:
  1. Creates every table (if they don't already exist)
  2. Inserts the 6 categories
  3. Inserts every product, and each product's sizes
  4. Inserts any pick-one choices (only Flavored Fries has one)
  5. Inserts every add-on
  6. Inserts the starting settings row

Safe to re-run: it clears out any previously seeded rows first,
so running it twice won't create duplicate products.
---------------------------------------------------------------
"""

from database import get_connection, create_tables
from menu_data import SETTINGS, CATEGORIES, PRODUCTS, ADDONS


def clear_existing_data(connection):
    """
    Wipes out old rows before inserting fresh ones, so running
    this script twice does not create duplicate products.
    Transactions are NOT touched - real sales history should
    never be deleted by re-seeding the menu.
    """
    tables_to_clear = [
        "transaction_item_addons",  # cleared automatically by CASCADE,
        "transaction_items",        # but listed here for clarity
        "product_choices",
        "product_sizes",
        "products",
        "categories",
        "addons",
        "settings",
    ]
    # Only clear the menu-related tables, not transaction history.
    for table in ["product_choices", "product_sizes", "products", "categories", "addons", "settings"]:
        connection.execute("DELETE FROM " + table)

    connection.commit()


def seed_categories(connection):
    """
    Inserts the 6 categories and returns a lookup dictionary,
    e.g. {"coffee": 1, "special": 2, ...}, so we know which
    category_id to use when inserting products.
    """
    category_ids = {}

    for category in CATEGORIES:
        cursor = connection.execute(
            "INSERT INTO categories (slug, name) VALUES (?, ?)",
            (category["id"], category["name"]),
        )
        category_ids[category["id"]] = cursor.lastrowid

    connection.commit()
    print("Inserted", len(CATEGORIES), "categories")
    return category_ids


def seed_products(connection, category_ids):
    """
    Inserts every product, then its sizes, then its choice
    options if it has any (only Flavored Fries does).
    """
    product_count = 0
    size_count = 0
    choice_count = 0

    for product in PRODUCTS:
        cursor = connection.execute(
            """
            INSERT INTO products
                (category_id, name, product_group, note, addon_type, is_signature, stock)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                category_ids[product["category"]],
                product["name"],
                product.get("group"),
                product.get("note"),
                product["addonType"],
                1 if product.get("signature") else 0,
                product["stock"],
            ),
        )
        new_product_id = cursor.lastrowid
        product_count += 1

        for size in product["sizes"]:
            connection.execute(
                "INSERT INTO product_sizes (product_id, size_name, price) VALUES (?, ?, ?)",
                (new_product_id, size["name"], size["price"]),
            )
            size_count += 1

        choice = product.get("choice")
        if choice:
            for option in choice["options"]:
                connection.execute(
                    "INSERT INTO product_choices (product_id, choice_label, choice_value) VALUES (?, ?, ?)",
                    (new_product_id, choice["label"], option),
                )
                choice_count += 1

    connection.commit()
    print("Inserted", product_count, "products,", size_count, "sizes,", choice_count, "choice options")


def seed_addons(connection):
    for addon in ADDONS:
        connection.execute(
            "INSERT INTO addons (name, price, applies_to) VALUES (?, ?, ?)",
            (addon["name"], addon["price"], addon["appliesTo"]),
        )

    connection.commit()
    print("Inserted", len(ADDONS), "add-ons")


def seed_settings(connection):
    connection.execute(
        """
        INSERT INTO settings (id, cafe_name, tagline, currency, low_stock_threshold)
        VALUES (1, ?, ?, ?, ?)
        """,
        (
            SETTINGS["cafeName"],
            SETTINGS.get("tagline"),
            SETTINGS["currency"],
            SETTINGS["lowStockThreshold"],
        ),
    )
    connection.commit()
    print("Inserted starting settings")


def run():
    create_tables()

    connection = get_connection()
    try:
        clear_existing_data(connection)
        category_ids = seed_categories(connection)
        seed_products(connection, category_ids)
        seed_addons(connection)
        seed_settings(connection)
        print("\nDatabase seeded successfully.")
    finally:
        connection.close()


if __name__ == "__main__":
    run()
