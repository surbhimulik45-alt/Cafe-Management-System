let allMenuItems = [];
let allNutritionData = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    await loadMenuAndNutrition();

    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("category");

    if (searchInput) {
        searchInput.addEventListener("input", filterAndRenderMenu);
    }
    if (categorySelect) {
        categorySelect.addEventListener("change", filterAndRenderMenu);
    }
});

async function loadCategories() {
    const categorySelect = document.getElementById("category");
    if (!categorySelect) return;

    try {
        const categories = await apiCall('/categories/');
        if (categories && Array.isArray(categories)) {
            // Keep default "All Categories" option
            categorySelect.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat.name;
                opt.textContent = cat.name;
                categorySelect.appendChild(opt);
            });
        }
    } catch (err) {
        console.warn("Categories fetch fallback:", err);
    }
}

async function loadMenuAndNutrition() {
    const container = document.getElementById("menuContainer");
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Loading Menu...</span>
                </div>
            </div>
        `;
    }

    try {
        const [menuItems, nutritionItems] = await Promise.all([
            apiCall('/menu/'),
            apiCall('/nutrition/').catch(() => [])
        ]);

        allMenuItems = menuItems || [];
        allNutritionData = nutritionItems || [];

        filterAndRenderMenu();
    } catch (err) {
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5 text-danger">
                    <i class="fa-solid fa-exclamation-triangle fa-3x mb-3"></i>
                    <h4>Failed to load menu items</h4>
                    <p>${err.message || 'Please check backend connection.'}</p>
                </div>
            `;
        }
    }
}

function filterAndRenderMenu() {
    const container = document.getElementById("menuContainer");
    const template = document.getElementById("foodCard");
    if (!container || !template) return;

    const searchTerm = (document.getElementById("search")?.value || "").toLowerCase().trim();
    const selectedCategory = document.getElementById("category")?.value || "";

    const filtered = allMenuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                              (item.category && item.category.toLowerCase().includes(searchTerm));
        const matchesCategory = !selectedCategory || 
                                item.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fa-solid fa-utensils fa-3x mb-3"></i>
                <h4>No menu items found</h4>
                <p>Try refining your search query or selecting a different category.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(item => {
        const clone = template.content.cloneNode(true);

        const img = clone.querySelector(".food-image");
        if (img) {
            img.src = item.image || "images/cafe-bg.jpg";
            img.alt = item.name;
        }

        const nameEl = clone.querySelector(".food-name");
        if (nameEl) nameEl.textContent = item.name;

        const descEl = clone.querySelector(".food-description");
        if (descEl) descEl.textContent = item.rating ? `${item.rating} • ${item.category}` : item.category;

        const priceEl = clone.querySelector(".food-price");
        if (priceEl) priceEl.textContent = item.price;

        // Match nutrition info
        const nutInfo = allNutritionData.find(n => n.menu_id === item.id || n.item_name === item.name) || {};
        
        const calEl = clone.querySelector(".food-calories");
        if (calEl) calEl.textContent = nutInfo.calories || item.nutrition || "150 Cal";

        const protEl = clone.querySelector(".food-protein");
        if (protEl) protEl.textContent = nutInfo.protein !== undefined ? nutInfo.protein : "5";

        const carbsEl = clone.querySelector(".food-carbs");
        if (carbsEl) carbsEl.textContent = nutInfo.carbohydrates !== undefined ? nutInfo.carbohydrates : "25";

        const fatEl = clone.querySelector(".food-fat");
        if (fatEl) fatEl.textContent = nutInfo.fat !== undefined ? nutInfo.fat : "4";

        // Add to cart button
        const addCartBtn = clone.querySelector(".add-cart");
        if (addCartBtn) {
            addCartBtn.onclick = () => addToCart(item);
        }

        container.appendChild(clone);
    });
}

async function addToCart(item) {
    const user = getCurrentUser();
    const cartItem = {
        id: Date.now(),
        user_id: user.id || 1,
        menu_id: item.id,
        item_name: item.name,
        quantity: 1,
        price: item.price,
        total_price: item.price
    };

    try {
        await apiCall('/cart/', 'POST', cartItem);
        showToast(`Added ${item.name} to cart!`, 'success');
        updateCartCount();
    } catch (err) {
        console.error("Add to cart error:", err);
    }
}
