document.addEventListener("DOMContentLoaded", async () => {
    await renderOffers();
});

async function renderOffers() {
    const container = document.getElementById("offerContainer");
    if (!container) return;

    try {
        const offers = await apiCall('/offers/').catch(() => []);
        if (offers && offers.length > 0) {
            container.innerHTML = offers.map(o => `
                <div class="col-md-3">
                    <div class="card shadow h-100 border-0 rounded-3">
                        <div class="position-relative">
                            <span class="badge bg-danger position-absolute top-0 end-0 m-2 fs-6">${o.discount_percentage}% OFF</span>
                            <div class="bg-warning text-dark py-4 text-center">
                                <i class="fa-solid fa-gift fa-3x mb-2"></i>
                                <h5 class="fw-bold mb-0">${o.item_name}</h5>
                            </div>
                        </div>
                        <div class="card-body text-center d-flex flex-column justify-content-between">
                            <div>
                                <h5 class="text-success fw-bold">${o.description || 'Special Deal'}</h5>
                                <p class="text-muted small">Special Offer Price: <strong class="text-dark">₹${o.offer_price}</strong> <del class="text-muted">₹${o.original_price}</del></p>
                            </div>
                            <button class="btn btn-warning w-100 fw-bold mt-3 claim-offer-btn" data-name="${o.item_name}" data-price="${o.offer_price}">
                                Claim & Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.claim-offer-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const itemName = btn.getAttribute('data-name');
                    const price = parseFloat(btn.getAttribute('data-price')) || 99;
                    const user = getCurrentUser();

                    await apiCall('/cart/', 'POST', {
                        id: Date.now(),
                        user_id: user.id || 1,
                        menu_id: 99,
                        item_name: `${itemName} (Special Offer)`,
                        quantity: 1,
                        price: price,
                        total_price: price
                    });

                    showToast(`Claimed ${itemName} offer! Added to cart`, 'success');
                    updateCartCount();
                });
            });
        }
    } catch (err) {
        console.error("Error loading offers:", err);
    }
}
