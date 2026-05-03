import re
import json

html_path = 'src/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

products = []

# Split by class="showcase"
parts = content.split('class="showcase"')
for i, part in enumerate(parts[1:]): # skip the first part which is before any showcase
    try:
        # Find img src
        img_match = re.search(r'<img[^>]*?src=["\']([^"\']+)["\']', part)
        if not img_match: continue
        img = img_match.group(1)
        
        # Find title
        title_match = re.search(r'class="showcase-title"[^>]*>([^<]+)', part)
        if not title_match: continue
        title = title_match.group(1).strip()
        
        # Find price
        price_match = re.search(r'class="price"[^>]*>([^<]+)', part)
        if not price_match: continue
        price_str = price_match.group(1).strip()
        price_val = re.sub(r'[^\d.]', '', price_str)
        if not price_val: continue
        price = float(price_val)
        
        # Find category
        cat_match = re.search(r'class="showcase-category"[^>]*>([^<]+)', part)
        category = cat_match.group(1).strip().lower() if cat_match else 'unspecified'
        
        # Assign category if unspecified
        tl = title.lower()
        if category == 'unspecified':
            if 'shirt' in tl or 'dress' in tl or 'skirt' in tl or 'jacket' in tl:
                category = 'clothes'
            elif 'shoe' in tl or 'boot' in tl:
                category = 'shoes'
            elif 'watch' in tl:
                category = 'watches'
            elif 'ring' in tl or 'earring' in tl or 'necklace' in tl:
                category = 'jewelry'
            elif 'shampoo' in tl or 'perfume' in tl:
                category = 'cosmetics'

        products.append({
            'id': f'prod_{i}',
            'title': title,
            'price': price,
            'image': img,
            'category': category.replace("'","") # simple clean
        })
    except Exception as e:
        pass

unique_products = {}
for p in products:
    if p['title'] not in unique_products:
        unique_products[p['title']] = p

prod_list = list(unique_products.values())

with open('src/products.js', 'w', encoding='utf-8') as f:
    f.write(f'const ALL_PRODUCTS = {json.dumps(prod_list, indent=2)};\n')

print(f"Extracted {len(prod_list)} unique products.")
