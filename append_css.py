import os

dark_mode_css = """

/* --- DARK MODE --- */
body.dark-theme,
body.dark-theme main,
body.dark-theme .container {
    background-color: #121212 !important;
    color: #e0e0e0 !important;
}

body.dark-theme header,
body.dark-theme .header-top,
body.dark-theme .header-main,
body.dark-theme .desktop-navigation-menu,
body.dark-theme .mobile-bottom-navigation,
body.dark-theme footer {
    background-color: #1f1f1f !important;
    color: #e0e0e0 !important;
    border-color: #333 !important;
}

body.dark-theme .showcase,
body.dark-theme .showcase-content,
body.dark-theme .header-user-actions .action-btn,
body.dark-theme input.search-field,
body.dark-theme select,
body.dark-theme .dropdown-panel,
body.dark-theme .mobile-navigation-menu {
    background-color: #2c2c2c !important;
    color: #e0e0e0 !important;
    border-color: #444 !important;
}

body.dark-theme .menu-title,
body.dark-theme .showcase-title,
body.dark-theme .category-box-title,
body.dark-theme h1,
body.dark-theme h2,
body.dark-theme h3,
body.dark-theme h4 {
    color: #fff !important;
}

body.dark-theme a.menu-title,
body.dark-theme a.footer-nav-link {
    color: #ccc !important;
}

body.dark-theme .header-search-container {
    background: transparent;
    border-color: #555 !important;
}

body.dark-theme .price-box .price {
    color: #ff8f9c !important;
}

body.dark-theme [style*="background: #fff"], 
body.dark-theme [style*="background: #fdfdfd"],
body.dark-theme [style*="background: #fcfcfc"],
body.dark-theme [style*="background-color: #fff"] {
    background: #1f1f1f !important;
    border-color: #333 !important;
}

"""

paths = ['src/style.css', 'dist/style.css']
for p in paths:
    if os.path.exists(p):
        with open(p, 'a', encoding='utf-8') as f:
            f.write(dark_mode_css)
        print(f"Appended dark mode to {p}")
