document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.supabaseClient === 'undefined') {
        const interval = setInterval(() => {
            if (typeof window.supabaseClient !== 'undefined') {
                clearInterval(interval);
                initCheckout();
            }
        }, 100);
    } else {
        initCheckout();
    }
});

let cartItemsCache = [];
let totalAmount = 0;
let isSingleProductCheckout = false;

async function initCheckout() {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
        alert("Please log in to checkout.");
        window.location.href = "login.html";
        return;
    }

    await loadCheckoutCart(user.id);

    // Add input formatting for card number
    const cardInput = document.getElementById('card');
    if (cardInput) {
        cardInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Add input formatting for expiry date
    const expInput = document.getElementById('exp');
    if (expInput) {
        expInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    // Add input formatting for CVC
    const cvcInput = document.getElementById('cvc');
    if (cvcInput) {
        cvcInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await processPayment(user.id);
        });
    }
}

function formatPriceCheckout(priceUsd) {
    return typeof formatPrice !== 'undefined' ? formatPrice(priceUsd) : `$${priceUsd.toFixed(2)}`;
}

// Update checkout prices when currency changes
window.updateCheckoutPrices = function() {
    if (cartItemsCache.length === 0) return;
    
    let newTotal = 0;
    let html = '';
    
    cartItemsCache.forEach(item => {
        const prod = item.products;
        if (!prod) return;
        
        newTotal += (prod.price * item.quantity);
        
        html += `
            <div class="order-summary-item">
                <img src="${prod.image_url}" alt="${prod.name}" class="order-summary-img">
                <div class="order-summary-info">
                    <h4 class="order-summary-title">${prod.name}</h4>
                    <p class="order-summary-price">Qty: ${item.quantity}</p>
                </div>
                <div class="order-summary-price" style="font-weight: 500;">
                    ${formatPriceCheckout(prod.price * item.quantity)}
                </div>
            </div>
        `;
    });
    
    const container = document.getElementById('checkout-items');
    if (container) {
        container.innerHTML = html;
    }
    
    totalAmount = newTotal;
    const formattedTotal = formatPriceCheckout(totalAmount);
    document.getElementById('summary-subtotal').innerText = formattedTotal;
    document.getElementById('summary-total').innerText = formattedTotal;
    document.getElementById('pay-btn').innerText = `PAY ${formattedTotal}`;
};

async function loadCheckoutCart(userId) {
    const container = document.getElementById('checkout-items');
    
    const params = new URLSearchParams(window.location.search);
    const directProductId = params.get('productId');
    const directQty = params.get('qty') ? parseInt(params.get('qty'), 10) : 1;

    cartItemsCache = [];
    totalAmount = 0;

    if (directProductId) {
        isSingleProductCheckout = true;
        const { data: prod, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', directProductId)
            .single();
            
        if (error || !prod) {
            console.error("Error loading direct product:", error?.message);
            if (container) container.innerHTML = '<p>Error loading product.</p>';
            return;
        }
        
        cartItemsCache = [{
            product_id: prod.id,
            quantity: directQty,
            products: prod
        }];
        
    } else {
        isSingleProductCheckout = false;
        const { data: cartItems, error } = await supabaseClient
            .from('cart_items')
            .select('*, products(*)')
            .eq('user_id', userId);

        if (error) {
            console.error("Error loading cart for checkout:", error.message);
            if (container) container.innerHTML = '<p>Error loading items.</p>';
            return;
        }
        
        cartItemsCache = cartItems || [];
    }

    if (!cartItemsCache || cartItemsCache.length === 0) {
        if (container) container.innerHTML = '<p>Your cart is empty.</p>';
        document.getElementById('pay-btn').disabled = true;
        return;
    }

    let html = '';
    cartItemsCache.forEach(item => {
        const prod = item.products;
        if (!prod) return;
        
        totalAmount += (prod.price * item.quantity);
        
        html += `
            <div class="order-summary-item">
                <img src="${prod.image_url}" alt="${prod.name}" class="order-summary-img">
                <div class="order-summary-info">
                    <h4 class="order-summary-title">${prod.name}</h4>
                    <p class="order-summary-price">Qty: ${item.quantity}</p>
                </div>
                <div class="order-summary-price" style="font-weight: 500;">
                    ${formatPriceCheckout(prod.price * item.quantity)}
                </div>
            </div>
        `;
    });

    if (container) {
        container.innerHTML = html;
    }

    const formattedTotal = formatPriceCheckout(totalAmount);
    document.getElementById('summary-subtotal').innerText = formattedTotal;
    document.getElementById('summary-total').innerText = formattedTotal;
    document.getElementById('pay-btn').innerText = `PAY ${formattedTotal}`;
}

async function processPayment(userId) {
    if (cartItemsCache.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Enhanced form validation
    const form = document.getElementById('checkout-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Validate required fields
    const requiredFields = ['fname', 'lname', 'address', 'city', 'zip', 'email', 'card', 'exp', 'cvc', 'cardname'];
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            alert(`Please fill in all required fields.`);
            field?.focus();
            return;
        }
    }

    // Validate email format
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        document.getElementById('email').focus();
        return;
    }

    // Validate card format (basic validation)
    const cardNumber = document.getElementById('card').value.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
        alert('Please enter a valid card number.');
        document.getElementById('card').focus();
        return;
    }

    const btn = document.getElementById('pay-btn');
    btn.disabled = true;
    btn.innerText = "Processing...";

    try {
        // Collect form data
        const shippingAddress = {
            firstName: document.getElementById('fname').value.trim(),
            lastName: document.getElementById('lname').value.trim(),
            address: document.getElementById('address').value.trim(),
            apartment: document.getElementById('apartment').value.trim(),
            city: document.getElementById('city').value.trim(),
            zip: document.getElementById('zip').value.trim(),
            email: email
        };

        // 1. Create order
        const { data: orderData, error: orderError } = await supabaseClient
            .from('orders')
            .insert([{
                user_id: userId,
                total_amount: totalAmount,
                shipping_address: shippingAddress,
                status: 'paid'
            }])
            .select()
            .single();

        if (orderError) throw orderError;
        
        const orderId = orderData.id;

        // 2. Prepare order items
        const orderItems = cartItemsCache.map(item => ({
            order_id: orderId,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.products.price
        }));

        // 3. Insert order items
        const { error: itemsError } = await supabaseClient
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 4. Delete cart items (only if it's a full cart checkout)
        if (!isSingleProductCheckout) {
            const { error: deleteError } = await supabaseClient
                .from('cart_items')
                .delete()
                .eq('user_id', userId);

            if (deleteError) {
                console.warn("Failed to clear cart, but order was placed:", deleteError.message);
            }

            // Update local cart badge count if available
            if (typeof updateBadges === 'function') {
                localStorage.setItem('cart', '[]');
                updateBadges();
            }
        }

        // Redirect to success page
        window.location.href = `success.html?order_id=${orderId}`;

    } catch (err) {
        console.error("Checkout failed:", err);
        alert("There was an error processing your payment: " + err.message);
        btn.disabled = false;
        btn.innerText = `PAY ${formatPriceCheckout(totalAmount)}`;
    }
}
