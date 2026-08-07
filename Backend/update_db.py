import sqlite3

def check_db():
    conn = sqlite3.connect('../cafe.db')
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(menu)")
        print(cursor.fetchall())
    except sqlite3.OperationalError as e:
        print(f"OperationalError: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    check_db()
