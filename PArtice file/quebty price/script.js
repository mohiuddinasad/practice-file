// সব product card এর জন্য loop
document.querySelectorAll(".product").forEach(product => {
    let basePrice = parseFloat(product.getAttribute("data-price"));
    let priceElement = product.querySelector(".price");
    let qtyInput = product.querySelector("input");
    let plusBtn = product.querySelector(".plus");
    let minusBtn = product.querySelector(".minus");

    // price update function
    function updatePrice() {
        let qty = parseInt(qtyInput.value);
        let total = (basePrice * qty).toFixed(2);
        priceElement.innerText = "$" + total;
    }

    // plus button
    plusBtn.addEventListener("click", () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
        updatePrice();
    });

    // minus button
    minusBtn.addEventListener("click", () => {
        if (parseInt(qtyInput.value) > 1) {
            qtyInput.value = parseInt(qtyInput.value) - 1;
            updatePrice();
        }
    });
});
