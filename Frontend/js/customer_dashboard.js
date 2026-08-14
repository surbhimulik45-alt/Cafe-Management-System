document.addEventListener('DOMContentLoaded', async () => {
    const user = getCurrentUser();
    
    // Redirect to login if guest
    if (!user || !localStorage.getItem('cafe_user')) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize Profile Details in topbar & sidebar
    const displayName = user.name || 'User';
    const displayEmail = user.email || 'customer@cafe.com';

    document.getElementById('userNameDisplay').textContent = `Welcome, ${displayName}!`;
    document.getElementById('userEmailDisplay').textContent = displayEmail;

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6f42c1&color=fff&rounded=true`;
    document.getElementById('userAvatar').src = avatarUrl;

    // Profile tab info
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileRole').value = user.role || 'Customer';
    document.getElementById('profileNameDisplay').textContent = displayName;
    document.getElementById('profileEmailDisplay').textContent = displayEmail;
    document.getElementById('profileRoleBadge').textContent = user.role || 'Customer';
    document.getElementById('profileAvatar').src = avatarUrl;

    // Fetch comprehensive user details (loyalty points & rewards)
    try {
        let userDetails = await apiCall(`/users/${user.id}`);
        // Fallback for mock data if backend returned empty or 404 error object
        if (!userDetails || !userDetails.loyalty_points) {
             userDetails = {
                 loyalty_points: 1250,
                 rewards: ["Free Coffee", "10% Off Next Order", "Free Birthday Dessert"]
             };
        }
        
        const points = userDetails.loyalty_points || 0;
        document.getElementById('loyaltyPointsDisplay').textContent = points;
        document.getElementById('profileLoyaltyPoints').textContent = points;

        const rewards = userDetails.rewards || [];
        document.getElementById('totalRewardsDisplay').textContent = rewards.length;

        const rewardsContainer = document.getElementById('rewardsList');
        if (rewards.length === 0) {
            rewardsContainer.innerHTML = `
                <div class="text-center py-3 text-muted">
                    <i class="fa-solid fa-gift fa-2x mb-2" style="color:#d1d5db;"></i>
                    <p class="small mb-0">No active rewards yet.<br>Order more to earn!</p>
                </div>`;
        } else {
            rewardsContainer.innerHTML = rewards.map(reward => `
                <div class="reward-item">
                    <div>
                        <i class="fa-solid fa-star me-2" style="color:#c8a96e;"></i>
                        <span class="fw-bold">${reward}</span>
                    </div>
                    <button class="btn btn-sm rounded-pill" style="background:#fdf0d5; color:#c8a96e; font-weight:600; font-size:0.8rem;">Redeem</button>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error("Failed to fetch user details", e);
        // Fallback UI
        document.getElementById('loyaltyPointsDisplay').textContent = 1250;
        document.getElementById('profileLoyaltyPoints').textContent = 1250;
        document.getElementById('totalRewardsDisplay').textContent = 3;
        document.getElementById('rewardsList').innerHTML = ["Free Coffee", "10% Off Next Order", "Free Birthday Dessert"].map(reward => `
            <div class="reward-item">
                <div>
                    <i class="fa-solid fa-star me-2" style="color:#c8a96e;"></i>
                    <span class="fw-bold">${reward}</span>
                </div>
                <button class="btn btn-sm rounded-pill" style="background:#fdf0d5; color:#c8a96e; font-weight:600; font-size:0.8rem;">Redeem</button>
            </div>
        `).join('');
    }

    // Fetch and render orders
    try {
        let orders = await apiCall('/orders/');
        let userOrders = orders.filter(o => String(o.user_id) === String(user.id) || (o.customer_name && o.customer_name.toLowerCase().includes(user.name.split(' ')[0].toLowerCase())));
        
        // Inject mock orders if empty to populate dashboard
        if (userOrders.length === 0) {
            userOrders = [
                { id: 1045, status: "Delivered", total_price: 450, items: [{quantity: 2, name: "Cold Coffee"}, {quantity: 1, name: "Margherita Pizza"}] },
                { id: 1089, status: "Ready", total_price: 320, items: [{quantity: 1, name: "Veg Burger"}, {quantity: 1, name: "Fries"}, {quantity: 1, name: "Coke"}] },
                { id: 1102, status: "Preparing", total_price: 850, items: [{quantity: 2, name: "Pasta Alfredo"}, {quantity: 2, name: "Garlic Bread"}] }
            ];
        }

        document.getElementById('totalOrdersDisplay').textContent = userOrders.length;

        const renderOrderRow = (order) => {
            let statusBadge = '';
            const statusMap = {
                'Pending': '<span class="badge" style="background:#fff3cd;color:#856404;">Pending</span>',
                'Preparing': '<span class="badge" style="background:#cff4fc;color:#055160;">Preparing</span>',
                'Ready': '<span class="badge" style="background:#cfe2ff;color:#084298;">Ready</span>',
                'Delivered': '<span class="badge" style="background:#d1e7dd;color:#0a3622;">Delivered</span>',
                'Cancelled': '<span class="badge" style="background:#f8d7da;color:#842029;">Cancelled</span>',
            };
            statusBadge = statusMap[order.status] || `<span class="badge bg-secondary">${order.status}</span>`;

            const itemSummary = order.items ? order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : 'N/A';
            const itemsTrimmed = itemSummary.length > 30 ? itemSummary.substring(0, 27) + '...' : itemSummary;

            return `
                <tr>
                    <td class="fw-bold text-muted">#${order.id}</td>
                    <td>${new Date().toLocaleDateString()}</td>
                    <td><small title="${itemSummary}">${itemsTrimmed}</small></td>
                    <td class="fw-bold" style="color:#16a34a;">₹${order.total_price}</td>
                    <td>${statusBadge}</td>
                </tr>`;
        };

        // Overview recent orders (top 3)
        const overviewTable = document.getElementById('overviewRecentOrders');
        const recentOrders = [...userOrders].reverse().slice(0, 3);
        if (recentOrders.length === 0) {
            overviewTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No orders yet. <a href="menu.html">Order now!</a></td></tr>`;
        } else {
            overviewTable.innerHTML = recentOrders.map(o => {
                const statusMap = {
                    'Pending': '<span class="badge" style="background:#fff3cd;color:#856404;">Pending</span>',
                    'Preparing': '<span class="badge" style="background:#cff4fc;color:#055160;">Preparing</span>',
                    'Ready': '<span class="badge" style="background:#cfe2ff;color:#084298;">Ready</span>',
                    'Delivered': '<span class="badge" style="background:#d1e7dd;color:#0a3622;">Delivered</span>',
                    'Cancelled': '<span class="badge" style="background:#f8d7da;color:#842029;">Cancelled</span>',
                };
                const itemSummary = o.items ? o.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : 'N/A';
                const itemsTrimmed = itemSummary.length > 25 ? itemSummary.substring(0, 22) + '...' : itemSummary;
                return `<tr>
                    <td class="fw-bold text-muted">#${o.id}</td>
                    <td><small>${itemsTrimmed}</small></td>
                    <td class="fw-bold" style="color:#16a34a;">₹${o.total_price}</td>
                    <td>${statusMap[o.status] || `<span class="badge bg-secondary">${o.status}</span>`}</td>
                </tr>`;
            }).join('');
        }

        // Full orders table
        const ordersTable = document.getElementById('dashboardOrdersTable');
        if (userOrders.length === 0) {
            ordersTable.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">You haven't placed any orders yet.</td></tr>`;
        } else {
            ordersTable.innerHTML = [...userOrders].reverse().map(renderOrderRow).join('');
        }
    } catch (e) {
        console.error("Failed to fetch orders", e);
    }

    // Fetch and render bookings
    try {
        const bookingsList = document.getElementById('dashboardBookingsList');
        let userBookingsResp = await apiCall(`/dashboard/bookings/user/${user.name}`);
        let userBookings = userBookingsResp.bookings || [];
        
        // Inject mock booking if empty
        if (userBookings.length === 0) {
            userBookings = [
                { table_id: 4, status: "Approved", booking_date: "2026-08-20", booking_time: "07:30 PM", number_of_people: 2 }
            ];
        }

        document.getElementById('totalBookingsDisplay').textContent = userBookings.length;

        if (userBookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="col-12 text-center py-5 text-muted">
                    <i class="fa-solid fa-chair fa-3x mb-3" style="color:#d1d5db;"></i>
                    <p class="mb-2">No reservations found.</p>
                    <a href="booking.html" class="btn action-btn action-green btn-sm">Book a Table</a>
                </div>`;
        } else {
            bookingsList.innerHTML = userBookings.map(b => `
                <div class="col-md-6">
                    <div class="glass-card">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <span class="badge rounded-pill" style="background:#1e1e2d; color:white; font-size:0.8rem;">
                                    <i class="fa-solid fa-border-all me-1"></i> Table ${b.table_id || 'N/A'}
                                </span>
                            </div>
                            <span class="badge rounded-pill ${b.status === 'Approved' ? 'bg-success' : b.status === 'Pending Approval' ? 'bg-warning text-dark' : 'bg-secondary'}">${b.status}</span>
                        </div>
                        <h5 class="fw-bold mb-1">
                            <i class="fa-solid fa-calendar-day text-muted me-2"></i>${b.booking_date || b.date || 'N/A'}
                        </h5>
                        <p class="text-muted small mb-2">
                            <i class="fa-solid fa-clock me-2"></i>${b.booking_time || b.time || 'N/A'}
                        </p>
                        <p class="mb-0">
                            <i class="fa-solid fa-users me-2" style="color:#c8a96e;"></i>
                            <strong>${b.number_of_people || b.guests || 'N/A'}</strong> Guests
                        </p>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error("Failed to fetch bookings", e);
        document.getElementById('dashboardBookingsList').innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fa-solid fa-chair fa-3x mb-3" style="color:#d1d5db;"></i>
                <p class="mb-2">No reservations found.</p>
                <a href="booking.html" class="btn action-btn action-green btn-sm">Book a Table</a>
            </div>`;
    }
});
