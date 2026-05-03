import os
import glob
import re

html_files = glob.glob('src/*.html') + glob.glob('dist/*.html')

for fpath in set(html_files):
    if not os.path.exists(fpath): continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Address
    content = re.sub(
        r'419 State 414 Rte\s*Beaver Dams, New York\(NY\), 14812,\s*USA',
        'Flat No. 302, Sai Residency, 5th Cross Road,<br>Indiranagar, Bengaluru, Karnataka 560038, India.',
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Phone
    content = content.replace('tel:+607936-8058', 'tel:+916360741295')
    content = content.replace('(607) 936-8058', '+91 6360741295')

    # Email
    content = content.replace('mailto:example@gmail.com', 'mailto:bhatchinmay172@gmail.com')
    content = content.replace('example@gmail.com', 'bhatchinmay172@gmail.com')

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Contact information updated successfully.")
