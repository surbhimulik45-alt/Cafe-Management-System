let cartItems = [];
let appliedDiscountPercent = 0;

document.addEventListener("DOMContentLoaded", async () => {
    await renderCart();

    const applyCouponBtn = document.getElementById("applyCouponBtn");
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener("click", () => {
            const code = document.getElementById("couponCode").value.toUpperCase().trim();
            if (code === "CAFE20" || code === "WELCOME20") {
                appliedDiscountPercent = 20;
                showToast("Coupon applied! 20% Discount", "success");
            } else if (code === "BURGER15") {
                appliedDiscountPercent = 15;
                showToast("Coupon applied! 15% Discount", "success");
            } else if (code) {
                showToast("Invalid coupon code", "warning");
                appliedDiscountPercent = 0;
            }
            updateSummaryTotals();
        });
    }

    const clearCartBtn = document.getElementById("clearCartBtn");
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to clear your cart?")) {
                for (const item of cartItems) {
                    await apiCall(`/cart/${item.id}`, 'DELETE').catch(() => {});
                }
                showToast("Cart cleared", "info");
                await renderCart();
                updateCartCount();
            }
        });
    }

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cartItems.length === 0) {
                showToast("Your cart is empty!", "warning");
                return;
            }
            const grandTotalText = document.getElementById("cartGrandTotal").textContent.replace('₹', '');
            const checkoutData = {
                items: cartItems,
                discount: appliedDiscountPercent,
                total: parseFloat(grandTotalText) || 0
            };
            localStorage.setItem("checkout_summary", JSON.stringify(checkoutData));
            window.location.href = "payment.html";
        });
    }
});

async function renderCart() {
    const tableBody = document.getElementById("cartItemsTable");
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Loading Cart...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        cartItems = await apiCall('/cart/');
        if (!cartItems || cartItems.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-cart-shopping fa-3x mb-3"></i>
                        <h5>Your cart is currently empty</h5>
                        <a href="menu.html" class="btn btn-warning mt-2">Explore Menu</a>
                    </td>
                </tr>
            `;
            updateSummaryTotals();
            return;
        }

        tableBody.innerHTML = "";
        cartItems.forEach(item => {
            const tr = document.createElement("tr");
            const price = item.price || 0;
            const qty = item.quantity || 1;
            const itemTotal = price * qty;

            tr.innerHTML = `
                <td class="ps-4">
                    <span class="fw-bold text-dark">${item.item_name}</span>
                </td>
                <td>₹${price}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-secondary btn-minus" data-id="${item.id}">-</button>
                        <span class="btn btn-light px-3 fw-bold disabled">${qty}</span>
                        <button class="btn btn-outline-secondary btn-plus" data-id="${item.id}">+</button>
                    </div>
                </td>
                <td class="fw-bold text-success">₹${itemTotal}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${item.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            // Quantity update & delete handlers
            tr.querySelector(".btn-minus").addEventListener("click", () => updateQuantity(item, qty - 1));
            tr.querySelector(".btn-plus").addEventListener("click", () => updateQuantity(item, qty + 1));
            tr.querySelector(".btn-delete").addEventListener("click", () => deleteItem(item.id));

            tableBody.appendChild(tr);
        });

        updateSummaryTotals();
    } catch (err) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-danger">
                    Failed to fetch cart. Please retry.
                </td>
            </tr>
        `;
    }
}

async function updateQuantity(item, newQty) {
    if (newQty <= 0) {
        await deleteItem(item.id);
        return;
    }

    const updatedItem = {
        ...item,
        quantity: newQty,
        total_price: item.price * newQty
    };

    try {
        await apiCall(`/cart/${item.id}`, 'PUT', updatedItem);
        await renderCart();
        updateCartCount();
    } catch (err) {
        console.error("Failed to update cart item quantity", err);
    }
}

async function deleteItem(id) {
    try {
        await apiCall(`/cart/${id}`, 'DELETE');
        showToast("Item removed from cart", "info");
        await renderCart();
        updateCartCount();
    } catch (err) {
        console.error("Failed to delete cart item", err);
    }
}

function updateSummaryTotals() {
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += (item.price || 0) * (item.quantity || 1);
    });

    const discountAmount = (subtotal * appliedDiscountPercent) / 100;
    const taxableTotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableTotal * 0.05; // 5% GST
    const grandTotal = Math.round(taxableTotal + taxAmount);

    const subtotalEl = document.getElementById("cartSubtotal");
    const discountEl = document.getElementById("cartDiscount");
    const taxEl = document.getElementById("cartTax");
    const grandTotalEl = document.getElementById("cartGrandTotal");

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (discountEl) discountEl.textContent = `-₹${discountAmount.toFixed(0)}`;
    if (taxEl) taxEl.textContent = `₹${taxAmount.toFixed(0)}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;
}
