// global state and functions
window.addEventListener('DOMContentLoaded', () => {
    if (typeof ALL_PRODUCTS === 'undefined') {
        const prodScript = document.createElement('script');
        prodScript.src = './products.js';
        prodScript.onload = initApp;
        document.head.appendChild(prodScript);
    } else {
        initApp();
    }
});

function initApp() {
    initTheme();
    initCurrency();
    updateBadges();
    setupProductRenderers();
    fixNavigationLinks();
    bindStaticProducts();
    setupSearch();
}

// --- Theme & Currency Engine ---
let currentTheme = localStorage.getItem('theme') || 'light';
let currentCurrency = localStorage.getItem('currency') || 'usd';

function initTheme() {
    if(currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
}

window.toggleTheme = function() {
    const body = document.body;
    const isCyanAmber = body.classList.contains('theme-cyan-amber');
    const isDark = body.classList.contains('dark-theme');
    
    if (isCyanAmber) {
        // Switching from cyan-amber to default theme
        body.classList.remove('theme-cyan-amber');
        currentTheme = 'light';
    } else if (isDark) {
        // Switching from dark to light
        body.classList.remove('dark-theme');
        currentTheme = 'light';
    } else {
        // Switching from light to cyan-amber
        body.classList.add('theme-cyan-amber');
        currentTheme = 'cyan-amber';
    }
    
    localStorage.setItem('theme', currentTheme);
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        if (currentTheme === 'cyan-amber') {
            themeBtn.textContent = '🌙'; // Switch to default
        } else if (currentTheme === 'dark') {
            themeBtn.textContent = '☀️'; // Switch to light
        } else {
            themeBtn.textContent = '🌙'; // Switch to dark
        }
    }
};

function initCurrency() {
    const selects = document.querySelectorAll('select[name="currency"]');
    selects.forEach(select => {
        select.value = currentCurrency;
        select.addEventListener('change', (e) => {
            currentCurrency = e.target.value;
            localStorage.setItem('currency', currentCurrency);
            // Sync all selects
            document.querySelectorAll('select[name="currency"]').forEach(s => s.value = currentCurrency);
            // Update all prices across the site
            updateAllPrices();
        });
    });
}

// Global function to update all prices when currency changes
window.updateAllPrices = function() {
    // Update product grid prices
    if (typeof setupProductRenderers === 'function') {
        setupProductRenderers();
    }
    
    // Update static product prices on index page
    document.querySelectorAll('.showcase .price').forEach(el => {
        const titleEl = el.closest('.showcase')?.querySelector('.showcase-title');
        if(titleEl) {
            const titleText = titleEl.textContent.trim();
            const prod = ALL_PRODUCTS.find(p => p.title === titleText);
            if(prod) {
                el.textContent = formatPrice(prod.price);
            }
        }
    });
    
    // Update product detail page price
    const priceBigEl = document.querySelector('.price-big');
    if(priceBigEl && typeof currentProduct !== 'undefined' && currentProduct) {
        priceBigEl.innerHTML = formatPrice(currentProduct.price);
    }
    
    // Update checkout page prices
    if (typeof updateCheckoutPrices === 'function') {
        updateCheckoutPrices();
    }
};

function formatPrice(priceUsd) {
    if (currentCurrency === 'inr') {
        // approximate conversion $1 = 83 INR
        const priceInr = priceUsd * 83;
        // Make it look natural, e.g., end with 99 if > 500
        const rounded = priceInr > 500 ? Math.ceil(priceInr / 100) * 100 - 1 : Math.round(priceInr);
        return `₹${rounded.toLocaleString('en-IN')}`;
    }
    return `$${priceUsd.toFixed(2)}`;
}

// --- Search Engine ---
function setupSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchField = document.querySelector('.search-field');
    if (searchBtn && searchField) {
        searchBtn.onclick = () => {
            if(searchField.value.trim()) {
                window.location.href = 'index.html?search=' + encodeURIComponent(searchField.value.trim());
            }
        };
        searchField.addEventListener('keypress', (e) => {
            if(e.key === 'Enter' && searchField.value.trim()) {
                window.location.href = 'index.html?search=' + encodeURIComponent(searchField.value.trim());
            }
        });
    }
}

// --- Cart & Favourites ---
function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); updateBadges(); }

function getFavourites() { return JSON.parse(localStorage.getItem('favourites') || '[]'); }
function saveFavourites(favs) { localStorage.setItem('favourites', JSON.stringify(favs)); updateBadges(); }

window.addToCart = async function(productId, qty = null, redirectUrl = null) {
    if (typeof supabaseClient === 'undefined') {
        console.warn("Supabase client not initialized.");
        return;
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
        console.warn("User is not logged in.");
        alert("Please log in to add items to your cart.");
        window.location.href = "login.html";
        return;
    }

    try {
        let quantityToAdd = 1;
        if (qty !== null) {
            quantityToAdd = parseInt(qty, 10);
        } else {
            const qtyElement = document.getElementById('buy-qty');
            if (qtyElement) {
                quantityToAdd = parseInt(qtyElement.value, 10);
            }
        }

        const { data: existingCartItems, error: fetchError } = await supabaseClient
            .from('cart_items')
            .select('id, quantity')
            .eq('product_id', productId)
            .eq('user_id', user.id);

        if (fetchError) throw fetchError;

        if (existingCartItems && existingCartItems.length > 0) {
            const cartItem = existingCartItems[0];
            const newQuantity = cartItem.quantity + quantityToAdd;

            const { error: updateError } = await supabaseClient
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', cartItem.id);

            if (updateError) throw updateError;
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                alert("Cart quantity updated!");
            }
        } else {
            const { error: insertError } = await supabaseClient
                .from('cart_items')
                .insert([{ user_id: user.id, product_id: productId, quantity: quantityToAdd }]);

            if (insertError) throw insertError;
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                alert("Added to cart!");
            }
        }
    } catch (error) {
        console.error("Error managing cart:", error.message);
        alert("There was a problem adding the item to your cart. Please try again.");
    }
};

window.addToFavourites = function(productId) {
    const favs = getFavourites();
    if(!favs.includes(productId)) {
        favs.push(productId);
        saveFavourites(favs);
        alert('Added to Favourites!');
    } else {
        alert('Already in Favourites!');
    }
};

window.removeFromCart = async function(cartItemId) {
    if (typeof supabaseClient === 'undefined') return;
    
    const { error } = await supabaseClient
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);
        
    if (error) {
        console.error("Error removing item:", error.message);
        alert("Failed to remove item.");
    } else {
        renderCart(); // re-render if on cart page
    }
};

window.removeFromFavourites = function(productId) {
    let favs = getFavourites();
    favs = favs.filter(id => id !== productId);
    saveFavourites(favs);
    renderFavourites(); // re-render if on fav page
};

window.wishlistItems = new Set(); // Global state for wishlist

window.fetchUserWishlist = async function() {
    if (typeof supabaseClient === 'undefined') return;
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            const { data } = await supabaseClient.from('wishlist').select('product_id').eq('user_id', user.id);
            if (data) {
                window.wishlistItems = new Set(data.map(item => item.product_id));
            }
        }
    } catch (e) {
        console.error("Error fetching wishlist:", e);
    }
};

window.toggleWishlist = async function(productId, btnElement) {
    if (typeof supabaseClient === 'undefined') return;
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert("Please log in to manage your wishlist.");
            window.location.href = "login.html";
            return;
        }

        const isInWishlist = window.wishlistItems.has(productId);
        const icon = btnElement ? btnElement.querySelector('ion-icon') : null;

        if (isInWishlist) {
            // Remove from wishlist
            const { error } = await supabaseClient.from('wishlist').delete().match({ user_id: user.id, product_id: productId });
            if (!error) {
                window.wishlistItems.delete(productId);
                if (icon) {
                    icon.setAttribute('name', 'heart-outline');
                    icon.style.color = '';
                }
                if (window.location.pathname.includes('favourites.html')) {
                    if (typeof renderFavourites === 'function') renderFavourites();
                }
            }
        } else {
            // Add to wishlist
            const { error } = await supabaseClient.from('wishlist').insert([{ user_id: user.id, product_id: productId }]);
            if (!error) {
                window.wishlistItems.add(productId);
                if (icon) {
                    icon.setAttribute('name', 'heart');
                    icon.style.color = 'red';
                }
            }
        }
        
        // Update header badges
        if (typeof updateBadges === 'function') {
            updateBadges();
        }
    } catch (e) {
        console.error("Error toggling wishlist:", e);
    }
};

// Real-time subscription variables
let cartSubscription = null;
let wishlistSubscription = null;

window.updateBadges = async function() {
    const actionBtns = document.querySelectorAll('.header-user-actions .action-btn .count');
    if(actionBtns.length >= 2) {
        // Setup real-time subscriptions first
        setupRealtimeSubscriptions();
        
        // Fetch real wishlist count
        let wishlistCount = 0;
        let cartCount = 0;
        if (typeof supabaseClient !== 'undefined') {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
                const { count: wCount } = await supabaseClient.from('wishlist').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                wishlistCount = wCount || 0;

                const { data: cData } = await supabaseClient.from('cart_items').select('quantity').eq('user_id', user.id);
                if (cData) {
                    cartCount = cData.reduce((acc, item) => acc + item.quantity, 0);
                }
            }
        }
        actionBtns[0].textContent = wishlistCount;
        actionBtns[1].textContent = cartCount;
    }
}

// Setup real-time subscriptions for authenticated users
function setupRealtimeSubscriptions() {
    if (typeof window.supabaseClient === 'undefined') {
        console.warn('Supabase client not initialized for realtime');
        return;
    }

    const userId = localStorage.getItem('user_id');
    if (!userId) {
        console.log('🔔 User not authenticated, skipping realtime subscriptions');
        return;
    }

    console.log('🔔 Setting up realtime subscriptions for user:', userId);

    // Subscribe to cart_items changes
    cartSubscription = window.supabaseClient
        .channel('cart-changes')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'cart_items',
                filter: `user_id=eq.${userId}` 
            },
            (payload) => {
                console.log('🛒 Cart change detected:', payload.event, payload.new);
                updateCartBadge();
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Cart subscription active');
            } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
                console.log('⚠️ Cart subscription lost, reconnecting...');
                setupRealtimeSubscriptions();
            }
        });

    // Subscribe to wishlist changes
    wishlistSubscription = window.supabaseClient
        .channel('wishlist-changes')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'wishlist',
                filter: `user_id=eq.${userId}` 
            },
            (payload) => {
                console.log('❤️ Wishlist change detected:', payload.event, payload.new);
                updateWishlistBadge();
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Wishlist subscription active');
            } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
                console.log('⚠️ Wishlist subscription lost, reconnecting...');
                setupRealtimeSubscriptions();
            }
        });
}

// Update cart badge with smooth transition
function updateCartBadge() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;

    // Fetch current cart count from database
    const userId = localStorage.getItem('user_id');
    if (userId) {
        window.supabaseClient
            .from('cart_items')
            .select('id')
            .eq('user_id', userId)
            .then(({ data, error }) => {
                if (!error && data) {
                    const count = data.length;
                    cartCount.textContent = count;
                    
                    // Smooth transition: hide badge if count is 0
                    if (count === 0) {
                        cartCount.style.display = 'none';
                    } else {
                        cartCount.style.display = 'flex';
                        cartCount.style.background = '#ff6b6b';
                        cartCount.style.color = 'white';
                    }
                }
            });
    }
}

// Update wishlist badge with smooth transition
function updateWishlistBadge() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (!wishlistCount) return;

    // Fetch current wishlist count from database
    const userId = localStorage.getItem('user_id');
    if (userId) {
        window.supabaseClient
            .from('wishlist')
            .select('id')
            .eq('user_id', userId)
            .then(({ data, error }) => {
                if (!error && data) {
                    const count = data.length;
                    wishlistCount.textContent = count;
                    
                    // Smooth transition: hide badge if count is 0
                    if (count === 0) {
                        wishlistCount.style.display = 'none';
                    } else {
                        wishlistCount.style.display = 'flex';
                        wishlistCount.style.background = '#ff6b6b';
                        wishlistCount.style.color = 'white';
                    }
                }
            });
    }
}

window.filterByCategory = function(categoryName) {
    if(!window.location.pathname.includes('index.html') && window.location.pathname !== '/' && window.location.pathname !== '') {
        window.location.href = 'index.html?category=' + encodeURIComponent(categoryName);
        return;
    }
    
    // update URL without reloading
    const url = new URL(window.location);
    url.searchParams.set('category', categoryName);
    window.history.pushState({}, '', url);

    if (typeof loadProducts === 'function') {
        loadProducts(categoryName);
    }
};

// Load products from Supabase by category and/or gender
window.loadProductsFromSupabase = async function(categoryIds = null, categoryName = null, gender = null) {
    if (typeof window.supabaseClient === 'undefined') {
        console.warn("Supabase client not initialized");
        return [];
    }

    let query = window.supabaseClient.from('products').select('*');
    
    console.log('🔧 Building query with:', { categoryIds, categoryName, gender });
    
    if (categoryIds && Array.isArray(categoryIds)) {
        // Query by multiple category IDs using .in() method
        query = query.in('category_id', categoryIds);
        console.log('🔧 Query built: .in("category_id", [', categoryIds.join(', '), '])');
    } else if (categoryIds && typeof categoryIds === 'string') {
        // Query by single category ID
        query = query.eq('category_id', categoryIds);
        console.log('🔧 Query built: .eq("category_id", "', categoryIds, '")');
    } else if (categoryName) {
        // For backward compatibility with string-based category filtering
        query = query.eq('category', categoryName);
        console.log('🔧 Query built: .eq("category", "', categoryName, '")');
    }
    
    // Add gender filter if specified
    if (gender) {
        if (gender.includes(',')) {
            // Handle multiple gender values (e.g., 'men,unisex')
            const genderValues = gender.split(',');
            query = query.in('gender', genderValues);
            console.log('🔧 Added gender filter: .in("gender", [', genderValues.join(', '), '])');
        } else {
            // Handle single gender value
            query = query.eq('gender', gender);
            console.log('🔧 Added gender filter: .eq("gender", "', gender, '")');
        }
    }
    
    console.log('🔧 Final query string:', query);
    
    const { data: products, error } = await query;
    
    if (error) {
        console.error("❌ Supabase error:", error);
        return [];
    }
    
    console.log('✅ Supabase success, products count:', products?.length || 0);
    return products || [];
};

function fixNavigationLinks() {
    const links = document.querySelectorAll('.desktop-menu-category-list .menu-title, .mobile-menu-category-list > .menu-category > .menu-title');
    links.forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        if(text === "home") link.href = "index.html";
        // Dedicated category pages
        else if(text === "men's") { link.href = "mens.html"; link.onclick = null; }
        else if(text === "women's") { link.href = "womens.html"; link.onclick = null; }
        else if(text === "jewelry") { link.href = "jewelry.html"; link.onclick = null; }
        // Keep perfume as a filter (no dedicated page present)
        else if(text === "perfume") { link.href = "#"; link.onclick = (e) => { e.preventDefault(); filterByCategory('Perfume'); } }
        else if(text === "blog") link.href = "blog.html";
        else if(text === "hot offers") link.href = "offers.html";
    });
    
    // User profile link (first action btn)
    const actionBtns = document.querySelectorAll('.header-user-actions .action-btn');
    if(actionBtns.length >= 3) {
        // Avoid overriding the theme toggle which might be [0] now
        // Let's rely on querying the icons instead
        const profileBtn = document.querySelector('.header-user-actions ion-icon[name="person-outline"]');
        if(profileBtn) {
            profileBtn.closest('button').onclick = () => {
                if(localStorage.getItem('user_logged_in') === 'true') window.location.href = "profile.html";
                else window.location.href = "login.html";
            };
        }
        const favBtn = document.querySelector('.header-user-actions ion-icon[name="heart-outline"]');
        if(favBtn) {
            favBtn.closest('button').onclick = () => window.location.href = "favourites.html";
        }
        const cartBtn = document.querySelector('.header-user-actions ion-icon[name="bag-handle-outline"]');
        if(cartBtn) {
            cartBtn.closest('button').onclick = () => window.location.href = "cart.html";
        }
    }

    // --- Categories click wiring (Fix broken category filtering) ---
    // 1) Desktop dropdown-panel links
    document.querySelectorAll('.dropdown-panel a[href="#"]').forEach(a => {
        if(a.dataset.categoryWired === 'true') return;
        a.dataset.categoryWired = 'true';
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryName = (a.textContent || '').trim();
            if(!categoryName) return;
            filterByCategory(categoryName);
        });
    });

    // 2) Category grid "Show All" links
    document.querySelectorAll('.category-btn[href="#"]').forEach(btn => {
        if(btn.dataset.categoryWired === 'true') return;
        btn.dataset.categoryWired = 'true';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const titleEl = btn.closest('.category-item')?.querySelector('.category-item-title');
            const categoryName = (titleEl?.textContent || '').trim();
            if(!categoryName) return;
            filterByCategory(categoryName);
        });
    });

    // 3) Sidebar submenu links
    document.querySelectorAll('.sidebar-submenu-title[href="#"]').forEach(a => {
        if(a.dataset.categoryWired === 'true') return;
        a.dataset.categoryWired = 'true';
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const nameEl = a.querySelector('.product-name');
            const categoryName = (nameEl?.textContent || '').trim();
            if(!categoryName) return;
            filterByCategory(categoryName);
        });
    });
}

function bindStaticProducts() {
    if(!window.location.pathname.includes('index.html') && window.location.pathname !== '/' && window.location.pathname !== '') {
        return; 
    }
    const showcases = document.querySelectorAll('.showcase');
    showcases.forEach(showcase => {
        const titleEl = showcase.querySelector('.showcase-title');
        if(!titleEl) return;
        const titleText = titleEl.textContent.trim();
        const prod = ALL_PRODUCTS.find(p => p.title === titleText);
        if(!prod) return;
        
        const imgBox = showcase.querySelector('.showcase-img-box, .showcase-banner, .product-img');
        if(imgBox) {
            imgBox.style.cursor = 'pointer';
            imgBox.onclick = (e) => { e.preventDefault(); window.location.href = 'product.html?id=' + prod.id; };
        }
        
        const aTitle = titleEl.closest('a');
        if (aTitle) aTitle.href = 'product.html?id=' + prod.id;

        const heartBtn = showcase.querySelector('.btn-action ion-icon[name="heart-outline"], .btn-action ion-icon[name="heart"]');
        if(heartBtn) {
            const btn = heartBtn.closest('button');
            if(btn) btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod.id, btn); };
            if(window.wishlistItems && window.wishlistItems.has(prod.id)) {
                heartBtn.setAttribute('name', 'heart');
                heartBtn.style.color = 'red';
            }
        }
        
        const eyeBtn = showcase.querySelector('.btn-action ion-icon[name="eye-outline"]');
        if(eyeBtn) {
            const btn = eyeBtn.closest('button');
            if(btn) btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); window.location.href = 'product.html?id=' + prod.id; };
        }
        
        const cartBtn = showcase.querySelector('.btn-action ion-icon[name="bag-add-outline"]');
        if(cartBtn) {
            const btn = cartBtn.closest('button');
            if(btn) btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); addToCart(prod.id); };
        }
        
        const bigCartBtn = showcase.querySelector('.add-cart-btn');
        if(bigCartBtn) {
             bigCartBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); addToCart(prod.id); };
        }
    });
}

function renderProductGrid(containerId, productsToRender) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    // Safety check: if productsToRender is undefined or null, return early
    if (!productsToRender) return;
    
    // Show skeleton loaders initially
    if(productsToRender === 'loading') {
        showSkeletonLoaders(container);
        return;
    }
    
    // Clear container before rendering new products
    container.innerHTML = '';
    
    if(productsToRender.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }
    
    productsToRender.forEach(prod => {
        const isInWishlist = window.wishlistItems && window.wishlistItems.has(prod.id);
        const heartIconName = isInWishlist ? 'heart' : 'heart-outline';
        const heartIconColor = isInWishlist ? 'red' : '';
        
        const item = document.createElement('div');
        item.className = 'showcase';
        item.innerHTML = `
            <div class="showcase-banner">
                <a href="product.html?id=${prod.id}">
                    <img src="${prod.image}" alt="${prod.title}" class="product-img default" width="300" style="object-fit:cover; height: 300px;">
                </a>
                <div class="showcase-actions">
                    <button class="btn-action" onclick="toggleWishlist('${prod.id}', this)"><ion-icon name="${heartIconName}" style="color: ${heartIconColor}"></ion-icon></button>
                    <button class="btn-action" onclick="window.location.href='product.html?id=${prod.id}'"><ion-icon name="eye-outline"></ion-icon></button>
                    <button class="btn-action" onclick="addToCart('${prod.id}')"><ion-icon name="bag-add-outline"></ion-icon></button>
                </div>
            </div>
            <div class="showcase-content">
                <a href="#" class="showcase-category">${prod.category}</a>
                <a href="product.html?id=${prod.id}">
                    <h3 class="showcase-title" style="margin-top: 10px;">${prod.title}</h3>
                </a>
                <div class="price-box" style="margin-top: 10px;">
                    <p class="price">${formatPrice(prod.price)}</p>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function showSkeletonLoaders(container) {
    container.innerHTML = '';
    for(let i = 0; i < 6; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'showcase skeleton-showcase';
        skeleton.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="showcase-content">
                <div class="skeleton-category"></div>
                <div class="skeleton-title"></div>
                <div class="skeleton-price"></div>
            </div>
        `;
        container.appendChild(skeleton);
    }
}

function setupProductRenderers() {
    console.log('🚀 setupProductRenderers called');
    console.log('🌐 Current pathname:', window.location.pathname);
    
    // Exact path detection to avoid overlap
    const isMensPage = window.location.pathname === '/mens.html' || window.location.pathname.endsWith('/mens.html');
    const isWomensPage = window.location.pathname === '/womens.html' || window.location.pathname.endsWith('/womens.html');
    console.log('👔 Page detection - Mens:', isMensPage, 'Womens:', isWomensPage);
    const isJewelryPage = window.location.pathname.includes('jewelry.html');
    const isFavouritesPage = window.location.pathname.includes('favourites.html');
    const isCartPage = window.location.pathname.includes('cart.html');
    const isProductPage = window.location.pathname.includes('product.html');
    const isSearchPage = window.location.pathname.includes('search.html');
    const isProfilePage = window.location.pathname.includes('profile.html');
    const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');

    if(isMensPage) {
        // Men's Page: Strict men's filter - ONLY men's products
        console.log('👔 Loading mens page - strict men filter only');
        loadCategoryProducts(null, null, 'men');
    } else if(isWomensPage) {
        // Women's Page: Strict women's filter - ONLY women's products
        console.log('👗 Loading womens page - strict women filter only');
        loadCategoryProducts(null, null, 'women');
    } else if(isJewelryPage) {
        // Jewelry/Unspecified Page: Only show unspecified category products
        console.log('👔 Loading jewelry page - category=unspecified filter');
        loadCategoryProducts(['d5c63774-8bcf-4cf0-9294-9f5f2775c854'], null, null);
    } else if(isFavouritesPage) {
        renderFavourites();
    } else if(isCartPage) {
        renderCart();
    } else if (isProductPage) {
        renderProductDetail();
    } else if (isSearchPage) {
        const query = new URLSearchParams(window.location.search).get('q');
        if (query) {
            const titleEl = document.getElementById('search-title');
            if(titleEl) titleEl.innerText = 'Search Results for: "' + query + '"';
            const matches = ALL_PRODUCTS.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()));
            renderProductGrid('search-grid', matches);
        } else {
            renderProductGrid('search-grid', []);
        }
    } else if (isProfilePage) {
        renderProfile();
    } else if (isIndexPage) {
        // Show skeleton loaders initially
        const productContainer = document.getElementById('product-container');
        if(productContainer && productContainer.children.length === 0) {
            showSkeletonLoaders(productContainer);
        }
        
        // Rebind static products so prices are updated if currency changes
        document.querySelectorAll('.showcase .price').forEach(el => {
            const titleEl = el.closest('.showcase').querySelector('.showcase-title');
            if(titleEl) {
                const titleText = titleEl.textContent.trim();
                const prod = ALL_PRODUCTS.find(p => p.title === titleText);
                if(prod) {
                    el.textContent = formatPrice(prod.price);
                }
            }
        });
    }
}

// Category ID to name mapping
const CATEGORY_MAP = {
    '8d91d4d1-afd5-486c-814b-298866d19390': 'shoes',
    'd5c63774-8bcf-4cf0-9294-9f5f2775c854': 'unspecified',
    '10351ea8-2815-4a93-8eb4-48a9ecd016a0': 'mens fashion',
    '98bf7a6a-1bdf-4c7e-8dfd-489b0ebbb969': 'winter wear',
    '54dd26ea-31cc-414d-8482-af193deb2992': 'clothes',
    'a16b832b-370b-43b3-9c5c-2084252631ec': 'shorts',
    'a903aa5e-ad07-4a0e-8c63-44223f1103ac': 'jackets'
};

// Load products for category pages from Supabase
async function loadCategoryProducts(categoryIds = null, categoryName = null, gender = null) {
    console.log('🔍 loadCategoryProducts called with:', { categoryIds, categoryName, gender });
    
    // Page detection: Force gender parameter based on current page
    const pathname = window.location.pathname;
    if (pathname.includes('mens.html')) {
        gender = 'men,unisex';  // Force men + unisex for Men's page
        console.log('👔 Detected Men\'s page, forcing gender to:', gender);
    } else if (pathname.includes('womens.html')) {
        gender = 'women';  // Strict women's filter - ONLY women's products
        console.log('👗 Detected Women\'s page, forcing gender to:', gender);
    }
    
    renderProductGrid('category-grid', 'loading');
    
    try {
        // Always use loadProductsFromSupabase for consistency
        console.log('📦 Calling loadProductsFromSupabase with:', { categoryIds, categoryName, gender });
        console.log('🔍 DEBUG: Gender parameter being passed to loadProductsFromSupabase:', gender);
        let products = await loadProductsFromSupabase(categoryIds, categoryName, gender);
        
        // Ensure products is always an array
        if (!products || !Array.isArray(products)) {
            console.warn('⚠️ Products data is not an array, defaulting to empty array');
            products = [];
        }
        
        console.log('📊 Final products count:', products.length);
        if (products.length > 0) {
            console.log('📊 Sample product:', products[0]);
        }
        
        // Transform Supabase products to match expected format
        const transformedProducts = products.map(prod => {
            let resolvedCategoryName = 'Uncategorized';
            
            // Try to resolve category name from ID
            if (prod.category_id && CATEGORY_MAP[prod.category_id]) {
                resolvedCategoryName = CATEGORY_MAP[prod.category_id];
            }
            
            return {
                id: prod.id,
                title: prod.name,
                price: prod.price,
                image: prod.image_url,
                category: resolvedCategoryName
            };
        });
        
        console.log('🎯 Calling renderProductGrid with', transformedProducts.length, 'products');
        renderProductGrid('category-grid', transformedProducts);
    } catch (error) {
        console.error("❌ Failed to load category products:", error);
        renderProductGrid('category-grid', []);
    }
}

// Removed mock handleLogin and handleLogout

async function renderProfile() {
    const container = document.querySelector('main .container');
    if(!container) return;
    if (localStorage.getItem('user_logged_in') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const escapeHtml = (value) => {
        return String(value ?? '').replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    };

    // Fetch user session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Fetch profile
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    const fullName = profile && profile.full_name ? profile.full_name : user.email;

    // Fetch orders
    const { data: orders } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const userOrders = orders || [];
    const totalOrders = userOrders.length;
    const pendingOrders = userOrders.filter(o => o.status !== 'delivered').length;
    const latestOrder = userOrders[0];

    // Simple hash-routing for tabs
    const hash = window.location.hash || '#dashboard';

    // Avatar preview (local-only; persists across tabs via sessionStorage)
    const avatarKey = 'profileAvatarPreview';
    const avatarPreview = sessionStorage.getItem(avatarKey) || '';
    const initials = (fullName || '')
        .split(' ')
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 2)
        .map(s => s.charAt(0).toUpperCase())
        .join('') || 'U';

    const isDashboard = hash === '#dashboard';
    const isOrders = hash === '#orders';
    const isAddresses = hash === '#addresses';
    const isPayments = hash === '#payments';

    // --- Sidebar (Flipkart-ish active link) ---
    const dashboardLinkClass = isDashboard ? 'profile-side-link is-active' : 'profile-side-link';
    const ordersLinkClass = isOrders ? 'profile-side-link is-active' : 'profile-side-link';
    const addressesLinkClass = isAddresses ? 'profile-side-link is-active' : 'profile-side-link';
    const paymentsLinkClass = isPayments ? 'profile-side-link is-active' : 'profile-side-link';

    // --- Header (shows avatar + user identity) ---
    const avatarHtml = avatarPreview
        ? `<img id="profile-avatar-img" class="profile-avatar-img" src="${avatarPreview}" alt="Profile picture">`
        : `<div id="profile-avatar-fallback" class="profile-avatar-fallback">${escapeHtml(initials)}</div>`;

    const headerHtml = `
        <section class="profile-page-header">
            <div class="profile-hero">
                <div class="profile-avatar-wrap">
                    ${avatarHtml}
                    <input
                        type="file"
                        id="avatar-upload-input"
                        accept="image/*"
                        style="display:none;"
                        onchange="window.handleAvatarUpload(event)"
                    />
                    <button type="button" class="profile-photo-btn" onclick="document.getElementById('avatar-upload-input').click()">Change photo</button>
                </div>
                <div class="profile-hero-meta">
                    <h2 class="profile-hero-title">
                        Welcome back, <span id="display-name">${escapeHtml(fullName)}</span>!
                    </h2>
                    <p class="profile-hero-email">${escapeHtml(user.email)}</p>
                    <p class="profile-hero-subtle">${totalOrders} total orders • ${pendingOrders} pending</p>
                </div>
            </div>
        </section>
    `;

    // --- Tab content ---
    let tabContentHtml = '';
    if (isOrders) {
        const ordersHtml = userOrders.length === 0
            ? `<p class="profile-muted">You have no past orders.</p>`
            : userOrders.map(o => {
                const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const statusClass = o.status === 'delivered' ? 'is-delivered' : (o.status === 'paid' ? 'is-paid' : 'is-processing');
                return `
                    <div class="profile-card profile-order-card">
                        <div class="profile-order-top">
                            <strong class="profile-order-id">Order #${escapeHtml(o.id?.substring(0, 8)?.toUpperCase?.() || '')}</strong>
                            <span class="profile-status ${statusClass}">${escapeHtml(o.status)}</span>
                        </div>
                        <p class="profile-muted">Placed on ${escapeHtml(dateStr)}</p>
                        <div class="profile-order-total">Total: ${formatPrice(o.total_amount || 0)}</div>
                    </div>
                `;
            }).join('');

        tabContentHtml = `
            <section class="profile-tab">
                <h3 class="profile-tab-title">Order History</h3>
                ${ordersHtml}
            </section>
        `;
    } else if (isAddresses) {
        let addressHtml = '';
        if (latestOrder && latestOrder.shipping_address) {
            const addr = latestOrder.shipping_address;
            addressHtml = `
                <div class="profile-card profile-address-card">
                    <h4 class="profile-section-title">
                        Latest Shipping Address
                        <span class="profile-badge">Default</span>
                    </h4>
                    <p class="profile-muted profile-address-text">
                        ${escapeHtml(addr.firstName)} ${escapeHtml(addr.lastName)}<br>
                        ${escapeHtml(addr.address)}<br>
                        ${addr.apartment ? `${escapeHtml(addr.apartment)}<br>` : ''}
                        ${escapeHtml(addr.city)}, ${escapeHtml(addr.zip)}
                    </p>
                    <button type="button" class="profile-link-btn">Edit Address</button>
                </div>
            `;
        } else {
            addressHtml = `<p class="profile-muted">No saved addresses found.</p>`;
        }

        tabContentHtml = `
            <section class="profile-tab">
                <h3 class="profile-tab-title">Saved Addresses</h3>
                ${addressHtml}
                <button type="button" class="profile-primary-outline-btn">+ Add New Address</button>
            </section>
        `;
    } else if (isPayments) {
        tabContentHtml = `
            <section class="profile-tab">
                <h3 class="profile-tab-title">Payment Methods</h3>
                <div class="profile-card profile-payment-card">
                    <h4 class="profile-section-title">Payment Method</h4>
                    <p class="profile-muted">Payments are processed via secure checkout.</p>
                </div>
            </section>
        `;
    } else {
        // Default Dashboard
        const recentActivityHtml = latestOrder
            ? `<p class="profile-muted profile-recent-activity">Your recent order #${escapeHtml(latestOrder.id?.substring(0, 8)?.toUpperCase?.() || '')} is currently marked as ${escapeHtml(latestOrder.status)}.</p>`
            : `<p class="profile-muted profile-recent-activity">No recent activity.</p>`;

        tabContentHtml = `
            <section class="profile-tab">
                <div class="profile-edit-row">
                    <input
                        type="text"
                        id="edit-name-input"
                        class="profile-edit-input"
                        placeholder="Update your name"
                    />
                    <button type="button" onclick="updateProfileName()" class="profile-primary-btn">Save Name</button>
                </div>

                <div class="profile-stat-row">
                    <div class="profile-stat-card">
                        <h4 class="profile-stat-title">Total Orders</h4>
                        <p class="profile-stat-value">${totalOrders}</p>
                    </div>
                    <div class="profile-stat-card">
                        <h4 class="profile-stat-title">Pending Delivery</h4>
                        <p class="profile-stat-value">${pendingOrders}</p>
                    </div>
                </div>

                <h3 class="profile-tab-title">Recent Activity</h3>
                ${recentActivityHtml}
            </section>
        `;
    }

    container.innerHTML = `
        <div class="profile-shell">
            <aside class="profile-sidebar">
                <h3 class="profile-sidebar-title">My Account</h3>
                <nav class="profile-sidebar-nav">
                    <a href="#dashboard" onclick="setTimeout(renderProfile, 10)" class="${dashboardLinkClass}">Dashboard</a>
                    <a href="#orders" onclick="setTimeout(renderProfile, 10)" class="${ordersLinkClass}">Order History</a>
                    <a href="#addresses" onclick="setTimeout(renderProfile, 10)" class="${addressesLinkClass}">Addresses</a>
                    <a href="#payments" onclick="setTimeout(renderProfile, 10)" class="${paymentsLinkClass}">Payment Methods</a>
                </nav>
                <button onclick="handleLogout()" type="button" class="profile-logout-btn">Logout</button>
            </aside>
            <section class="profile-main">
                ${headerHtml}
                ${tabContentHtml}
            </section>
        </div>
    `;
}

// Avatar upload: local-only preview via sessionStorage
window.handleAvatarUpload = function(event) {
    const input = event.target;
    const file = input && input.files && input.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const dataUrl = String(reader.result || '');
        sessionStorage.setItem('profileAvatarPreview', dataUrl);

        let avatarImg = document.getElementById('profile-avatar-img');
        const avatarFallback = document.getElementById('profile-avatar-fallback');
        if(!avatarImg) {
            // Initial UI may render only the fallback. Create the image dynamically.
            avatarImg = document.createElement('img');
            avatarImg.id = 'profile-avatar-img';
            avatarImg.className = 'profile-avatar-img';
            avatarImg.alt = 'Profile picture';
            avatarImg.src = dataUrl;

            const wrap = document.querySelector('.profile-avatar-wrap');
            if(wrap) {
                wrap.insertBefore(avatarImg, wrap.firstChild);
            }
        } else {
            avatarImg.src = dataUrl;
        }

        if(avatarFallback) avatarFallback.style.display = 'none';
    };
    reader.readAsDataURL(file);
};

async function renderFavourites() {
    const container = document.getElementById('favourites-items');
    if(!container) return;
    
    if (typeof supabaseClient === 'undefined') {
        const favIds = getFavourites();
        const favProducts = ALL_PRODUCTS.filter(p => favIds.includes(p.id));
        renderProductGrid('favourites-items', favProducts);
        return;
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
        container.innerHTML = '<p>Please log in to view your wishlist.</p>';
        return;
    }

    const { data: wishlistData, error } = await supabaseClient
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', user.id);

    if (error) {
        console.error("Error fetching wishlist:", error.message);
        container.innerHTML = '<p>Error loading wishlist items.</p>';
        return;
    }
    
    if(!wishlistData || wishlistData.length === 0) {
        container.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }
    
    const favIds = [];
    const favProducts = wishlistData.map(item => {
        const p = item.products;
        if (!p) return null;
        favIds.push(item.product_id);
        return {
            id: p.id,
            title: p.name || p.title,
            image: p.image_url || p.image,
            price: p.price,
            category: p.category || 'Product'
        };
    }).filter(Boolean);
    
    // Update global state
    window.wishlistItems = new Set(favIds);
    
    renderProductGrid('favourites-items', favProducts);
}

async function renderCart() {
    const container = document.getElementById('cart-items');
    const totalContainer = document.getElementById('cart-total');
    if(!container) return;
    
    if (typeof supabaseClient === 'undefined') {
        container.innerHTML = '<p>Database not connected.</p>';
        return;
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
        container.innerHTML = '<p>Please log in to view your cart.</p>';
        if (totalContainer) totalContainer.innerHTML = '';
        return;
    }

    const { data: cartItems, error: fetchError } = await supabaseClient
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', user.id);

    if (fetchError) {
        console.error("Error fetching cart:", fetchError.message);
        container.innerHTML = '<p>Error loading cart items.</p>';
        return;
    }
    
    let totalUsd = 0;
    container.innerHTML = '';
    
    if(!cartItems || cartItems.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        if (totalContainer) totalContainer.innerHTML = '';
        return;
    }
    
    cartItems.forEach(item => {
        const prod = item.products;
        if(!prod) return;
        totalUsd += (prod.price * item.quantity);
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';
        row.style.padding = '15px';
        row.style.marginBottom = '15px';
        row.style.border = '1px solid #eee';
        row.style.borderRadius = '10px';
        row.className = 'cart-row'; 
        
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap: 20px;">
                <img src="${prod.image_url}" width="80" style="object-fit:cover; border-radius: 10px;">
                <div>
                    <h4 style="font-size: 18px; margin-bottom: 5px;">${prod.name}</h4>
                    <p style="color: #666;">${formatPrice(prod.price)}</p>
                    <div style="margin-top: 10px; font-weight: bold;">Qty: ${item.quantity}</div>
                </div>
            </div>
            <button style="padding: 10px 20px; background: #ff6347; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;" onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        container.appendChild(row);
    });
    
    if (totalContainer) {
        totalContainer.innerHTML = 'Total: ' + formatPrice(totalUsd) + '<br><button style="margin-top:20px; padding: 15px 30px; font-size: 18px; background:#ff8f9c; color:#fff; border:none; border-radius:5px; cursor:pointer;" onclick="window.location.href=\'checkout.html\'">Checkout</button>';
    }
}

window.updateProfileName = async function() {
    const newName = document.getElementById('edit-name-input').value;
    if(!newName) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if(user) {
        const { error } = await supabaseClient.from('profiles').upsert({ id: user.id, full_name: newName });
        if(error) {
            alert('Failed to update name: ' + error.message);
        } else {
            alert('Name updated successfully!');
            document.getElementById('display-name').textContent = newName;
            document.getElementById('edit-name-input').value = '';
        }
    }
};

