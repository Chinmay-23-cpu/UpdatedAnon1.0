import os
import re

html_path = 'src/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find <main> block
main_match = re.search(r'<main>.*?</main>', content, flags=re.DOTALL)
if not main_match:
    print('Error: <main> not found')
    exit(1)

main_content = main_match.group(0)
header_part = content[:main_match.start()]
footer_part = content[main_match.end():]

pages = {
    'mens.html': '<main>\n  <div class="container" style="padding: 40px 0;">\n    <h2 class="title">Men\'s Collection</h2>\n    <div class="product-grid" id="category-grid" data-category="mens"></div>\n  </div>\n</main>',
    'womens.html': '<main>\n  <div class="container" style="padding: 40px 0;">\n    <h2 class="title">Women\'s Collection</h2>\n    <div class="product-grid" id="category-grid" data-category="womens"></div>\n  </div>\n</main>',
    'jewelry.html': '<main>\n  <div class="container" style="padding: 40px 0;">\n    <h2 class="title">Jewelry</h2>\n    <div class="product-grid" id="category-grid" data-category="jewelry"></div>\n  </div>\n</main>',
    'cart.html': '<main>\n  <div class="container" style="padding: 40px 0;">\n    <h2 class="title">Your Cart</h2>\n    <div id="cart-items"></div>\n    <div id="cart-total" style="font-size: 24px; font-weight: bold; margin-top: 20px;"></div>\n  </div>\n</main>',
    'favourites.html': '<main>\n  <div class="container" style="padding: 40px 0;">\n    <h2 class="title">Your Favourites</h2>\n    <div class="product-grid" id="favourites-items"></div>\n  </div>\n</main>',
    'profile.html': '<main>\n  <div class="container" style="padding: 40px 0;">\n    <h2 class="title">User Profile</h2>\n    <p style="font-size: 18px; margin-bottom: 20px;">Welcome back, <b>John Doe</b>!</p>\n    <p>Email: john.doe@example.com</p>\n    <p>Orders: 12</p>\n  </div>\n</main>',
    'blog.html': '<main>\n  <div class="container" style="padding: 40px 0;">\n    <h2 class="title">Our Blog</h2>\n    <p>Blog posts coming soon...</p>\n  </div>\n</main>',
    'offers.html': '<main>\n  <div class="container" style="padding: 40px 0;">\n    <h2 class="title">Hot Offers</h2>\n    <p>Discounts up to 50%!</p>\n  </div>\n</main>',
    'product.html': '<main>\n  <div class="container" style="padding: 40px 0;">\n    <div id="product-detail"></div>\n  </div>\n</main>'
}

# Update header_part to include our shared state script
script_tag = '<script src="./shared.js" defer></script>\n</head>'
if '</head>' in header_part:
    header_part = header_part.replace('</head>', script_tag)

for page, body in pages.items():
    page_path = os.path.join('src', page)
    # Fix nav links dynamically
    page_header = header_part
    # Here we might also want to fix the 'href=' in nav menu but let's do it in shared.js to save string replacement
    
    new_content = page_header + body + footer_part
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Created {page}')
