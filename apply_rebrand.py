import os
import glob
import re

html_files = glob.glob('src/*.html') + glob.glob('dist/*.html')

for fpath in set(html_files):
    if not os.path.exists(fpath): continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Rebrand Anon -> TrendWave
    content = content.replace('Anon', 'TrendWave')

    # Currency Option
    # Look for <option value="usd">USD &dollar;</option>
    usd_str = '<option value="usd">USD &dollar;</option>'
    inr_str = '<option value="usd">USD &dollar;</option>\n                        <option value="inr">INR &rupee;</option>'
    if usd_str in content and 'value="inr"' not in content:
        content = content.replace(usd_str, inr_str)

    # Theme toggle
    target_select = '<select name="currency">'
    toggle_html = '<button id="theme-toggle" class="action-btn" onclick="toggleTheme()" style="font-size: 18px; margin-right: 10px; cursor: pointer; background: transparent; border: none; color: inherit;">🌙</button>\n                    <select name="currency">'
    if target_select in content and 'id="theme-toggle"' not in content:
        content = content.replace(target_select, toggle_html)
        
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Rebranding and header injections completed successfully.")
