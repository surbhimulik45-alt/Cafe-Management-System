document.addEventListener("DOMContentLoaded", () => {
    // Sync budget range display value
    const budgetSlider = document.getElementById("surpriseBudget");
    const budgetValText = document.getElementById("budgetValue");

    if (budgetSlider && budgetValText) {
        budgetSlider.addEventListener("input", (e) => {
            budgetValText.textContent = `₹${e.target.value}`;
        });
    }

    const form = document.getElementById("surpriseForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            generateSurpriseFeast();
        });
    }
});

// Cache generated items global state so we can add them to cart or favorites
let currentSurpriseItems = [];

async function generateSurpriseFeast() {
    const budget = parseFloat(document.getElementById("surpriseBudget").value);
    const preference = document.querySelector('input[name="foodPref"]:checked').value;
    const category = document.getElementById("surpriseCategory").value;
    const spice = document.querySelector('input[name="spiceLevel"]:checked').value;

    const idleState = document.getElementById("resultStateIdle");
    const rollingState = document.getElementById("resultStateRolling");
    const doneState = document.getElementById("resultStateDone");

    // Toggle states
    if (idleState) idleState.classList.add("d-none");
    if (doneState) doneState.classList.add("d-none");
    if (rollingState) rollingState.classList.remove("d-none");

    try {
        // Fetch all menu items
        const menuItems = await apiCall('/menu/').catch(() => []);
        if (menuItems.length === 0) {
            showToast("Failed to fetch menu items for selection", "danger");
            resetIdleState();
            return;
        }

        // Ticker animation on rolling
        const ticker = document.getElementById("rollingTicker");
        const tickerInterval = setInterval(() => {
            if (ticker) {
                const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
                ticker.textContent = `🎲 ${randomItem.name} (₹${randomItem.price})`;
            }
        }, 100);

        // Run matching selection algorithm after 1.5 seconds delay
        setTimeout(() => {
            clearInterval(tickerInterval);
            
            // Filter menu items by preference and spice ONLY (for combos)
            let baseFiltered = menuItems.filter(item => {
                if (preference !== "Any" && item.preference && item.preference !== preference) {
                    return false;
                }
                if (item.spice_level) {
                    if (spice === "Mild" && item.spice_level !== "Mild") return false;
                    if (spice === "Medium" && item.spice_level === "Spicy") return false;
                }
                return true;
            });

            if (baseFiltered.length === 0) {
                // Fallback: relax spice filtering
                baseFiltered = menuItems.filter(item => {
                    if (preference !== "Any" && item.preference && item.preference !== preference) {
                        return false;
                    }
                    return true;
                });
            }

            let selectedCombo = [];
            let comboReasonStr = "";

            // If budget is large enough, try to build a combo (even if a category is selected)
            if (budget >= 300) {
                let mains = baseFiltered.filter(i => ["Burgers", "Sandwich", "Pasta"].includes(i.category));
                let drinks = baseFiltered.filter(i => ["Mojitos", "Shakes", "Coffee"].includes(i.category));
                let sides = baseFiltered.filter(i => ["Lite Bites", "Desserts"].includes(i.category));

                // If user selected a specific category, ensure that category is represented in the combo pool
                if (category !== "Any") {
                    if (["Burgers", "Sandwich", "Pasta"].includes(category)) {
                        mains = mains.filter(i => i.category === category);
                    } else if (["Mojitos", "Shakes", "Coffee"].includes(category)) {
                        drinks = drinks.filter(i => i.category === category);
                    } else if (["Lite Bites", "Desserts"].includes(category)) {
                        sides = sides.filter(i => i.category === category);
                    }
                }

                // Attempt to assemble a valid 3-item combo that fits budget
                let attempts = 0;
                let foundCombo = false;
                
                while (attempts < 100 && !foundCombo) {
                    attempts++;
                    const m = mains[Math.floor(Math.random() * mains.length)];
                    const d = drinks[Math.floor(Math.random() * drinks.length)];
                    const s = sides[Math.floor(Math.random() * sides.length)];

                    if (m && d && s) {
                        const total = m.price + d.price + s.price;
                        if (total <= budget) {
                            selectedCombo = [m, d, s];
                            foundCombo = true;
                        }
                    }
                }

                // If three-item combo fails, try two-item combo ensuring the category is still met
                if (!foundCombo) {
                    attempts = 0;
                    while (attempts < 100 && !foundCombo) {
                        attempts++;
                        const m = mains[Math.floor(Math.random() * mains.length)];
                        const d = drinks[Math.floor(Math.random() * drinks.length)];
                        const s = sides[Math.floor(Math.random() * sides.length)];
                        
                        let pair = [];
                        if (category !== "Any") {
                            if (["Burgers", "Sandwich", "Pasta"].includes(category)) pair = [m, d || s];
                            else if (["Mojitos", "Shakes", "Coffee"].includes(category)) pair = [d, m || s];
                            else if (["Lite Bites", "Desserts"].includes(category)) pair = [s, m || d];
                        } else {
                            pair = [m || sides[Math.floor(Math.random() * sides.length)], d || sides[Math.floor(Math.random() * sides.length)]];
                        }

                        if (pair[0] && pair[1] && pair[0].id !== pair[1].id) {
                            const total = pair[0].price + pair[1].price;
                            if (total <= budget) {
                                selectedCombo = [pair[0], pair[1]];
                                foundCombo = true;
                            }
                        }
                    }
                }
            }

            // If no combo found, or if budget is too low, pick a single item that fits the budget and exact category
            if (selectedCombo.length === 0) {
                let singleFiltered = baseFiltered;
                if (category !== "Any") {
                    singleFiltered = singleFiltered.filter(i => i.category === category);
                }
                const fitBudget = singleFiltered.filter(i => i.price <= budget);
                if (fitBudget.length > 0) {
                    const picked = fitBudget[Math.floor(Math.random() * fitBudget.length)];
                    selectedCombo = [picked];
                }
            }

            // Display selection results
            if (selectedCombo.length > 0) {
                currentSurpriseItems = selectedCombo;
                renderSurpriseResult(selectedCombo, budget);
            } else {
                showToast("No items found fitting your exact criteria. Try relaxing your filters or increasing budget!", "warning");
                resetIdleState();
            }

        }, 1500);

    } catch (e) {
        console.error(e);
        showToast("Error generating surprise combo", "danger");
        resetIdleState();
    }
}

function resetIdleState() {
    const idleState = document.getElementById("resultStateIdle");
    const rollingState = document.getElementById("resultStateRolling");
    const doneState = document.getElementById("resultStateDone");

    if (rollingState) rollingState.classList.add("d-none");
    if (doneState) doneState.classList.add("d-none");
    if (idleState) idleState.classList.remove("d-none");
}

function renderSurpriseResult(items, maxBudget) {
    const rollingState = document.getElementById("resultStateRolling");
    const doneState = document.getElementById("resultStateDone");

    if (rollingState) rollingState.classList.add("d-none");
    if (doneState) doneState.classList.remove("d-none");

    const total = items.reduce((sum, item) => sum + item.price, 0);
    
    // Set labels
    const titleEl = document.getElementById("surpriseComboTitle");
    if (titleEl) {
        titleEl.textContent = items.length > 1 ? "🎉 Your Surprise Combo" : "🎉 Your Surprise Item";
    }

    const totalLabel = document.getElementById("resultTotalLabel");
    if (totalLabel) {
        totalLabel.textContent = `Total: ₹${total}`;
    }

    // Render items list
    const container = document.getElementById("comboItemsContainer");
    if (container) {
        container.innerHTML = items.map(item => `
            <div class="combo-item-row d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-3">
                    <img src="${item.image || 'images/cafe-bg.jpg'}" alt="${item.name}" width="55" height="55" class="rounded object-fit-cover border border-secondary">
                    <div>
                        <h6 class="fw-bold text-white mb-0">${item.name}</h6>
                        <span class="badge bg-light text-dark border small mt-1 py-0 px-2">${item.category}</span>
                        <span class="text-white-50 small ms-1">${item.preference === 'Veg' ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                    </div>
                </div>
                <div class="text-end">
                    <span class="fw-bold text-warning fs-5">₹${item.price}</span>
                    <div class="small text-white-50">${item.nutrition || '150 Cal'}</div>
                </div>
            </div>
        `).join('');
    }

    // Set matching explanation reason
    const reasonEl = document.getElementById("comboReason");
    if (reasonEl) {
        const itemNames = items.map(i => i.name).join(' & ');
        reasonEl.textContent = `Fits your maximum budget of ₹${maxBudget}. We curated this combo because it balances refreshing flavors with a delicious entrée, including our top rating items.`;
    }

    // Setup action handlers
    const orderBtn = document.getElementById("orderSurpriseBtn");
    if (orderBtn) {
        // Clear previous event listeners by cloning
        const newOrderBtn = orderBtn.cloneNode(true);
        orderBtn.parentNode.replaceChild(newOrderBtn, orderBtn);
        newOrderBtn.addEventListener("click", () => addSurpriseComboToCart(items));
    }

    const favBtn = document.getElementById("favSurpriseBtn");
    if (favBtn) {
        const newFavBtn = favBtn.cloneNode(true);
        favBtn.parentNode.replaceChild(newFavBtn, favBtn);
        newFavBtn.addEventListener("click", () => addSurpriseComboToFavorites(items));
    }
}

async function addSurpriseComboToCart(items) {
    const user = getCurrentUser();
    const orderBtn = document.getElementById("orderSurpriseBtn");
    
    if (orderBtn) {
        orderBtn.disabled = true;
        orderBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Ordering...`;
    }

    try {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const payload = {
                id: Date.now() + i,
                user_id: user.id || 1,
                menu_id: item.id,
                item_name: item.name,
                quantity: 1,
                price: item.price,
                total_price: item.price
            };
            await apiCall('/cart/', 'POST', payload).catch(() => {});
        }
        showToast("Surprise Combo added to your cart!", "success");
        await updateCartCount();
        
        setTimeout(() => {
            window.location.href = "cart.html";
        }, 1200);
    } catch (e) {
        showToast("Failed to place items in cart", "danger");
        if (orderBtn) {
            orderBtn.disabled = false;
            orderBtn.innerHTML = `<i class="fa-solid fa-cart-arrow-down me-1"></i> Order Now`;
        }
    }
}

async function addSurpriseComboToFavorites(items) {
    const user = getCurrentUser();
    const favBtn = document.getElementById("favSurpriseBtn");

    if (favBtn) {
        favBtn.disabled = true;
        favBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Favoriting...`;
    }

    try {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const payload = {
                id: Date.now() + i,
                user_id: user.id || 1,
                menu_id: item.id,
                item_name: item.name
            };
            await apiCall('/favorites/', 'POST', payload).catch(() => {});
        }
        showToast("Added combo to your favorites list! ❤️", "success");
    } catch (e) {
        showToast("Failed to save to favorites", "danger");
    } finally {
        if (favBtn) {
            favBtn.disabled = false;
            favBtn.innerHTML = `<i class="fa-regular fa-heart me-1"></i> Favorite Combo`;
        }
    }
}
