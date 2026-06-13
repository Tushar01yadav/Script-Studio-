import os
import re

TARGET_DIR = r"C:\Users\HP\Desktop\Projects\Yotube\frontend\src"

REPLACEMENTS = [
    # Replace glass-card and similar with saas-card
    (r'border border-gray-800(?:/60)? bg-\[#0d1222\](?:/50)? p-8 shadow-2xl backdrop-blur-md glass-card', r'saas-card p-8'),
    (r'border border-gray-800 bg-\[#0d1222\]/80 p-8 shadow-2xl backdrop-blur-md', r'saas-card p-8'),
    (r'border border-gray-800/80 bg-\[#0d1222\]/80', r'saas-card'),
    (r'border border-gray-800 bg-\[#0d1222\]/80', r'saas-card'),
    (r'bg-\[#0d1222\]/80 border border-gray-800', r'saas-card'),
    (r'glass-card', r'saas-card'),
    
    # Replace buttons
    (r'bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2\.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500', r'btn-primary px-6 py-2.5 text-sm font-semibold'),
    (r'bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2\.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500', r'btn-primary px-5 py-2.5 text-sm font-semibold'),
    (r'bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500', r'btn-primary px-5 py-2 text-sm font-semibold'),
    (r'bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500', r'btn-primary px-4 py-2 text-xs font-semibold'),
    (r'bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white hover:from-indigo-500 hover:to-violet-500', r'btn-primary px-4 py-2 text-sm font-semibold'),
    (r'bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500', r'btn-primary py-2.5 text-sm font-semibold'),
    (r'bg-gradient-to-r from-indigo-600 to-violet-600 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500', r'btn-primary py-2 text-xs font-semibold'),
    (r'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md', r'bg-indigo-600'),
    (r'bg-gradient-to-r from-indigo-600 to-violet-600', r'bg-indigo-600'),
    
    # Replace gradient texts
    (r'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-\[0_0_8px_rgba\(99,102,241,0\.25\)\]', r'text-white'),
    (r'bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent', r'text-white'),
    
    # Update hardcoded backgrounds to match #09090b
    (r'bg-\[#070a13\]', r'bg-[#09090b]'),
    (r'bg-\[#070913\]', r'bg-[#09090b]'),
]

for root, _, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in REPLACEMENTS:
                new_content = re.sub(old, new, new_content)
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
