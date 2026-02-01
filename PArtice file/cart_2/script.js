/* =========================
   Cart & Wishlist Logic
   Persist with localStorage
   ========================= */

const STORAGE_CART = "myshop_cart_v1";
const STORAGE_WISH = "myshop_wish_v1";
const MAX_QTY = 5;

let cart = JSON.parse(localStorage.getItem(STORAGE_CART)) || [];
let wishlist = JSON.parse(localStorage.getItem(STORAGE_WISH)) || [];

/* ---------- Utilities ---------- */
function saveAll() {
  localStorage.setItem(STORAGE_CART, JSON.stringify(cart));
  localStorage.setItem(STORAGE_WISH, JSON.stringify(wishlist));
}

function formatPrice(n){
  return "$" + Number(n).toFixed(2);
}

/* ---------- Add from index buttons ----------
   These helper functions read product data from DOM in index.html
*/
function addToCartFromBtn(id){
  // find product element
  const el = document.querySelector(`.product-card[data-id="${id}"]`);
  if(!el) return;
  const name = el.dataset.name;
  const price = parseFloat(el.dataset.price);
  addToCart(id, name, price);
}

function addToWishlistFromBtn(id){
  const el = document.querySelector(`.product-card[data-id="${id}"]`);
  if(!el) return;
  const name = el.dataset.name;
  const price = parseFloat(el.dataset.price);
  addToWishlist(id, name, price);
}

/* ---------- Core functions ---------- */

function addToCart(id, name, price) {
  id = Number(id);
  const found = cart.find(p => p.id === id);
  if(found){
    if(found.qty >= MAX_QTY){
      alert("Maximum 5 pieces allowed per product.");
      return;
    }
    found.qty++;
  } else {
    cart.push({ id, name, price: Number(price), qty: 1 });
  }
  saveAll();
  renderAll();
  // open sidebar for feedback
  openCartSidebar();
}

function addToWishlist(id, name, price) {
  id = Number(id);
  if(wishlist.find(p => p.id === id)){
    alert("Product already in wishlist.");
    return;
  }
  wishlist.push({ id, name, price: Number(price) });
  saveAll();
  renderAll();
  alert("Added to wishlist");
}

function removeFromCart(id){
  id = Number(id);
  cart = cart.filter(p => p.id !== id);
  saveAll();
  renderAll();
}

function removeFromWishlist(id){
  id = Number(id);
  wishlist = wishlist.filter(p => p.id !== id);
  saveAll();
  renderAll();
}

function updateQty(id, delta){
  id = Number(id);
  const item = cart.find(p => p.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){
    // remove
    if(confirm("Remove product from cart?")){
      removeFromCart(id);
      return;
    } else {
      item.qty = 1;
    }
  }
  if(item.qty > MAX_QTY){
    item.qty = MAX_QTY;
    alert("Maximum 5 pieces allowed.");
  }
  saveAll();
  renderAll();
}

/* ---------- Rendering ---------- */

function updateBadges() {
  // cart count = total qty
  const cartQty = cart.reduce((s,p)=>s+p.qty,0);
  const wishCount = wishlist.length;

  // multiple badges in different pages
  const cartBadgeEls = document.querySelectorAll("#cart-count, #cart-count-2, #cart-count-3");
  cartBadgeEls.forEach(el => { if(el) el.innerText = cartQty; });

  const wishBadgeEls = document.querySelectorAll("#wishlist-count, #wishlist-count-2, #wishlist-count-3");
  wishBadgeEls.forEach(el => { if(el) el.innerText = wishCount; });

  // summary small text in sidebars
  const summaryCountEls = document.querySelectorAll("#cart-items-count-text, #cart-items-count-text-2, #cart-items-count-text-3");
  summaryCountEls.forEach(el => { if(el) el.innerText = `${cartQty} items`; });

  // footer totals
  const totals = document.querySelectorAll("#cart-summary-count, #cart-summary-count-2, #cart-summary-count-3");
  totals.forEach(el => { if(el) el.innerText = `${cartQty} Items`; });

  const totals2 = document.querySelectorAll("#cart-summary-total, #cart-summary-total-2, #cart-summary-total-3");
  totals2.forEach(el => { if(el) el.innerText = formatPrice(cart.reduce((s,p)=>s+p.qty*p.price,0)); });
}

function renderCartSidebar() {
  // there are 3 possible sidebar lists (on index, cart, wishlist)
  const lists = [
    document.getElementById("cart-items-list"),
    document.getElementById("cart-items-list-2"),
    document.getElementById("cart-items-list-3")
  ];
  lists.forEach(list => {
    if(!list) return;
    list.innerHTML = "";
    if(cart.length === 0){
      list.innerHTML = `<li class="text-muted" style="padding:12px">Your cart is empty.</li>`;
      
    }
    cart.forEach(item => {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <img src="https://via.placeholder.com/80x60.png?text=Img" alt="${item.name}" />
        <div class="meta">
          <h4>${item.name}</h4>
          <div class="price">${formatPrice(item.price)}</div>
          <div class="qty">
            <button class="qbtn" onclick="updateQty(${item.id}, -1)">−</button>
            <span style="min-width:26px;display:inline-block;text-align:center">${item.qty}</span>
            <button class="qbtn" onclick="updateQty(${item.id}, 1)">+</button>
            <button class="remove-btn" title="Remove" onclick="removeFromCart(${item.id})">✖</button>
          </div>
        </div>
      `;
      list.appendChild(li);
    });
  });
  // update summary footer numbers
  updateBadges();
}

function renderCartPage() {
  const tbody = document.getElementById("cart-page-body");
  if(!tbody) return;
  tbody.innerHTML = "";
  if(cart.length === 0){
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted">Cart is empty. <a href="index.html">Go shopping</a></td></tr>`;
    // update totals on side panel too
    document.getElementById("summary-sub").innerText = formatPrice(0);
    document.getElementById("summary-total").innerText = formatPrice(0);
    return;
  }

  let sub = 0;
  cart.forEach(item => {
    const subtotal = item.qty * item.price;
    sub += subtotal;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div style="display:flex;gap:12px;align-items:center">
          <img src="https://via.placeholder.com/80x60.png?text=Img" alt="${item.name}" />
          <div>
            <strong>${item.name}</strong>
            <div class="text-muted" style="font-size:13px">${formatPrice(item.price)}</div>
          </div>
        </div>
      </td>
      <td>${formatPrice(item.price)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="qbtn" onclick="updateQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="qbtn" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
      </td>
      <td>${formatPrice(subtotal)}</td>
      <td><button class="remove-btn" onclick="removeFromCart(${item.id})">✖</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("summary-sub").innerText = formatPrice(sub);
  document.getElementById("summary-total").innerText = formatPrice(sub);
  updateBadges();
}

function renderWishlistPage(){
  const body = document.getElementById("wishlist-body");
  if(!body) return;
  body.innerHTML = "";
  if(wishlist.length === 0){
    body.innerHTML = `<tr><td colspan="3" class="text-muted">Your wishlist is empty. <a href="index.html">Browse products</a></td></tr>`;
    return;
  }
  wishlist.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="display:flex;gap:12px;align-items:center">
        <img style="width:70px;height:50px;object-fit:cover;border-radius:6px" src="https://via.placeholder.com/80x60.png?text=Img" alt="${item.name}" />
        <div><strong>${item.name}</strong></div>
      </td>
      <td>${formatPrice(item.price)}</td>
      <td>
        <button class="btn btn-cart" onclick="addToCart(${item.id}, '${escapeSingleQuotes(item.name)}', ${item.price})">Add to Cart</button>
        <button class="btn btn-wish" style="margin-left:8px" onclick="removeFromWishlist(${item.id})">✖ Remove</button>
      </td>
    `;
    body.appendChild(tr);
  });
  updateBadges();
}

/* helper to escape single quotes in product names used inline */
function escapeSingleQuotes(str){
  return str.replace(/'/g,"\\'");
}

/* ---------- Sidebar toggle ---------- */
function toggleCart(){
  const bar = document.getElementById("cart-bar");
  if(!bar) return;
  bar.classList.toggle("open");
  bar.setAttribute("aria-hidden", !bar.classList.contains("open"));
}

function openCartSidebar(){
  const bar = document.getElementById("cart-bar");
  if(!bar) return;
  bar.classList.add("open");
  bar.setAttribute("aria-hidden","false");
}

/* ---------- Checkout demo ---------- */
function checkoutAlert(){
  alert("Checkout not implemented in this demo. Cart will persist.");
}

/* ---------- Render everything ---------- */
function renderAll(){
  renderCartSidebar();
  renderCartPage();
  renderWishlistPage();
  updateBadges();
}

/* ---------- Init on DOM ready ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderAll();

  // close sidebar on outside click (optional)
  document.addEventListener("click", (e) => {
    const bar = document.getElementById("cart-bar");
    const icon = document.getElementById("cart-icon");
    if(!bar) return;
    if(bar.classList.contains("open")){
      const withinBar = e.composedPath().includes(bar);
      const clickedIcon = e.composedPath().includes(icon);
      if(!withinBar && !clickedIcon){
        // don't auto-close to avoid frustration; comment out if not wanted
        // bar.classList.remove("open");
      }
    }
  });
});
