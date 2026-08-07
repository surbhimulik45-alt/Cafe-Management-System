document.addEventListener("DOMContentLoaded", async () => {
    const user = getCurrentUser();
    const isExplicitLogin = localStorage.getItem('cafe_user') !== null;
    if (!isExplicitLogin || !user || user.role !== 'Admin') {
        showToast("Access Denied: Admin privileges required.", "danger");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
        return;
    }

    await loadAdminSummary();
    await loadAdminMenu();
    await loadAdminOrders();
    await loadAdminBookings();
    await loadAdminUsers();
    await loadAdminTables();

    const addMenuForm = document.getElementById("addMenuForm");
    if (addMenuForm) {
        addMenuForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("addName").value.trim();
            const category = document.getElementById("addCategory").value.trim();
            const price = parseFloat(document.getElementById("addPrice").value) || 149;
            const image = document.getElementById("addImage").value.trim() || "images/cafe-bg.jpg";

            const newItem = {
                id: Date.now(),
                name: name,
                category: category,
                price: price,
                image: image,
                rating: "★★★★★",
                nutrition: "180 Cal"
            };

            try {
                await apiCall('/menu/', 'POST', newItem);
                showToast("New menu item added!", "success");
                addMenuForm.reset();

                // Close modal
                const modalEl = document.getElementById("addMenuModal");
                if (modalEl && window.bootstrap) {
                    const bsModal = bootstrap.Modal.getInstance(modalEl);
                    if (bsModal) bsModal.hide();
                }

                await loadAdminSummary();
                await loadAdminMenu();
            } catch (err) {
                console.error("Add Menu Item Error:", err);
            }
        });
    }
});

async function loadAdminSummary() {
    try {
        const summary = await apiCall('/admin/dashboard/summary').catch(() => null);
        const menuItems = await apiCall('/menu/').catch(() => []);
        const orders = await apiCall('/orders/').catch(() => []);
        const bookings = await apiCall('/booking/').catch(() => []);
        const users = await apiCall('/users/').catch(() => []);

        document.getElementById("statMenuItems").textContent = menuItems.length || summary?.total_menu_items || 30;
        document.getElementById("statOrders").textContent = orders.length || summary?.total_orders || 120;
        document.getElementById("statBookings").textContent = bookings.length || summary?.total_bookings || 18;
        document.getElementById("statUsers").textContent = users.length || summary?.total_users || 25;
    } catch (e) {
        console.warn("Error loading admin summary stats", e);
    }
}

async function loadAdminMenu() {
    const table = document.getElementById("adminMenuTable");
    if (!table) return;

    try {
        const menuItems = await apiCall('/menu/').catch(() => []);
        if (!menuItems || menuItems.length === 0) {
            table.innerHTML = `<tr><td colspan="6" class="text-center py-4">No menu items found.</td></tr>`;
            return;
        }

        table.innerHTML = menuItems.map(item => `
            <tr>
                <td class="fw-bold">${item.id}</td>
                <td>
                    <img src="${item.image || 'images/cafe-bg.jpg'}" height="45" width="45" class="rounded object-fit-cover">
                </td>
                <td class="fw-bold text-dark">${item.name}</td>
                <td><span class="badge bg-light text-dark border">${item.category || 'General'}</span></td>
                <td class="fw-bold text-success">₹${item.price}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger btn-del-menu" data-id="${item.id}">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

        table.querySelectorAll('.btn-del-menu').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm(`Delete menu item #${id}?`)) {
                    await apiCall(`/menu/${id}`, 'DELETE');
                    showToast("Menu item deleted", "info");
                    await loadAdminSummary();
                    await loadAdminMenu();
                }
            });
        });
    } catch (err) {
        table.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Failed to fetch menu items.</td></tr>`;
    }
}

async function loadAdminOrders() {
    const table = document.getElementById("adminOrdersTable");
    if (!table) return;

    try {
        const orders = await apiCall('/orders/').catch(() => []);
        if (!orders || orders.length === 0) {
            table.innerHTML = `<tr><td colspan="6" class="text-center py-4">No active orders.</td></tr>`;
            return;
        }

        table.innerHTML = orders.map(o => `
            <tr>
                <td class="fw-bold">#${o.id}</td>
                <td>${o.customer_name || 'Guest'}</td>
                <td class="small">${Array.isArray(o.items) ? o.items.join(', ') : o.items}</td>
                <td class="fw-bold text-success">₹${o.total_price || 0}</td>
                <td>
                    <span class="badge ${o.status === 'Completed' || o.status === 'Delivered' ? 'bg-success' : 'bg-warning text-dark'}">
                        ${o.status || 'Pending'}
                    </span>
                </td>
                <td class="text-end">
                    <select class="form-select form-select-sm d-inline-block w-auto order-status-select" data-id="${o.id}">
                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Preparing" ${o.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="Completed" ${o.status === 'Completed' || o.status === 'Delivered' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
            </tr>
        `).join('');

        table.querySelectorAll('.order-status-select').forEach(sel => {
            sel.addEventListener('change', async () => {
                const id = sel.getAttribute('data-id');
                const newStatus = sel.value;
                const existingOrder = orders.find(o => o.id == id) || { id: parseInt(id) };

                const updatedOrder = {
                    ...existingOrder,
                    status: newStatus
                };

                await apiCall(`/orders/${id}`, 'PUT', updatedOrder).catch(() => {});
                showToast(`Order #${id} status updated to ${newStatus}`, "success");
                await loadAdminOrders();
            });
        });

    } catch (err) {
        table.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Failed to fetch orders.</td></tr>`;
    }
}

async function loadAdminBookings() {
    const table = document.getElementById("adminBookingsTable");
    if (!table) return;

    try {
        const bookings = await apiCall('/booking/').catch(() => []);
        if (!bookings || bookings.length === 0) {
            table.innerHTML = `<tr><td colspan="7" class="text-center py-4">No reservations.</td></tr>`;
            return;
        }

        table.innerHTML = bookings.map(b => `
            <tr>
                <td class="fw-bold">${b.id}</td>
                <td class="fw-bold text-dark">${b.customer_name}</td>
                <td>${b.phone_number || 'N/A'}</td>
                <td>${b.table_type || 'Table'}</td>
                <td>${b.number_of_people || 2}</td>
                <td>${b.booking_date} @ ${b.booking_time}</td>
                <td>
                    <span class="badge ${b.status === 'Approved' || b.status === 'Checked In' || b.status === 'Occupied' ? 'bg-success' : b.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'}">
                        ${b.status || 'Pending Approval'}
                    </span>
                </td>
                <td class="text-end">
                    <select class="form-select form-select-sm d-inline-block w-auto booking-status-select" data-id="${b.id}">
                        <option value="Pending Approval" ${b.status === 'Pending Approval' ? 'selected' : ''}>Pending</option>
                        <option value="Approved" ${b.status === 'Approved' ? 'selected' : ''}>Approve</option>
                        <option value="Rejected" ${b.status === 'Rejected' || b.status === 'Cancelled' ? 'selected' : ''}>Reject/Cancel</option>
                    </select>
                </td>
            </tr>
        `).join('');

        table.querySelectorAll('.booking-status-select').forEach(sel => {
            sel.addEventListener('change', async () => {
                const id = sel.getAttribute('data-id');
                const newStatus = sel.value;
                const existingBooking = bookings.find(b => b.id == id) || { id: parseInt(id) };

                const updatedBooking = { ...existingBooking, status: newStatus };
                await apiCall(`/booking/${id}`, 'PUT', updatedBooking).catch(() => {});
                showToast(`Booking #${id} status updated to ${newStatus}`, "success");
                
                await loadAdminBookings();
            });
        });
    } catch (e) {
        table.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Failed to fetch bookings.</td></tr>`;
    }
}

async function loadAdminTables() {
    const grid = document.getElementById("adminFloorPlanGrid");
    if (!grid) return;

    grid.innerHTML = `<div class="text-center py-4 w-100"><div class="spinner-border text-warning" role="status"></div></div>`;

    try {
        const tablesList = await apiCall('/tables/').catch(() => []);
        if (!tablesList || tablesList.length === 0) {
            grid.innerHTML = `<p class="text-muted text-center py-4 w-100">No tables configured.</p>`;
            return;
        }

        grid.innerHTML = "";
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        grid.style.gap = '2rem';

        tablesList.forEach(table => {
            const wrapper = document.createElement("div");
            wrapper.className = `table-wrapper text-center mx-auto`;
            wrapper.setAttribute("data-id", table.id);

            // Determine status text class
            const statusClass = `status-${table.status.toLowerCase()}`;
            
            // Create seat dots
            let seatDotsHTML = "";
            for (let s = 0; s < table.seats; s++) {
                seatDotsHTML += `<div class="seat-dot"></div>`;
            }

            wrapper.innerHTML = `
                ${seatDotsHTML}
                <div class="table-graphic ${statusClass}" style="cursor: pointer;">
                    T${table.id}
                </div>
                <div class="mt-2 small fw-bold text-muted">${table.status}</div>
                <div class="mt-1">
                    ${table.status === 'Available' ? 
                        `<button class="btn btn-sm btn-outline-danger w-100 block-btn" data-id="${table.id}">Block</button>` : 
                        table.status === 'Blocked' ?
                        `<button class="btn btn-sm btn-outline-success w-100 unblock-btn" data-id="${table.id}">Unblock</button>` :
                        `<button class="btn btn-sm btn-outline-dark w-100 checkout-btn" data-id="${table.id}">Clear</button>`
                    }
                </div>
            `;

            // Add action listeners
            const blockBtn = wrapper.querySelector('.block-btn');
            if (blockBtn) blockBtn.addEventListener('click', () => toggleTableStatus(table.id, 'block'));

            const unblockBtn = wrapper.querySelector('.unblock-btn');
            if (unblockBtn) unblockBtn.addEventListener('click', () => toggleTableStatus(table.id, 'unblock'));

            const checkoutBtn = wrapper.querySelector('.checkout-btn');
            if (checkoutBtn) checkoutBtn.addEventListener('click', () => toggleTableStatus(table.id, 'checkout'));

            grid.appendChild(wrapper);
        });

    } catch (e) {
        grid.innerHTML = `<p class="text-danger text-center w-100">Error rendering tables.</p>`;
    }
}

async function toggleTableStatus(tableId, action) {
    try {
        await apiCall(`/tables/${tableId}/${action}`, 'POST', { reason: "Admin Request" });
        showToast(`Table #${tableId} updated!`, "success");
        await loadAdminTables();
    } catch (e) {
        console.error("Table action error:", e);
    }
}

async function loadAdminUsers() {
    const table = document.getElementById("adminUsersTable");
    if (!table) return;

    try {
        const users = await apiCall('/users/').catch(() => []);
        if (!users || users.length === 0) {
            table.innerHTML = `<tr><td colspan="5" class="text-center py-4">No users found.</td></tr>`;
            return;
        }

        table.innerHTML = users.map(u => `
            <tr>
                <td class="fw-bold">${u.id}</td>
                <td class="fw-bold text-dark">${u.name}</td>
                <td>${u.email}</td>
                <td>${u.phone || 'N/A'}</td>
                <td><span class="badge ${u.role === 'Admin' ? 'bg-danger' : 'bg-secondary'}">${u.role || 'Customer'}</span></td>
            </tr>
        `).join('');
    } catch (e) {
        table.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Failed to fetch users.</td></tr>`;
    }
}
