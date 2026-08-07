const API_URL = window.location.origin.startsWith('http') ? window.location.origin : "http://127.0.0.1:8000";

// Asynchronous API Fetch Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.detail || `Server error: ${response.statusText}`);
        }
        return data;
    } catch (err) {
        console.error(`API Error on ${endpoint}:`, err);
        showToast(err.message || "Failed to communicate with server", "danger");
        throw err;
    }
}

// User Session Management
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('cafe_user')) || { id: 1, name: "Guest User", role: "Customer" };
    } catch {
        return { id: 1, name: "Guest User", role: "Customer" };
    }
}

function setCurrentUser(user) {
    localStorage.setItem('cafe_user', JSON.stringify(user));
}

function logoutUser() {
    localStorage.removeItem('cafe_user');
    showToast("Logged out successfully", "info");
    setTimeout(() => window.location.href = "login.html", 1000);
}

// Toast Notifications Helper
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    const toastId = 'toast_' + Date.now();
    const bgClass = type === 'success' ? 'bg-success text-white' : 
                    type === 'danger' ? 'bg-danger text-white' : 
                    type === 'warning' ? 'bg-warning text-dark' : 'bg-info text-white';

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    if (window.bootstrap && window.bootstrap.Toast) {
        const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
        bsToast.show();
    } else {
        toastElement.classList.add('show');
        setTimeout(() => toastElement.remove(), 3000);
    }
}

// Cart Counter Helper
async function updateCartCount() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    try {
        const items = await apiCall('/cart/');
        const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? 'inline-block' : 'none';
    } catch (e) {
        console.warn("Could not update cart badge", e);
    }
}

// Initialize session links & Admin link visibility on DOM ready
function updateNavbarSession() {
    const user = getCurrentUser();
    const isExplicitLogin = localStorage.getItem('cafe_user') !== null;
    const isAdmin = isExplicitLogin && user && user.role === 'Admin';

    // Dynamic Admin option visibility: hide for clients/guests, show for admins
    const adminNavElements = document.querySelectorAll('a[href="admin.html"], a[href="./admin.html"], #navAdminItem, .admin-only');
    adminNavElements.forEach(el => {
        const parentLi = el.closest('li');
        const target = parentLi || el;
        if (isAdmin) {
            target.style.display = '';
        } else {
            target.style.display = 'none';
        }
    });

    // Update login / logout state button in navbar if available
    const loginBtn = document.getElementById('navLoginBtn');
    if (loginBtn) {
        if (isExplicitLogin && user && user.name) {
            loginBtn.textContent = `Logout (${user.name})`;
            loginBtn.classList.remove('btn-outline-warning');
            loginBtn.classList.add('btn-outline-danger');
            loginBtn.href = "#";
            loginBtn.onclick = (e) => {
                e.preventDefault();
                logoutUser();
            };
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.classList.remove('btn-outline-danger');
            loginBtn.classList.add('btn-outline-warning');
            loginBtn.href = "login.html";
            loginBtn.onclick = null;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    updateNavbarSession();
});