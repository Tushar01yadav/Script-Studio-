import sqlite3
import json
import random
import re

def clean_and_extract_keywords(prompt):
    if not prompt:
        return 'creative,scene'
    stop_words = {
        'a', 'an', 'the', 'on', 'in', 'of', 'and', 'with', 'is', 'are', 'was', 'were', 
        'looks', 'showing', 'to', 'for', 'at', 'by', 'from', 'about', 'as', 'into', 'side',
        'left', 'right', 'close-up', 'closeup', 'portrait', 'person', 'people', 'man', 'woman',
        'image', 'photo', 'picture', 'style', 'like', 'modern', 'highly', 'ultra', 'detailed', 
        '8k', 'resolution', 'hd', 'conceptual', 'background', 'foreground', 'stands', 'behind',
        'extremely', 'optimized', 'for', 'midjourney', 'stable', 'diffusion', 'cinematic'
    }
    # replace non-alphanumeric chars (excluding dashes) with spaces
    words = re.sub(r'[^\w\s-]', ' ', prompt.lower()).split()
    unique_words = []
    for w in words:
        if len(w) > 2 and w not in stop_words and w not in unique_words:
            unique_words.append(w)
    unique_words = unique_words[:4]
    return ','.join(unique_words) if unique_words else 'creative,scene'

def run_migration():
    conn = sqlite3.connect('script_studio.db')
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, title, scene_plan FROM projects")
        rows = cursor.fetchall()
        migrated_count = 0
        for pid, title, plan_str in rows:
            if not plan_str:
                continue
            try:
                plan = json.loads(plan_str)
            except Exception:
                continue
            
            if not isinstance(plan, list):
                continue
                
            updated = False
            for scene in plan:
                url = scene.get('generated_image_url', '')
                if url and ('pollinations.ai' in url or 'myceli.ai' in url):
                    prompt = scene.get('image_prompt') or scene.get('visual') or 'creative scene'
                    keywords = clean_and_extract_keywords(prompt)
                    seed = random.randint(1, 100000)
                    new_url = f"https://loremflickr.com/1024/576/{keywords}/all?lock={seed}"
                    scene['generated_image_url'] = new_url
                    updated = True
                    
            if updated:
                new_plan_str = json.dumps(plan)
                cursor.execute("UPDATE projects SET scene_plan=? WHERE id=?", (new_plan_str, pid))
                conn.commit()
                print(f"Migrated project {pid} ('{title}') from Pollinations to LoremFlickr URLs.")
                migrated_count += 1
        print(f"Migration completed. Migrated {migrated_count} project(s).")
    except Exception as e:
        print("Error during migration:", e)
    finally:
        conn.close()

if __name__ == '__main__':
    run_migration()
