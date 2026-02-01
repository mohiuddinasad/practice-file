let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Toggle Sidebar
function toggleCart() {
    document.getElementById("cart-sidebar").classList.toggle("active");
    renderCartSidebar();
}


// Add to Cart
function addToCart(id, name, price) {
    let product = cart.find(item => item.id === id);
    if (product) {
        if (product.quantity < 5) {
            product.quantity++;
        }
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart();
    renderCartSidebar();
    updateCartCount();
}

// Remove from Cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCartSidebar();
    renderCartPage();   // <-- এখানে সাথে সাথে cart page re-render হবে
    updateCartCount();
}
// Save to LocalStorage
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Update Cart Count
function updateCartCount() {
    let totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").textContent = totalQty;
}

// Render Sidebar
function renderCartSidebar() {
    let cartItems = document.getElementById("cart-items");
    let summary = document.getElementById("cart-summary");
    let total = document.getElementById("cart-total");

    if (!cartItems) return;

    cartItems.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name} (${item.quantity})</span>
        <span>$${item.price * item.quantity}</span>
        <button onclick="removeFromCart(${item.id})">x</button>
      </div>`;
    });

    summary.textContent = cart.length + " Product";
    total.textContent = "$" + subtotal.toFixed(2);
}

// Render Cart Page
function renderCartPage() {
    let cartPage = document.getElementById("cart-page");
    if (!cartPage) return;

    cartPage.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
        let itemSubtotal = item.price * item.quantity;
        subtotal += itemSubtotal;

        cartPage.innerHTML += `
      <div class="cart-row">
        <span>${item.name}</span>
        <span>$${item.price}</span>
        <div class="quantity">
          <button onclick="changeQty(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <span>$${itemSubtotal}</span>
        <button onclick="removeFromCart(${item.id})">x</button>
      </div>`;
    });

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("total").textContent = subtotal.toFixed(2);
}

// Change Quantity in Cart Page
function changeQty(id, change) {
    let product = cart.find(item => item.id === id);
    if (product) {
        product.quantity += change;
        if (product.quantity < 1) product.quantity = 1;
        if (product.quantity > 5) product.quantity = 5;
    }
    saveCart();
    renderCartPage();
    renderCartSidebar();
    updateCartCount();
}
// Update Cart Count (Item Number, not Quantity)
function updateCartCount() {
    document.getElementById("cart-count").textContent = cart.length;
}
// On Load
renderCartSidebar();
renderCartPage();
updateCartCount();
