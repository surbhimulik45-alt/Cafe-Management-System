import sqlite3, os

paths = [
    r"c:\Users\RAJESH\OneDrive\Documents\Cafe Management System\cafe.db",
    r"c:\Users\RAJESH\OneDrive\Documents\Cafe Management System\Backend\cafe.db",
]

for path in paths:
    if os.path.exists(path):
        size = os.path.getsize(path)
        conn = sqlite3.connect(path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cur.fetchall()
        print(f"\nPath: {path}")
        print(f"Size: {size} bytes")
        print(f"Tables: {[t[0] for t in tables]}")
        for t in tables:
            cur.execute(f"SELECT COUNT(*) FROM {t[0]}")
            count = cur.fetchone()[0]
            print(f"  - {t[0]}: {count} rows")
        conn.close()
    else:
        print(f"\nNOT FOUND: {path}")
