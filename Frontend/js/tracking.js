document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id") || "1";

    const trackOrderEl = document.getElementById("trackOrderId");
    if (trackOrderEl) trackOrderEl.textContent = `Order #${orderId}`;

    // Initial load
    await loadTrackingStatus(orderId);

    // Setup live status polling every 5 seconds
    const pollingInterval = setInterval(() => {
        loadTrackingStatus(orderId);
    }, 5000);

    const refreshBtn = document.getElementById("refreshStatusBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => loadTrackingStatus(orderId));
    }

    // Cancel order button
    const cancelBtn = document.getElementById("cancelOrderBtn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => requestOrderCancellation(orderId, pollingInterval));
    }
});

async function loadTrackingStatus(orderId) {
    try {
        const trackingList = await apiCall('/tracking/').catch(() => []);
        const orderData = await apiCall(`/orders/${orderId}`).catch(() => null);

        let currentStatus = "Pending";
        let orderItems = [];
        
        const trackItem = trackingList.find(t => t.order_id == orderId);
        if (trackItem && trackItem.order_status) {
            currentStatus = trackItem.order_status;
        } else if (orderData && orderData.status) {
            currentStatus = orderData.status;
        }

        if (orderData && orderData.items) {
            orderItems = orderData.items;
        }

        const badge = document.getElementById("trackStatusBadge");
        if (badge) badge.textContent = currentStatus;

        // Render Delivery / Seat info dynamically
        const deliveryAddressEl = document.getElementById("deliveryAddressText");
        if (deliveryAddressEl) {
            if (orderData) {
                deliveryAddressEl.innerHTML = `
                    <strong>Customer:</strong> ${orderData.customer_name || 'Guest'}<br>
                    <strong>Items Ordered:</strong> ${Array.isArray(orderItems) ? orderItems.join(', ') : orderItems}
                `;
            }
        }

        // Update Stepper and Chef UI
        updateStepperUI(currentStatus, orderItems);

    } catch (err) {
        console.error("Tracking Error:", err);
    }
}

// 7 Stages configuration mapping
const trackingStages = [
    { name: "placed", index: 1 },
    { name: "confirmed", index: 2 },
    { name: "preparing", index: 3 },
    { name: "cooking", index: 4 },
    { name: "ready", index: 5 },
    { name: "serving", index: 6 },
    { name: "delivered", index: 7 }
];

function updateStepperUI(status, items) {
    const s1 = document.getElementById("step1");
    const s2 = document.getElementById("step2");
    const s3 = document.getElementById("step3");
    const s4 = document.getElementById("step4");
    const s5 = document.getElementById("step5");
    const s6 = document.getElementById("step6");
    const s7 = document.getElementById("step7");

    const steps = [s1, s2, s3, s4, s5, s6, s7];
    const eta = document.getElementById("trackEta");
    const chefCard = document.getElementById("chefProgressCard");
    const chefActionLabel = document.getElementById("chefActionLabel");
    const cancelWrapper = document.getElementById("cancelOrderWrapper");

    // Reset styles
    steps.forEach(s => {
        if (s) s.className = "step-icon";
    });

    const statusLower = status.toLowerCase();
    let activeIndex = 1; // Default to placed
    let etaText = "30 Mins";
    let chefDescription = "Order received by server. Waiting to send to the kitchen.";

    // Map status string to index
    if (statusLower.includes("placed") || statusLower.includes("pending") || statusLower.includes("received")) {
        activeIndex = 1;
        etaText = "30 Mins";
        chefDescription = "The kitchen is verifying your order items.";
    } else if (statusLower.includes("confirm") || statusLower.includes("accepted")) {
        activeIndex = 2;
        etaText = "25 Mins";
        chefDescription = "Order confirmed! Chef Rahul is preparing the workstation.";
    } else if (statusLower.includes("preparing") || statusLower.includes("prep")) {
        activeIndex = 3;
        etaText = "20 Mins";
        chefDescription = `Chef Rahul is cleaning and chopping fresh ingredients for your meals.`;
    } else if (statusLower.includes("cooking") || statusLower.includes("cook") || statusLower.includes("grill")) {
        activeIndex = 4;
        etaText = "12 Mins";
        chefDescription = `Chef Rahul is cooking your food on the grill. Smells delicious!`;
    } else if (statusLower.includes("ready") || statusLower.includes("plated") || statusLower.includes("pass")) {
        activeIndex = 5;
        etaText = "5 Mins";
        chefDescription = "Plating and adding the final garnishes. Your order is ready to serve!";
    } else if (statusLower.includes("serving") || statusLower.includes("out") || statusLower.includes("delivery") || statusLower.includes("transit")) {
        activeIndex = 6;
        etaText = "2 Mins";
        chefDescription = "Our server staff is bringing the hot plates to your table right now!";
    } else if (statusLower.includes("completed") || statusLower.includes("delivered") || statusLower.includes("done")) {
        activeIndex = 7;
        etaText = "Delivered! 🎉";
        chefDescription = "Your meal has been served. Enjoy your food and have a great time!";
    }

    // Set stepper classes
    for (let i = 0; i < steps.length; i++) {
        const stepIndex = i + 1;
        if (steps[i]) {
            if (stepIndex < activeIndex) {
                steps[i].className = "step-icon step-completed";
            } else if (stepIndex === activeIndex) {
                steps[i].className = "step-icon step-active";
            } else {
                steps[i].className = "step-icon";
            }
        }
    }

    // Update ETA and Chef card
    if (eta) eta.textContent = etaText;
    if (chefCard) {
        chefCard.classList.remove("d-none");
    }
    if (chefActionLabel) {
        chefActionLabel.textContent = chefDescription;
    }

    // Toggle cancel button (only allowed before preparation starts: step index <= 2)
    if (cancelWrapper) {
        if (activeIndex <= 2 && statusLower !== "cancelled" && !statusLower.includes("cancel")) {
            cancelWrapper.classList.remove("d-none");
        } else {
            cancelWrapper.classList.add("d-none");
        }
    }
    
    // Handle cancelled state explicitly
    if (statusLower.includes("cancel")) {
        steps.forEach(s => { if (s) s.className = "step-icon bg-danger text-white border-danger"; });
        if (eta) eta.textContent = "Cancelled";
        if (chefActionLabel) chefActionLabel.textContent = "This order was cancelled. No charges applied.";
    }
}

async function requestOrderCancellation(orderId, intervalId) {
    if (confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
        try {
            // Find order
            const order = await apiCall(`/orders/${orderId}`).catch(() => null);
            if (order) {
                order.status = "Cancelled";
                await apiCall(`/orders/${orderId}`, 'PUT', order);
                
                // Update tracking record if exists
                const trackingList = await apiCall('/tracking/').catch(() => []);
                const trackItem = trackingList.find(t => t.order_id == orderId);
                if (trackItem) {
                    trackItem.order_status = "Cancelled";
                    await apiCall(`/tracking/${trackItem.id}`, 'PUT', trackItem).catch(() => {});
                }

                showToast("Order cancelled successfully", "info");
                clearInterval(intervalId);
                await loadTrackingStatus(orderId);
            }
        } catch (e) {
            console.error("Order Cancellation failed:", e);
            showToast("Failed to cancel order", "danger");
        }
    }
}
