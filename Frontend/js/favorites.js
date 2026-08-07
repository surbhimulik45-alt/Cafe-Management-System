document.addEventListener("DOMContentLoaded", async () => {
    await renderFavorites();
});

async function renderFavorites() {
    const grid = document.getElementById("favoritesGrid");
    if (!grid) return;

    grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-warning" role="status"></div>
        </div>
    `;

    try {
        const favs = await apiCall('/favorites/').catch(() => []);
        if (!favs || favs.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5 text-muted">
                    <i class="fa-regular fa-heart fa-3x mb-3 text-warning"></i>
                    <h4>No favorites saved yet</h4>
                    <a href="menu.html" class="btn btn-warning mt-2">Explore Menu</a>
                </div>
            `;
            return;
        }

        grid.innerHTML = "";
        favs.forEach(f => {
            const col = document.createElement("div");
            col.className = "col-md-4 col-lg-3";
            col.innerHTML = `
                <div class="card shadow-sm border-0 rounded-4 h-100">
                    <div class="card-body text-center d-flex flex-column justify-content-between">
                        <div>
                            <i class="fa-solid fa-heart text-danger fa-2x mb-2"></i>
                            <h5 class="fw-bold text-dark">${f.item_name}</h5>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-warning btn-sm w-100 mb-2 btn-fav-cart" data-name="${f.item_name}">
                                🛒 Add to Cart
                            </button>
                            <button class="btn btn-outline-danger btn-sm w-100 btn-fav-remove" data-id="${f.id}">
                                Remove Favorite
                            </button>
                        </div>
                    </div>
                </div>
            `;

            col.querySelector(".btn-fav-cart").addEventListener("click", async () => {
                const user = getCurrentUser();
                await apiCall('/cart/', 'POST', {
                    id: Date.now(),
                    user_id: user.id || 1,
                    menu_id: f.menu_id || 1,
                    item_name: f.item_name,
                    quantity: 1,
                    price: 199,
                    total_price: 199
                });
                showToast(`Added ${f.item_name} to cart!`, 'success');
                updateCartCount();
            });

            col.querySelector(".btn-fav-remove").addEventListener("click", async () => {
                await apiCall(`/favorites/${f.id}`, 'DELETE');
                showToast("Removed from favorites", "info");
                await renderFavorites();
            });

            grid.appendChild(col);
        });
    } catch (err) {
        grid.innerHTML = `<div class="col-12 text-danger text-center">Failed to load favorites.</div>`;
    }
}
