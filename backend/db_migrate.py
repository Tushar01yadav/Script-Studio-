import sqlite3

def run_migration():
    conn = sqlite3.connect('script_studio.db')
    cursor = conn.cursor()
    try:
        # Check if the column exists
        cursor.execute("PRAGMA table_info(projects)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'voiceover_text' not in columns:
            cursor.execute('ALTER TABLE projects ADD COLUMN voiceover_text TEXT;')
            conn.commit()
            print("Successfully added voiceover_text column to projects table.")
        else:
            print("voiceover_text column already exists.")
    except Exception as e:
        print("Error checking or adding column:", e)
    finally:
        conn.close()

if __name__ == '__main__':
    run_migration()
