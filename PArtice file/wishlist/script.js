document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }
  function saveWishlist() { localStorage.setItem("wishlist", JSON.stringify(wishlist)); }

  function updateCounts() {
    document.querySelectorAll("#cartCount").forEach(el => el.textContent = cart.length);
    document.querySelectorAll("#wishlistCount").forEach(el => el.textContent = wishlist.length);
  }

  // === INDEX PAGE ===
  document.querySelectorAll(".product").forEach(prod => {
    const id = prod.dataset.id;
    const name = prod.dataset.name;
    const price = parseFloat(prod.dataset.price);
    const img = prod.dataset.img;
    const stock = prod.dataset.stock === "true";

    prod.querySelector(".add-to-cart").addEventListener("click", () => {
      if (!stock) { alert("Out of stock!"); return; }
      const existing = cart.find(p => p.id === id);
      if (existing) existing.quantity++;
      else cart.push({ id, name, price, img, stock, quantity: 1 });
      saveCart(); updateCounts();
    });

    prod.querySelector(".add-to-wishlist").addEventListener("click", () => {
      if (!wishlist.find(p => p.id === id)) {
        wishlist.push({ id, name, price, img, stock });
        saveWishlist(); updateCounts();
      }
    });
  });

  // === WISHLIST PAGE ===
  const wishlistTableBody = document.getElementById("wishlistTableBody");
  if (wishlistTableBody) {
    function renderWishlist() {
      wishlistTableBody.innerHTML = "";
      wishlist.forEach((item, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><img src="${item.img}" width="40"> ${item.name}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>
            ${item.stock 
              ? '<span class="stock-in">In Stock</span>' 
              : '<span class="stock-out">Out of Stock</span>'}
          </td>
          <td>
            <button class="${item.stock ? 'btn-green' : 'btn-disabled'} add-to-cart-wishlist" data-index="${idx}" ${item.stock ? "" : "disabled"}>Add to Cart</button>
            <button class="remove-btn remove-wishlist" data-index="${idx}">✖</button>
          </td>
        `;
        wishlistTableBody.appendChild(tr);
      });
    }
    renderWishlist();

    wishlistTableBody.addEventListener("click", e => {
      if (e.target.classList.contains("remove-wishlist")) {
        wishlist.splice(e.target.dataset.index, 1);
        saveWishlist(); renderWishlist(); updateCounts();
      }
      if (e.target.classList.contains("add-to-cart-wishlist")) {
        const item = wishlist[e.target.dataset.index];
        const existing = cart.find(p => p.id === item.id);
        if (existing) existing.quantity++;
        else cart.push({ ...item, quantity: 1 });
        saveCart(); updateCounts();
      }
    });
  }

  // === CART PAGE ===
  const cartTableBody = document.getElementById("cartTableBody");
  if (cartTableBody) {
    function renderCart() {
      cartTableBody.innerHTML = "";
      let subtotal = 0;
      cart.forEach((item, idx) => {
        const total = item.price * item.quantity;
        subtotal += total;
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><img src="${item.img}" width="40"> ${item.name}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>$${total.toFixed(2)}</td>
          <td><button class="remove-btn" data-index="${idx}">✖</button></td>
        `;
        cartTableBody.appendChild(tr);
      });
      document.getElementById("cartSubtotal").textContent = subtotal.toFixed(2);
    }
    renderCart();

    cartTableBody.addEventListener("click", e => {
      if (e.target.classList.contains("remove-btn")) {
        cart.splice(e.target.dataset.index, 1);
        saveCart(); renderCart(); updateCounts();
      }
    });
  }

  updateCounts();
});
