document.addEventListener("DOMContentLoaded", async () => {
    await populateMenuDropdown();
    await loadReviews();

    const reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const user = getCurrentUser();

            const selectEl = document.getElementById("reviewMenuSelect");
            const menuId = parseInt(selectEl.value);
            const itemName = selectEl.options[selectEl.selectedIndex]?.text || "Cafe Item";
            const rating = parseInt(document.getElementById("reviewRatingSelect").value) || 5;
            const text = document.getElementById("reviewText").value.trim();

            if (!menuId || !text) {
                showToast("Please select a dish and enter your review", "warning");
                return;
            }

            const newReview = {
                id: Date.now(),
                user_id: user.id || 1,
                menu_id: menuId,
                item_name: itemName,
                rating: rating,
                review: text
            };

            try {
                const response = await apiCall('/reviews/', 'POST', newReview);
                showToast(response.message || "Review submitted successfully!", "success");
                reviewForm.reset();
                await loadReviews();
            } catch (err) {
                console.error("Submit Review Error:", err);
            }
        });
    }
});

async function populateMenuDropdown() {
    const select = document.getElementById("reviewMenuSelect");
    if (!select) return;

    try {
        const menuItems = await apiCall('/menu/').catch(() => []);
        if (menuItems && menuItems.length > 0) {
            select.innerHTML = menuItems.map(item => `
                <option value="${item.id}">${item.name}</option>
            `).join('');
        }
    } catch (e) {
        console.warn("Error populating menu dropdown in reviews", e);
    }
}

async function loadReviews() {
    const container = document.getElementById("reviewsList");
    if (!container) return;

    container.innerHTML = `
        <div class="col-12 text-center py-4">
            <div class="spinner-border text-warning" role="status"></div>
        </div>
    `;

    try {
        const reviews = await apiCall('/reviews/');
        if (!reviews || reviews.length === 0) {
            container.innerHTML = `<div class="col-12 text-muted">No reviews yet. Be the first to post a review!</div>`;
            return;
        }

        container.innerHTML = "";
        reviews.forEach(r => {
            const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(Math.max(0, 5 - (r.rating || 5)));
            const col = document.createElement("div");
            col.className = "col-12";
            col.innerHTML = `
                <div class="card shadow-sm border-0 rounded-3 p-3 bg-light">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="fw-bold mb-0 text-dark">${r.item_name || 'Cafe Special'}</h6>
                        <span class="text-warning fw-bold fs-5">${stars}</span>
                    </div>
                    <p class="text-muted mb-1 font-italic">"${r.review}"</p>
                    <div class="small text-secondary text-end">— User #${r.user_id || 1}</div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (err) {
        container.innerHTML = `<div class="col-12 text-danger">Failed to load reviews.</div>`;
    }
}
