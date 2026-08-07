document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id") || "1001";
    const txnId = urlParams.get("txn") || ("TXN" + Date.now().toString().slice(-6));
    const paramAmount = parseFloat(urlParams.get("amount"));

    const user = getCurrentUser();

    document.getElementById("invDate").textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    document.getElementById("invCustomerName").textContent = user.name || "Customer";
    document.getElementById("invCustomerEmail").textContent = user.email || "";
    document.getElementById("invOrderId").textContent = `Order #${orderId}`;
    document.getElementById("invTxnId").textContent = `TXN: ${txnId}`;

    const trackBtn = document.getElementById("trackOrderBtn");
    if (trackBtn) {
        trackBtn.href = `tracking.html?order_id=${orderId}`;
    }

    let grandTotal = paramAmount || 0;

    try {
        const orderData = await apiCall(`/orders/${orderId}`).catch(() => null);
        const body = document.getElementById("invItemsBody");

        if (orderData && orderData.items) {
            grandTotal = orderData.total_price || grandTotal || 500;
            renderInvoiceItems(orderData.items);
        } else {
            body.innerHTML = `
                <tr>
                    <td class="fw-semibold">Cafe Meal Combo</td>
                    <td class="text-end">₹${grandTotal || 299}</td>
                </tr>
            `;
        }

        const gst = Math.round(grandTotal * 0.05);
        const subtotal = grandTotal - gst;

        document.getElementById("invSubtotal").textContent = `₹${subtotal}`;
        document.getElementById("invGst").textContent = `₹${gst}`;
        document.getElementById("invTotal").textContent = `₹${grandTotal}`;

        // Initialize Spin the Wheel if amount >= 200
        setupSpinWheel(grandTotal, orderId, user);

    } catch (err) {
        console.error("Error loading invoice:", err);
    }
});

function renderInvoiceItems(items) {
    const body = document.getElementById("invItemsBody");
    if (!body) return;
    
    // Group duplicates to make invoice look clean
    const counts = {};
    items.forEach(x => { counts[x] = (counts[x] || 0) + 1; });

    body.innerHTML = Object.keys(counts).map(name => `
        <tr>
            <td class="fw-semibold">${name} ${counts[name] > 1 ? `(x${counts[name]})` : ''}</td>
            <td class="text-end text-success">Included</td>
        </tr>
    `).join('');
}

// ── Spin the Wheel Logic ──
const wheelRewards = [
    "🎁 Free Brownie",
    "🥤 Free Coffee",
    "🍟 Free Fries",
    "🍔 20% Off Next Order",
    "💰 ₹100 Cashback",
    "⭐ 100 Points",
    "🎉 Buy 1 Get 1 Free",
    "😔 Better Luck"
];

const sectorColors = [
    "#ffc107", "#28a745", "#17a2b8", "#e83e8c", 
    "#6f42c1", "#fd7e14", "#dc3545", "#6c757d"
];

function setupSpinWheel(amount, orderId, user) {
    const wheelNotice = document.getElementById("wheelNotice");
    const wheelWrapper = document.getElementById("wheelGameWrapper");
    const wheelSection = document.getElementById("wheelContainerSection");

    // Check if user already spun for this order to prevent double-spinning
    const alreadySpun = localStorage.getItem(`spun_order_${orderId}`);

    if (amount < 200) {
        if (wheelNotice) {
            wheelNotice.innerHTML = `<span class="text-danger fw-bold"><i class="fa-solid fa-lock me-1"></i> Wheel Locked</span>. Order amount of <strong>₹${amount}</strong> is below the ₹200 reward threshold. Add more items on your next visit to spin!`;
        }
        return;
    }

    if (alreadySpun) {
        if (wheelNotice) {
            wheelNotice.textContent = `You won: ${alreadySpun}! Reward has been credited.`;
        }
        return;
    }

    // Unlock
    if (wheelNotice) {
        wheelNotice.innerHTML = `<span class="text-success fw-bold"><i class="fa-solid fa-lock-open me-1"></i> Wheel Unlocked!</span> Spin for a guaranteed reward added to your order/account!`;
    }
    if (wheelWrapper) {
        wheelWrapper.classList.remove("d-none");
    }
    if (wheelSection) {
        wheelSection.classList.add("reward-unlocked");
    }

    const canvas = document.getElementById("wheelCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Draw initial wheel
    drawWheel(canvas, ctx);

    const spinBtn = document.getElementById("spinWheelBtn");
    if (spinBtn) {
        spinBtn.addEventListener("click", () => {
            spinBtn.disabled = true;
            spinBtn.textContent = "Spinning...";

            // Determine rotation degrees (at least 5 full rotations + random angle)
            const randomRotation = 1800 + Math.floor(Math.random() * 360);
            
            canvas.style.transition = "transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)";
            canvas.style.transform = `rotate(${randomRotation}deg)`;

            // Wait for animation to finish
            setTimeout(async () => {
                // Calculate stopped index (pointer is at the top: 270 degrees)
                const anglePerSector = 360 / wheelRewards.length;
                const stopAngle = (270 - (randomRotation % 360) + 360) % 360;
                const winningIndex = Math.floor(stopAngle / anglePerSector) % wheelRewards.length;
                const rewardWon = wheelRewards[winningIndex];

                // Save status
                localStorage.setItem(`spun_order_${orderId}`, rewardWon);
                
                // Trigger reward backend integrations
                await claimReward(rewardWon, orderId, user);

                // Update UI
                if (wheelNotice) {
                    wheelNotice.innerHTML = `🎉 Congratulations! You won <strong>${rewardWon}</strong>!`;
                }
                
                // Hide button
                spinBtn.style.display = "none";
                showToast(`Won: ${rewardWon}!`, "success");

                // Trigger confetti or success modal if desired
                if (window.bootstrap) {
                    showToast(`Congratulations! ${rewardWon} has been added to your account/order.`, "success");
                }

            }, 4000);
        });
    }
}

function drawWheel(canvas, ctx) {
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const totalSlices = wheelRewards.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;

    ctx.clearRect(0, 0, size, size);

    // Draw Slices
    for (let i = 0; i < totalSlices; i++) {
        const startAngle = i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.fillStyle = sectorColors[i];
        ctx.fill();
        ctx.stroke();

        // Draw text labels
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + sliceAngle / 2);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Outfit, sans-serif";
        ctx.textAlign = "right";
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 4;
        
        // Truncate text if needed
        const text = wheelRewards[i].replace("🎁 ", "").replace("🥤 ", "").replace("🍟 ", "").replace("🍔 ", "").replace("💰 ", "").replace("⭐ ", "").replace("🎉 ", "");
        ctx.fillText(text, radius - 20, 4);
        
        ctx.restore();
    }

    // Draw inner circle
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffc107";
    ctx.stroke();

    // Draw central star/indicator
    ctx.fillStyle = "#222";
    ctx.font = "bold 14px FontAwesome";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎁", center, center);
}

async function claimReward(reward, orderId, user) {
    try {
        if (reward.includes("Brownie") || reward.includes("Coffee") || reward.includes("Fries")) {
            // Food reward: add to current order
            let itemToAdd = "";
            if (reward.includes("Brownie")) itemToAdd = "🎁 Free Brownie";
            else if (reward.includes("Coffee")) itemToAdd = "🥤 Free Coffee";
            else if (reward.includes("Fries")) itemToAdd = "🍟 Free French Fries";

            // Call API to append item to order
            const updated = await apiCall(`/orders/${orderId}/add-item`, 'POST', { item_name: itemToAdd });
            
            // Reload invoice items view
            if (updated && updated.data && updated.data.items) {
                renderInvoiceItems(updated.data.items);
            }
        } 
        else if (reward.includes("Points")) {
            // Loyalty points reward: add 100 points
            await apiCall(`/users/${user.id || 1}/loyalty`, 'POST', { points: 100 }).catch(() => {});
        } 
        else {
            // Wallet reward: BOGO, cashback, discount
            await apiCall(`/users/${user.id || 1}/rewards`, 'POST', { reward: reward }).catch(() => {});
        }
    } catch (e) {
        console.error("Failed to claim reward:", e);
    }
}
