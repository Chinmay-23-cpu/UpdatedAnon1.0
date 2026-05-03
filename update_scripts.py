import os
import glob

html_files = glob.glob('src/*.html')
for fpath in html_files:
    if 'index.html' in fpath: continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace main.js with accurate scripts
    new_scripts = '''    <script src="script.js"></script>
    <script src="products.js"></script>
    <script src="shared.js"></script>'''
    
    content = content.replace('<script src="main.js"></script>', new_scripts)
    
    # remove the inline shared.js injected by earlier python script if any
    content = content.replace('<script src="./shared.js" defer></script>', '')
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
print('Updated scripts in HTML files')
