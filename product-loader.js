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
    .select('*')
    .eq('id', id)
    .single();

  if (error || !prod) {
    console.log(error);
    const container = document.getElementById("product-detail");
    if(container) container.innerHTML = '<h2>Product not found</h2>';
    return;
  }

  if (typeof fetchUserWishlist === 'function') {
      await fetchUserWishlist();
  }

  const container = document.getElementById("product-detail");

  if (!container) return;

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
      <div style="display: flex; flex-wrap: wrap; gap: 30px; align-items: flex-start; padding: 20px;">
          <div style="flex: 1; min-width: 300px; max-width: 400px; position: sticky; top: 20px;">
              <img src="${prod.image_url}" width="100%" style="border-radius: 10px; border: 1px solid #e0e0e0; cursor: zoom-in;">
          </div>
          
          <div style="flex: 2; min-width: 300px;">
              <p style="color: #666; font-size: 14px; margin-bottom: 5px; text-transform: uppercase;">${prod.category}</p>
              <h1 style="font-size: 24px; line-height: 1.3; margin-bottom: 5px;">${prod.name}</h1>
              <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 15px; color: #ff9900; font-size: 18px;">
                  <ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star-half"></ion-icon>
                  <span style="color: #007185; font-size: 14px; margin-left: 5px; cursor: pointer;">1,248 ratings</span>
              </div>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin-bottom: 15px;">
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Premium quality. Crafted for maximum comfort and style. Ideal for daily usage or special occasions.
              </p>
              
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
                  ₹${prod.price}
              </div>
              <p style="font-size: 14px; margin-bottom: 15px;">
                  FREE delivery <strong>${new Date(new Date().setDate(new Date().getDate() + 4)).toLocaleDateString('en-US', {weekday: 'long', month: 'long', day:'numeric'})}</strong>. <a href="#" style="color: #007185; text-decoration: none;">Details</a>
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