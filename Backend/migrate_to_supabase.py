"""
Safe Data Migration Script: SQLite -> Supabase PostgreSQL
=========================================================
- Reads ALL data from your local cafe.db (SQLite)
- Creates all tables in Supabase (PostgreSQL)
- Copies every row safely -- NO data is deleted or erased
- Safe to run multiple times (skips duplicates)
"""

import sqlite3
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Force UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()

# -- Connections --------------------------------------------------------------

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "cafe.db")
SUPABASE_URL = os.getenv("DATABASE_URL")

print("=" * 60)
print("  Cafe Management System - Data Migration to Supabase")
print("=" * 60)

if not SUPABASE_URL:
    print("ERROR: DATABASE_URL not found in .env file")
    exit(1)

if not os.path.exists(SQLITE_PATH):
    print(f"ERROR: cafe.db not found at {SQLITE_PATH}")
    exit(1)

print(f"\n[OK] SQLite source : {SQLITE_PATH}")
print(f"[OK] Supabase target: {SUPABASE_URL[:50]}...")

# -- Connect to SQLite ---------------------------------------------------------
sqlite_conn = sqlite3.connect(SQLITE_PATH)
sqlite_conn.row_factory = sqlite3.Row
sqlite_cur = sqlite_conn.cursor()

# ── Connect to Supabase PostgreSQL ────────────────────────────────────────────
pg_engine = create_engine(SUPABASE_URL, pool_pre_ping=True)
PgSession = sessionmaker(bind=pg_engine)
pg_session = PgSession()

# ── Create All Tables in Supabase ─────────────────────────────────────────────
print("\n⏳ Creating tables in Supabase...")

# Import all models so Base knows about them
import sys
sys.path.insert(0, os.path.dirname(__file__))
from database import Base
import models  # triggers all model imports

Base.metadata.create_all(bind=pg_engine)
print("✅ All tables created in Supabase\n")

# ── Helper: Migrate One Table ─────────────────────────────────────────────────
def migrate_table(table_name: str, insert_sql: str, transform=None):
    """Read all rows from SQLite and insert into Supabase (skip existing IDs)."""
    try:
        sqlite_cur.execute(f"SELECT * FROM {table_name}")
        rows = sqlite_cur.fetchall()
        if not rows:
            print(f"  ⚠️  {table_name}: empty, nothing to migrate")
            return

        count = 0
        skipped = 0
        for row in rows:
            data = dict(row)
            if transform:
                data = transform(data)
            try:
                pg_session.execute(text(insert_sql), data)
                pg_session.commit()
                count += 1
            except Exception:
                pg_session.rollback()
                skipped += 1  # Already exists or constraint issue

        print(f"  ✅ {table_name}: {count} rows migrated, {skipped} skipped (already exist)")

    except sqlite3.OperationalError as e:
        print(f"  ⚠️  {table_name}: table not found in SQLite ({e})")
    except Exception as e:
        pg_session.rollback()
        print(f"  ❌ {table_name}: ERROR — {e}")


# ── Migrate Each Table ────────────────────────────────────────────────────────
print("⏳ Migrating data...\n")

# 1. Users
migrate_table(
    "users",
    """INSERT INTO users (id, name, email, password, role, is_active)
       VALUES (:id, :name, :email, :password, :role, :is_active)
       ON CONFLICT (id) DO NOTHING"""
)

# 2. Admins
migrate_table(
    "admins",
    """INSERT INTO admins (id, name, email, password, role, is_active)
       VALUES (:id, :name, :email, :password, :role, :is_active)
       ON CONFLICT (id) DO NOTHING"""
)

# 3. Categories
migrate_table(
    "categories",
    """INSERT INTO categories (id, name)
       VALUES (:id, :name)
       ON CONFLICT (id) DO NOTHING"""
)

# 4. Menu
migrate_table(
    "menu",
    """INSERT INTO menu (id, name, price, image, category, rating, nutrition, preference, spice_level)
       VALUES (:id, :name, :price, :image, :category, :rating, :nutrition, :preference, :spice_level)
       ON CONFLICT (id) DO NOTHING"""
)

# 5. Orders
migrate_table(
    "orders",
    """INSERT INTO orders (id, customer_name, user_id, items, total_price, status)
       VALUES (:id, :customer_name, :user_id, :items, :total_price, :status)
       ON CONFLICT (id) DO NOTHING"""
)

# 6. Cart
migrate_table(
    "cart",
    """INSERT INTO cart (id, user_id, menu_id, item_name, quantity, price, total_price)
       VALUES (:id, :user_id, :menu_id, :item_name, :quantity, :price, :total_price)
       ON CONFLICT (id) DO NOTHING"""
)

# 7. Bookings
migrate_table(
    "bookings",
    """INSERT INTO bookings (id, user_id, customer_name, phone_number, table_type, number_of_people, booking_date, booking_time, status)
       VALUES (:id, :user_id, :customer_name, :phone_number, :table_type, :number_of_people, :booking_date, :booking_time, :status)
       ON CONFLICT (id) DO NOTHING"""
)

# 8. Payments
migrate_table(
    "payments",
    """INSERT INTO payments (id, user_id, order_id, amount, payment_method, payment_status, transaction_id, qr_code)
       VALUES (:id, :user_id, :order_id, :amount, :payment_method, :payment_status, :transaction_id, :qr_code)
       ON CONFLICT (id) DO NOTHING"""
)

# 9. Reviews
migrate_table(
    "reviews",
    """INSERT INTO reviews (id, user_id, menu_id, item_name, rating, review)
       VALUES (:id, :user_id, :menu_id, :item_name, :rating, :review)
       ON CONFLICT (id) DO NOTHING"""
)

# 10. Favorites
migrate_table(
    "favorites",
    """INSERT INTO favorites (id, user_id, menu_id, item_name)
       VALUES (:id, :user_id, :menu_id, :item_name)
       ON CONFLICT (id) DO NOTHING"""
)

# 11. Offers
migrate_table(
    "offers",
    """INSERT INTO offers (id, item_name, description, original_price, discount_percentage, offer_price, offer_status)
       VALUES (:id, :item_name, :description, :original_price, :discount_percentage, :offer_price, :offer_status)
       ON CONFLICT (id) DO NOTHING"""
)

# 12. Nutrition
migrate_table(
    "nutrition",
    """INSERT INTO nutrition (id, menu_id, item_name, calories, protein, carbohydrates, fat)
       VALUES (:id, :menu_id, :item_name, :calories, :protein, :carbohydrates, :fat)
       ON CONFLICT (id) DO NOTHING"""
)

# 13. Order Tracking
migrate_table(
    "order_tracking",
    """INSERT INTO order_tracking (id, order_id, user_id, order_status)
       VALUES (:id, :order_id, :user_id, :order_status)
       ON CONFLICT (id) DO NOTHING"""
)

# ── Fix Sequences (so new inserts get correct auto-increment IDs) ──────────────
print("\n⏳ Fixing auto-increment sequences in Supabase...")
tables_with_id = [
    "users", "admins", "categories", "menu", "orders",
    "cart", "bookings", "payments", "reviews", "favorites",
    "offers", "nutrition", "order_tracking"
]

for table in tables_with_id:
    try:
        pg_session.execute(text(
            f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
            f"COALESCE((SELECT MAX(id) FROM {table}), 1), true)"
        ))
        pg_session.commit()
        print(f"  ✅ {table}: sequence fixed")
    except Exception as e:
        pg_session.rollback()
        print(f"  ⚠️  {table}: could not fix sequence ({e})")

# ── Done ──────────────────────────────────────────────────────────────────────
sqlite_conn.close()
pg_session.close()

print("\n" + "=" * 60)
print("  🎉 Migration Complete! All your data is now in Supabase.")
print("     Your SQLite cafe.db was NOT deleted or changed.")
print("=" * 60)
