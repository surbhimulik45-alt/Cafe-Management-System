document.addEventListener("DOMContentLoaded", () => {
    const summaryData = JSON.parse(localStorage.getItem("checkout_summary")) || { items: [], total: 0 };
    const user = getCurrentUser();

    const totalAmount = summaryData.total || 0;
    const amountSpan = document.getElementById("payAmountBtn");
    const totalSpan = document.getElementById("paymentTotalAmount");

    if (amountSpan) amountSpan.textContent = `₹${totalAmount}`;
    if (totalSpan) totalSpan.textContent = `₹${totalAmount}`;

    // Render items summary
    const itemsSummaryContainer = document.getElementById("orderItemsSummary");
    if (itemsSummaryContainer) {
        if (summaryData.items && summaryData.items.length > 0) {
            itemsSummaryContainer.innerHTML = summaryData.items.map(item => `
                <div class="d-flex justify-content-between mb-2">
                    <span class="fw-semibold">${item.item_name} (x${item.quantity || 1})</span>
                    <span>₹${(item.price || 0) * (item.quantity || 1)}</span>
                </div>
            `).join('');
        } else {
            itemsSummaryContainer.innerHTML = `<p class="text-muted">No items in checkout.</p>`;
        }
    }

    // Toggle radio sections
    const upiRadio = document.getElementById("payUPI");
    const cardRadio = document.getElementById("payCard");
    const cashRadio = document.getElementById("payCash");
    const upiSection = document.getElementById("upiSection");
    const cardSection = document.getElementById("cardSection");

    const updatePaymentFields = () => {
        if (upiSection) upiSection.style.display = upiRadio.checked ? "block" : "none";
        if (cardSection) cardSection.style.display = cardRadio.checked ? "block" : "none";
    };

    if (upiRadio) upiRadio.addEventListener("change", updatePaymentFields);
    if (cardRadio) cardRadio.addEventListener("change", updatePaymentFields);
    if (cashRadio) cashRadio.addEventListener("change", updatePaymentFields);

    // Pay now submit
    const payNowBtn = document.getElementById("payNowBtn");
    if (payNowBtn) {
        payNowBtn.addEventListener("click", async () => {
            if (totalAmount <= 0) {
                showToast("Cart is empty", "warning");
                return;
            }

            const paymentMethod = document.querySelector('input[name="paymentMode"]:checked')?.value || "UPI";
            const orderId = Math.floor(1000 + Math.random() * 9000);
            const transactionId = "TXN" + Date.now().toString().slice(-6);

            const paymentPayload = {
                id: Date.now(),
                user_id: user.id || 1,
                order_id: orderId,
                amount: totalAmount,
                payment_method: paymentMethod,
                payment_status: "Paid",
                transaction_id: transactionId,
                qr_code: `upi://pay?pa=cafe@upi&pn=CafeDelight&am=${totalAmount}`
            };

            const orderPayload = {
                id: orderId,
                customer_name: user.name || "Customer",
                items: summaryData.items ? summaryData.items.map(i => i.item_name) : ["Cafe Special"],
                total_price: totalAmount,
                status: "Pending"
            };

            const trackingPayload = {
                id: Date.now(),
                order_id: orderId,
                user_id: user.id || 1,
                order_status: "Order Received"
            };

            try {
                payNowBtn.disabled = true;
                payNowBtn.textContent = "Processing Payment...";

                await apiCall('/payment/', 'POST', paymentPayload);
                await apiCall('/orders/', 'POST', orderPayload).catch(() => {});
                await apiCall('/tracking/', 'POST', trackingPayload).catch(() => {});

                // Clear cart backend
                if (summaryData.items) {
                    for (const item of summaryData.items) {
                        await apiCall(`/cart/${item.id}`, 'DELETE').catch(() => {});
                    }
                }

                showToast("Payment Successful!", "success");
                localStorage.removeItem("checkout_summary");
                updateCartCount();

                setTimeout(() => {
                    window.location.href = `invoice.html?order_id=${orderId}&txn=${transactionId}&amount=${totalAmount}`;
                }, 1200);

            } catch (err) {
                console.error("Payment failed", err);
                payNowBtn.disabled = false;
                payNowBtn.textContent = `Pay ₹${totalAmount} & Place Order`;
            }
        });
    }
});
