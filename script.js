// 'use strict';

// // ================= SUPABASE =================
// const supabaseUrl = "https://assnbawupffhevwpbguo.supabase.co";
// const supabaseKey = "sb_publishable_6KKo1eo6fU4rHR8zaXSbnA_15zbmail";

// const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
//   auth: {
//     persistSession: true,
//     autoRefreshToken: true,
//     detectSessionInUrl: true
//   }
// });


// // ================= PAGE LOAD =================
// document.addEventListener("DOMContentLoaded", () => {

//   // Load products only if container exists
//   if (document.getElementById("product-container")) {
//     loadProducts();
//   }

//   // Load user only on profile page
//   if (window.location.pathname.includes("profile.html")) {
//     loadUser();
//   }

// });


// // ================= LOAD PRODUCTS =================
// async function loadProducts(category) {

//   const container = document.getElementById("product-container");
//   if (!container) return;

//   let query = supabaseClient.from('products').select('*');

//   if (category) {
//     query = query.eq('category', category);
//   }

//   const { data, error } = await query;

//   console.log("DATA:", data);
//   console.log("ERROR:", error);

//   container.innerHTML = "";

//   if (!data || data.length === 0) {
//     container.innerHTML = "<p>No products found</p>";
//     return;
//   }

//   data.forEach(p => {
//     container.innerHTML += `
//       <div class="showcase">
//         <div class="showcase-banner">
//           <img src="${p.image_url}" class="product-img default" width="300">
//         </div>

//         <div class="showcase-content">
//           <h3 class="showcase-title">${p.name}</h3>
//           <div class="price-box">
//             <p class="price">${typeof formatPrice !== 'undefined' ? formatPrice(p.price) : '$' + p.price}</p>
//           </div>
//         </div>
//       </div>
//     `;
//   });
// }


// // ================= SIGNUP =================
// async function handleSignup() {

//   const email = document.getElementById("login-email").value;
//   const password = document.getElementById("login-password").value;

//   const { error } = await supabaseClient.auth.signUp({
//     email,
//     password
//   });

//   if (error) {
//     alert(error.message);
//   } else {
//     alert("Signup successful! Check your email.");
//   }
// }


// // ================= LOGIN =================
// async function handleLogin() {

//   const email = document.getElementById("login-email").value;
//   const password = document.getElementById("login-password").value;

//   const { data, error } = await supabaseClient.auth.signInWithPassword({
//     email,
//     password
//   });

//   if (error) {
//     alert(error.message);
//     return;
//   }

//   console.log("LOGIN SUCCESS:", data);

//   // ✅ redirect (session auto saved by Supabase)
//   window.location.href = "profile.html";
// }


// // ================= LOAD USER =================
// async function loadUser() {

//   const { data } = await supabaseClient.auth.getSession();

//   console.log("SESSION:", data.session);

//   if (!data.session) {
//     window.location.href = "login.html";
//     return;
//   }

//   const user = data.session.user;

//   console.log("USER:", user);

//   const nameEl = document.getElementById("user-name");
//   const emailEl = document.getElementById("user-email");

//   if (nameEl) nameEl.innerText = user.email;
//   if (emailEl) emailEl.innerText = user.email;
// }


// // ================= LOGOUT =================
// async function logout() {
//   await supabaseClient.auth.signOut();
//   window.location.href = "login.html";
// }

'use strict';

// ================= SUPABASE =================
window.supabaseUrl = "https://assnbawupffhevwpbguo.supabase.co";
window.supabaseKey = "sb_publishable_6KKo1eo6fU4rHR8zaXSbnA_15zbmail";

if (typeof supabase !== 'undefined') {
  window.supabaseClient = supabase.createClient(window.supabaseUrl, window.supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} else {
  console.error("Supabase is not defined. Ensure the Supabase CDN script is loaded before script.js.");
}

// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {

  // Load products only if container exists
  if (document.getElementById("product-container")) {
    loadProducts();
  }

  // Load user only on profile page
  if (window.location.pathname.includes("profile.html")) {
    loadUser();
  }

});


// ================= LOAD PRODUCTS =================
async function loadProducts(fallbackCategory) {

  const container = document.getElementById("product-container");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const categoryParam = urlParams.get('category') || fallbackCategory;

  let query = supabaseClient.from('products').select('*');
  let headingText = "New Products";

  if (categoryParam) {
    headingText = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) + " Collection";
    // 1. Fetch category UUID from categories table
    const { data: categoryData } = await supabaseClient
      .from('categories')
      .select('id')
      .ilike('name', categoryParam)
      .maybeSingle();

    if (categoryData && categoryData.id) {
      query = query.eq('category_id', categoryData.id);
    }
    // If not found, do nothing, allowing it to default to all products
  }

  if (searchParam) {
    headingText = `Search Results for "${searchParam}"`;
    query = query.ilike('name', `%${searchParam}%`);
  }

  const headingEl = document.getElementById("main-product-heading");
  if (headingEl) {
    headingEl.textContent = headingText;
  }

  if (typeof fetchUserWishlist === 'function') {
      await fetchUserWishlist();
  }

  const { data, error } = await query;

  console.log("DATA:", data);
  console.log("ERROR:", error);

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<p style='text-align:center; font-size: 18px; color:#666; margin-top: 20px;'>No products found matching your criteria.</p>";
    return;
  }

  data.forEach(p => {

    const isInWishlist = window.wishlistItems && window.wishlistItems.has(p.id);
    const heartIcon = isInWishlist ? 'heart' : 'heart-outline';
    const heartColor = isInWishlist ? 'color: red;' : '';

    container.innerHTML += `
      <div style="position: relative;">
        <a href="product.html?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
          <div class="showcase">
            <div class="showcase-banner">
              <img src="${p.image_url}" class="product-img default" width="300">
            </div>

            <div class="showcase-content">
              <h3 class="showcase-title">${p.name}</h3>
              <div class="price-box">
                <p class="price">${typeof formatPrice !== 'undefined' ? formatPrice(p.price) : '$' + p.price}</p>
              </div>
            </div>
          </div>
        </a>
        <button class="btn-action" 
                onclick="event.preventDefault(); toggleWishlist('${p.id}', this)" 
                style="position: absolute; top: 15px; right: 15px; background: white; border-radius: 50%; padding: 8px; z-index: 10; border: none; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
          <ion-icon name="${heartIcon}" style="font-size: 18px; ${heartColor} transition: 0.2s;"></ion-icon>
        </button>
      </div>
    `;
  });
}


let isSignupMode = false;

window.toggleAuthMode = function() {
  isSignupMode = !isSignupMode;
  const nameInput = document.getElementById("login-name");
  const title = document.getElementById("auth-title");
  const btn = document.getElementById("auth-btn");
  const switchText = document.getElementById("auth-switch-text");
  const switchLink = document.getElementById("auth-switch-link");
  
  if(isSignupMode) {
    nameInput.style.display = "block";
    title.innerText = "Create an Account";
    btn.innerText = "Sign Up";
    switchText.innerText = "Already have an account?";
    switchLink.innerText = "Sign In";
  } else {
    nameInput.style.display = "none";
    title.innerText = "Login to TrendWave";
    btn.innerText = "Sign In";
    switchText.innerText = "Don't have an account?";
    switchLink.innerText = "Sign Up";
  }
}

window.handleAuthAction = async function() {
  if(isSignupMode) {
    await window.handleSignup();
  } else {
    await window.handleLogin();
  }
}

// ================= SIGNUP =================
window.handleSignup = async function() {
  const fullName = document.getElementById("login-name").value;
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if(!fullName || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
  } else {
    if (data.user) {
      await supabaseClient.from('profiles').insert([{ id: data.user.id, full_name: fullName }]);
    }
    alert("Signup successful! Please sign in.");
    toggleAuthMode();
  }
}


// ================= LOGIN =================
window.handleLogin = async function() {

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  console.log("LOGIN SUCCESS:", data);
  localStorage.setItem('user_logged_in', 'true');

  // Redirect to profile
  window.location.href = "profile.html";
}


// ================= LOAD USER =================
async function loadUser() {

  const { data } = await supabaseClient.auth.getSession();

  console.log("SESSION:", data.session);

  if (!data.session) {
    window.location.href = "login.html";
    return;
  }

  const user = data.session.user;

  console.log("USER:", user);

  const nameEl = document.getElementById("user-name");
  const emailEl = document.getElementById("user-email");

  if (nameEl) nameEl.innerText = user.email;
  if (emailEl) emailEl.innerText = user.email;
}


// ================= LOGOUT =================
window.handleLogout = async function() {
  await supabaseClient.auth.signOut();
  localStorage.removeItem('user_logged_in');
  window.location.href = "login.html";
}