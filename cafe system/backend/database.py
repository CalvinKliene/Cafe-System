"""
database.py
---------------------------------------------------------------
Small helper module for talking to the SQLite database.

Other files (like seed_database.py, and later app.py) import
get_connection() from here instead of each writing their own
sqlite3.connect() call. That way, if the database file ever
needs to move or be configured differently, it only changes
in ONE place.
---------------------------------------------------------------
"""

import sqlite3
import os

# The database file lives next to this script, inside backend/.
DB_PATH = os.path.join(os.path.dirname(__file__), "cafe.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")


def get_connection():
    """
    Opens a connection to the database file.
    row_factory = sqlite3.Row lets us read columns by name
    (row["name"]) instead of only by position (row[2]), which
    is much easier to read and debug.
    """
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    # Foreign keys are OFF by default in SQLite unless we turn
    # them on for every connection - so we do that here.
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def create_tables():
    """
    Reads schema.sql and runs every CREATE TABLE statement in it.
    Safe to run more than once - every statement uses
    "IF NOT EXISTS", so it will not erase existing data.
    """
    with open(SCHEMA_PATH, "r", encoding="utf-8") as schema_file:
        schema_sql = schema_file.read()

    connection = get_connection()
    connection.executescript(schema_sql)
    connection.commit()
    connection.close()

    print("Tables ready in", DB_PATH)


if __name__ == "__main__":
    # Running "python database.py" directly just builds the
    # empty tables, with no menu data in them yet.
    create_tables()
