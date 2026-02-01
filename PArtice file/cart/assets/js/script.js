// script.js
// Single script used by both index.html and cart.html.
// It manages localStorage-based cart, sidebar rendering (no qty controls there),
// and cart page rendering (with + / - qty controls, bounded 1..5).

document.addEventListener("DOMContentLoaded", () => {
  // ==== Select elements which may exist on the current page ====
  const cartSidebar = document.getElementById("cartSidebar");
  const cartItemsEl = document.getElementById("cartItems");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const clearCartBtn = document.getElementById("clearCart");
  const closeCartBtn = document.getElementById("closeCart");

  const cartToggleDesktop = document.getElementById("cartToggleDesktop");
  const cartCountDesktop = document.getElementById("cartCountDesktop");
  const cartCountCartBar = document.getElementById("item_number");
  const cartToggleMobile = document.getElementById("cartToggleMobile");
  const cartCountMobile = document.getElementById("cartCountMobile");

  // Cart page elements (may not exist on index.html)
  const cartTableBody = document.getElementById("cartTableBody");
  const summarySubtotal = document.getElementById("summarySubtotal");
  const summaryTotal = document.getElementById("summaryTotal");
  const updateCartBtn = document.getElementById("updateCartBtn");

  // ==== Load cart from localStorage (array of items) ====
  // item: { id, name, price (number), img, quantity (int) }
  let cart = JSON.parse(localStorage.getItem("cart")) || [];


  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Calculate subtotal (sum of price * qty)
  function calculateSubtotal() {
    return cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  }

  // Update badge counts (unique items only)
  function updateBadges() {
    const count = cart.length; // unique product count
    if (cartCountDesktop) cartCountDesktop.textContent = count;
    if (cartCountMobile) cartCountMobile.textContent = count;
    if (cartCountCartBar) cartCountCartBar.textContent = count;
  }

  // Render cart items inside sidebar (no plus/minus, only text qty and remove)
  function renderSidebar() {
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = "";

    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<p style="color:var(--muted)">Your cart is empty.</p>`;
      cartSubtotalEl && (cartSubtotalEl.textContent = `$0.00`);
      return;
    }

    cart.forEach((item, idx) => {
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
        <img src="${item.img || ''}" alt="${item.name}">
        <div class="info">
          <h4>${item.name}</h4>
          <div class="price">$${Number(item.price).toFixed(2)}</div>
          <div class="muted">Quantity: ${item.quantity}</div>
        </div>
        <button class="remove" data-index="${idx}" title="Remove">✖</button>
      `;
      cartItemsEl.appendChild(itemEl);
    });

    const subtotal = calculateSubtotal();
    cartSubtotalEl && (cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`);
  }

  // Remove item by index (used in sidebar)
  function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderAll();
  }

  // Clear entire cart
  function clearCart() {
    cart = [];
    saveCart();
    renderAll();
  }

  // Add product (called from index.html product buttons)
  function addProductToCart(product) {
    // product = { id, name, price, img }
    const existing = cart.find(it => it.id === product.id);
    if (existing) {
      // if already exists, increase quantity but cap at 5
      if (existing.quantity < 5) {
        existing.quantity += 1;
      }
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    renderAll();
  }

  // ==== CART PAGE RENDER (with plus/minus) ====
  function renderCartPage() {
    if (!cartTableBody) return;
    cartTableBody.innerHTML = "";

    if (cart.length === 0) {
      cartTableBody.innerHTML = `<tr><td colspan="5" style="color:var(--muted);padding:20px;text-align:center">Your cart is empty.</td></tr>`;
      summarySubtotal && (summarySubtotal.textContent = `$0.00`);
      summaryTotal && (summaryTotal.textContent = `$0.00`);
      return;
    }

    cart.forEach((item, idx) => {
      const subtotal = (item.price * item.quantity).toFixed(2);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="prod-col">
          <div class="prod-info">
            <img src="${item.img || ''}" alt="${item.name}">
            <div>
              <div style="font-weight:600">${item.name}</div>
            </div>
          </div>
        </td>
        <td>$${Number(item.price).toFixed(2)}</td>
        <td>
          <div class="qty-control" data-index="${idx}">
            <button class="qty-decrease" data-index="${idx}">−</button>
            <div class="qty-display" id="qty-${idx}">${item.quantity}</div>
            <button class="qty-increase" data-index="${idx}">+</button>
          </div>
        </td>
        <td>$${subtotal}</td>
        <td><button class="remove-row" data-index="${idx}">✖</button></td>
      `;
      cartTableBody.appendChild(tr);
    });

    const subtotalVal = calculateSubtotal();
    summarySubtotal && (summarySubtotal.textContent = `$${subtotalVal.toFixed(2)}`);
    summaryTotal && (summaryTotal.textContent = `$${subtotalVal.toFixed(2)}`);
  }

  // Increase quantity on cart page (max 5)
  function increaseQty(index) {
    const item = cart[index];
    if (!item) return;
    if (item.quantity < 5) {
      item.quantity += 1;
      saveCart();
      renderCartPage();
      renderSidebar(); // keep sidebar in sync
      updateBadges();
    }
  }

  // Decrease quantity on cart page (min 1)
  function decreaseQty(index) {
    const item = cart[index];
    if (!item) return;
    if (item.quantity > 1) {
      item.quantity -= 1;
      saveCart();
      renderCartPage();
      renderSidebar();
      updateBadges();
    }
  }

  // Remove item from cart page
  function removeFromCartPage(index) {
    cart.splice(index, 1);
    saveCart();
    renderAll();
  }

  // Update all visible parts (badges, sidebar, cart page)
  function renderAll() {
    updateBadges();
    renderSidebar();
    renderCartPage();
  }

  // ==== EVENT LISTENERS ====

  // Add to cart buttons (on index.html)
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const p = e.target.closest(".product");
      const id = p.dataset.id;
      const name = p.dataset.name;
      const price = parseFloat(p.dataset.price);
      const img = p.dataset.img || p.querySelector("img")?.src || "";
      addProductToCart({ id, name, price, img });
    });
  });

  // Sidebar remove (event delegation)
  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove")) {
        const idx = Number(e.target.dataset.index);
        removeItem(idx);
      }
    });
  }

  // Clear all button in sidebar
  if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);

  // Sidebar open/close toggles
  if (cartToggleDesktop) cartToggleDesktop.addEventListener("click", () => cartSidebar && cartSidebar.classList.add("active"));
  if (cartToggleMobile) cartToggleMobile.addEventListener("click", () => cartSidebar && cartSidebar.classList.add("active"));
  if (closeCartBtn) closeCartBtn.addEventListener("click", () => cartSidebar && cartSidebar.classList.remove("active"));

  // Cart page quantity controls and remove (event delegation)
  if (cartTableBody) {
    cartTableBody.addEventListener("click", (e) => {
      const target = e.target;
      const idx = target.dataset.index !== undefined ? Number(target.dataset.index) : null;

      if (target.classList.contains("qty-increase") && idx !== null) {
        increaseQty(idx);
      } else if (target.classList.contains("qty-decrease") && idx !== null) {
        decreaseQty(idx);
      } else if (target.classList.contains("remove-row") && idx !== null) {
        removeFromCartPage(idx);
      }
    });
  }

  // Update Cart button (on cart page) - re-calc and save (most changes already saved live)
  if (updateCartBtn) {
    updateCartBtn.addEventListener("click", (e) => {
      // we already update on click, but provide an explicit save/render
      saveCart();
      renderAll();
      // simple feedback:
      updateCartBtn.textContent = "Updated";
      setTimeout(() => updateCartBtn.textContent = "Update Cart", 900);
    });
  }
  // Initial render
  renderAll();


  // ==== CHECKOUT PAGE RENDER ====
  const orderItems = document.getElementById("orderItems");
  const checkoutSubtotal = document.getElementById("checkoutSubtotal");
  const checkoutTotal = document.getElementById("checkoutTotal");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  function renderCheckout() {
    if (!orderItems) return; // যদি checkout page এ না থাকি, কিছু করবে না
    orderItems.innerHTML = "";
    let subtotal = 0;

    if (cart.length === 0) {
      orderItems.innerHTML = `<li style="color:var(--muted)">Your cart is empty.</li>`;
      checkoutSubtotal && (checkoutSubtotal.textContent = `$0.00`);
      checkoutTotal && (checkoutTotal.textContent = `$0.00`);
      return;
    }

    cart.forEach(item => {
      let li = document.createElement("li");
      li.innerHTML = `
    <img src="${item.img}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;margin-right:8px;">
    ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
  `;
      orderItems.appendChild(li);

      subtotal += item.price * item.quantity;
    });


    checkoutSubtotal && (checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`);
    checkoutTotal && (checkoutTotal.textContent = `$${subtotal.toFixed(2)}`);
  }

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || "cod";
      console.log("Order Placed!", { cart, paymentMethod });

      alert("✅ Order placed successfully!");

      // Clear cart after order
      cart = [];
      saveCart();
      renderAll();
      renderCheckout();
    });
  }

  // Checkout page initial render
  renderCheckout();



});

