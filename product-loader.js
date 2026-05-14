window._productLoaderOwned = true; // declare ownership
// Get ID from URL
function getId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadProduct() {

    const id = getId();

    if (!id) {
        console.log("No ID");
        return;
    }

    const { data: prod, error } = await window.supabaseClient
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .single();

    if (error || !prod) {
        console.log(error);
        const container = document.getElementById("product-detail");
        if (container) container.innerHTML = '<h2>Product not found</h2>';
        return;
    }

    // Store current product globally for currency updates
    window.currentProduct = prod;

    if (typeof fetchUserWishlist === 'function') {
        await fetchUserWishlist();
    }

    // We will inject a container for the price history, and let renderPriceChart fill it.
    const priceHistoryHtml = `
      <div id="price-tracking-container">
          <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-top: 20px; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #333;">
                  <ion-icon name="trending-up-outline" style="font-size: 20px;"></ion-icon>
                  <h3 style="font-size: 16px; margin: 0; font-weight: bold;">Price Tracking</h3>
              </div>
              <canvas id="priceChart" width="400" height="200"></canvas>
          </div>
      </div>
  `;

    const container = document.getElementById("product-detail");

    if (!container) return;

    // Create breadcrumbs
    const categoryName = prod.categories?.name || 'Uncategorized';
    const gender = prod.gender || 'unisex';
    const genderDisplay = gender.charAt(0).toUpperCase() + gender.slice(1);

    // Create gender badge if product is unisex
    const genderBadge = gender === 'unisex' ?
        `<span style="display: inline-block; background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 10px; text-transform: uppercase;">UNISEX</span>` : '';

    const breadcrumbsHtml = `
    <nav style="margin-bottom: 20px; padding: 10px 0; font-size: 14px; color: #666;">
      <a href="index.html" style="color: #007185; text-decoration: none;">Home</a>
      <span style="margin: 0 8px;">></span>
      <a href="index.html?category=${encodeURIComponent(categoryName)}" style="color: #007185; text-decoration: none;">${categoryName}</a>
      <span style="margin: 0 8px;">></span>
      <a href="index.html?gender=${encodeURIComponent(gender)}" style="color: #007185; text-decoration: none;">${genderDisplay}</a>
      <span style="margin: 0 8px;">></span>
      <span style="color: #333;">${prod.name}</span>
    </nav>
  `;

    const qtyOptions = `
      <option value="1">Quantity: 1</option>
      <option value="2">Quantity: 2</option>
      <option value="3">Quantity: 3</option>
  `;

    const isInWishlist = window.wishlistItems && window.wishlistItems.has(prod.id);
    const heartIcon = isInWishlist ? 'heart' : 'heart-outline';
    const heartColor = isInWishlist ? 'color: red;' : '';

    // ⚠️ IMPORTANT: MATCH YOUR EXISTING UI STRUCTURE
    container.innerHTML = `
      ${breadcrumbsHtml}
      <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: flex-start; padding: 20px;">
          <div style="flex: 1; min-width: 300px; max-width: 400px; position: sticky; top: 20px;">
              <img src="${prod.image_url}" width="100%" style="border-radius: 10px; border: 1px solid #e0e0e0; cursor: zoom-in;">
          </div>
          
          <div style="flex: 2; min-width: 300px;">
              <p style="color: #666; font-size: 14px; margin-bottom: 5px; text-transform: uppercase;">${categoryName}</p>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                  <h1 style="font-size: 24px; line-height: 1.3; margin: 0;">${prod.name}</h1>
                  ${genderBadge}
              </div>
              <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 15px; color: #ff9900; font-size: 18px;">
                  <ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star-half"></ion-icon>
                  <span style="color: #007185; font-size: 14px; margin-left: 5px; cursor: pointer;">1,248 ratings</span>
              </div>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin-bottom: 15px;">
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Premium quality. Crafted for maximum comfort and style. Ideal for daily usage or special occasions.
              </p>
              
              ${priceHistoryHtml}
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <h2 style="font-size: 20px; margin-bottom: 15px;">Customer Reviews</h2>
              <div style="margin-bottom: 20px;">
                  <h4 style="margin-bottom: 10px;">Write a review</h4>
                  <div style="display: flex; gap: 10px; font-size: 24px; color: #ccc; margin-bottom: 10px; cursor: pointer;" id="star-rating-container">
                      <ion-icon name="star-outline" onclick="Array.from(this.parentElement.children).forEach((el,i)=>el.name=(i<=0)?'star':'star-outline'); this.parentElement.style.color='#ff9900'"></ion-icon>
                      <ion-icon name="star-outline" onclick="Array.from(this.parentElement.children).forEach((el,i)=>el.name=(i<=1)?'star':'star-outline'); this.parentElement.style.color='#ff9900'"></ion-icon>
                      <ion-icon name="star-outline" onclick="Array.from(this.parentElement.children).forEach((el,i)=>el.name=(i<=2)?'star':'star-outline'); this.parentElement.style.color='#ff9900'"></ion-icon>
                      <ion-icon name="star-outline" onclick="Array.from(this.parentElement.children).forEach((el,i)=>el.name=(i<=3)?'star':'star-outline'); this.parentElement.style.color='#ff9900'"></ion-icon>
                      <ion-icon name="star-outline" onclick="Array.from(this.parentElement.children).forEach((el,i)=>el.name=(i<=4)?'star':'star-outline'); this.parentElement.style.color='#ff9900'"></ion-icon>
                  </div>
                  <textarea placeholder="Write your review here..." style="width: 100%; max-width: 500px; height: 80px; padding: 10px; border-radius: 5px; border: 1px solid #ccc; margin-bottom: 10px; font-family: inherit; font-size: 14px; background: transparent; color: inherit;"></textarea>
                  <br>
                  <button onclick="alert('Review submitted!')" style="background: #f7ca00; color: #111; border: 1px solid #f2c200; padding: 8px 15px; border-radius: 8px; cursor: pointer;">Submit Review</button>
              </div>
              
              <div style="border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 15px;">
                  <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                      <div style="width: 30px; height: 30px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #555; font-size: 12px;">JD</div>
                      <span style="font-weight: bold; font-size: 14px;">Jane Doe</span>
                  </div>
                  <div style="color: #ff9900; font-size: 14px; margin-bottom: 5px; display: flex; align-items: center;"><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon> <span style="font-weight: bold; margin-left: 5px;">Excellent product!</span></div>
                  <p style="font-size: 12px; color: #565959;">Reviewed on ${new Date().toLocaleDateString()}</p>
                  <p style="font-size: 14px; margin-top: 10px;">This exceeded my expectations. Delivery was fast and the quality is amazing for the price.</p>
              </div>
          </div>
          
          <div style="flex: 1; min-width: 250px; max-width: 300px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); align-self: flex-start; background: var(--bg, #fff);" class="buy-box">
              <div style="font-size: 28px; font-weight: normal; margin-bottom: 10px; display: flex; align-items: flex-start;" class="price-big">
                  ${typeof formatPrice !== 'undefined' ? formatPrice(prod.price) : '$' + prod.price}
              </div>
              <p style="font-size: 14px; margin-bottom: 15px;">
                  FREE delivery <strong>${new Date(new Date().setDate(new Date().getDate() + 4)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>. <a href="#" style="color: #007185; text-decoration: none;">Details</a>
              </p>
              
              <div style="font-size: 14px; margin-bottom: 15px; cursor: pointer;" onclick="const loc = prompt('Enter zip code or type \\'current\\' to use Current Location:', 'Current Location'); if(loc) document.getElementById('del-loc-text').innerText = loc;">
                  <ion-icon name="location-outline" style="vertical-align: middle; font-size: 16px;"></ion-icon>
                  <a href="#" style="color: #007185; text-decoration: none;" id="del-loc">Delivering to <span id="del-loc-text">Mangaluru 575013</span> - Update location</a>
              </div>
              
              <h3 style="color: #007600; font-size: 18px; font-weight: normal; margin-bottom: 15px;">In stock</h3>
              
              <div style="font-size: 12px; color: #565959; margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>Ships from</span> <span style="color: inherit;">TrendWave</span></div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>Sold by</span> <span style="color: #007185; cursor: pointer;">Spooky®</span></div>
                  <div style="display: flex; justify-content: space-between;"><span>Payment</span> <span style="color: #007185; cursor: pointer;">Secure transaction</span></div>
              </div>
              
              <div style="margin-bottom: 15px;">
                  <select id="buy-qty" style="padding: 5px 10px; width: auto; border: 1px solid #d5d9d9; border-radius: 8px; background: transparent; color: inherit; cursor: pointer; outline: none;">
                      ${qtyOptions}
                  </select>
              </div>
              
              <button onclick="addToCart('${prod.id}')" style="width: 100%; background: #ffd814; color: #0f1111; border: none; padding: 12px; border-radius: 20px; font-size: 14px; cursor: pointer; margin-bottom: 10px;">Add to cart</button>
              <button onclick="const q=document.getElementById('buy-qty').value; window.location.href='checkout.html?productId=${prod.id}&qty='+q;" style="width: 100%; background: #ffa41c; color: #0f1111; border: none; padding: 12px; border-radius: 20px; font-size: 14px; cursor: pointer; margin-bottom: 15px;">Buy Now</button>
              
              <div style="border-top: 1px solid #d5d9d9; margin: 15px 0;"></div>
              <button onclick="toggleWishlist('${prod.id}', this)" style="width: 100%; background: transparent; color: inherit; border: 1px solid #d5d9d9; padding: 8px; border-radius: 8px; font-size: 13px; cursor: pointer; text-align: left; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <ion-icon name="${heartIcon}" style="${heartColor} font-size: 16px; transition: 0.2s;"></ion-icon>
                  <span>Wishlist</span>
              </button>
          </div>
      </div>
  `;

    renderPriceChart(prod.id);
}

async function renderPriceChart(productId) {
    // BUG FIX 1: fetch ascending directly — no .reverse() needed
    const { data, error } = await window.supabaseClient
        .from('price_history')
        .select('*')
        .eq('product_id', productId)
        .order('changed_at', { ascending: true }); // was: ascending: false

    if (error) console.error('Price history error:', error);

    const container = document.getElementById('price-tracking-container');

    if (!data || data.length === 0) {
        if (container) {
            container.innerHTML = `
        <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-top: 20px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 10px;">
          <ion-icon name="time-outline" style="font-size: 20px; color: #666; margin-top: 2px;"></ion-icon>
          <div>
            <h3 style="font-size: 16px; margin: 0 0 5px 0; color: #333; font-weight: bold;">Price Tracking</h3>
            <div style="font-size: 14px; color: #666;">This product is currently at its best historical price.</div>
          </div>
        </div>
      `;
        }
        return;
    }

    // BUG FIX 2: parse all prices to Number() to unify bigint vs numeric types
    const labels = [];
    const prices = [];

    // Synthetic "before first change" point
    const earliest = data[0];
    const earliestDate = new Date(earliest.changed_at);
    earliestDate.setDate(earliestDate.getDate() - 1);
    labels.push(earliestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    prices.push(Number(earliest.old_price)); // explicit cast

    data.forEach(record => {
        labels.push(new Date(record.changed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        prices.push(Number(record.new_price)); // explicit cast
    });

    // "Today" point — use current product price
    const currentPrice = Number(
        window.currentProduct ? window.currentProduct.price : prices[prices.length - 1]
    );
    labels.push('Today');
    prices.push(currentPrice);

    // BUG FIX 3: use requestAnimationFrame instead of setTimeout(fn, 50)
    // This guarantees the canvas has a real layout box before Chart.js measures it
    requestAnimationFrame(() => {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        // BUG FIX 4: guard both the canvas element AND its context
        const canvas = document.getElementById('priceChart');
        if (!canvas) {
            console.error('priceChart canvas not found in DOM');
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context from canvas');
            return;
        }

        // BUG FIX 5: destroy any existing Chart instance to avoid
        // "Canvas is already in use" error on re-renders (e.g. currency switch)
        if (canvas._chartInstance) {
            canvas._chartInstance.destroy();
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: prices,
                    borderColor: '#007185',
                    backgroundColor: 'rgba(0, 113, 133, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2,
                    pointBackgroundColor: '#007185',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const val = context.raw;
                                return typeof formatPrice !== 'undefined' ? formatPrice(val) : '$' + val;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function (value) {
                                return typeof formatPrice !== 'undefined' ? formatPrice(value) : '$' + value;
                            }
                        }
                    }
                }
            }
        });

        // Store instance reference for future destroy calls
        canvas._chartInstance = chart;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.supabaseClient === 'undefined') {
        const interval = setInterval(() => {
            if (typeof window.supabaseClient !== 'undefined') {
                clearInterval(interval);
                loadProduct();
            }
        }, 100);
    } else {
        loadProduct();
    }
});