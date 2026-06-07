import sqlite3

def run_migration():
    conn = sqlite3.connect('script_studio.db')
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(projects)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'audio_files' not in columns:
            cursor.execute('ALTER TABLE projects ADD COLUMN audio_files TEXT;')
            conn.commit()
            print("Successfully added audio_files column to projects table.")
        else:
            print("audio_files column already exists.")
    except Exception as e:
        print("Error checking or adding column:", e)
    finally:
        conn.close()

if __name__ == '__main__':
    run_migration()
