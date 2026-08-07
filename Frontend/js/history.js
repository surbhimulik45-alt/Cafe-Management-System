document.addEventListener("DOMContentLoaded", async () => {
    await renderOrderHistory();
});

async function renderOrderHistory() {
    const tableBody = document.getElementById("orderHistoryTable");
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4">
                <div class="spinner-border text-warning" role="status"></div>
            </td>
        </tr>
    `;

    try {
        const orders = await apiCall('/orders/').catch(() => []);
        if (!orders || orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-receipt fa-3x mb-3"></i>
                        <h5>No orders found</h5>
                        <a href="menu.html" class="btn btn-warning mt-2">Place an Order</a>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = "";
        orders.forEach(o => {
            const tr = document.createElement("tr");
            const itemsList = Array.isArray(o.items) ? o.items.join(', ') : (o.items || "Cafe Item");
            const statusBadgeClass = o.status === 'Completed' || o.status === 'Delivered' ? 'bg-success' :
                                     o.status === 'Preparing' ? 'bg-warning text-dark' : 'bg-primary';

            tr.innerHTML = `
                <td class="fw-bold">#${o.id}</td>
                <td>
                    <span class="fw-semibold text-dark">${itemsList}</span>
                    <div class="small text-muted">Customer: ${o.customer_name || 'Guest'}</div>
                </td>
                <td class="fw-bold text-success">₹${o.total_price || 0}</td>
                <td><span class="badge ${statusBadgeClass}">${o.status || 'Pending'}</span></td>
                <td class="text-end">
                    <a href="tracking.html?order_id=${o.id}" class="btn btn-sm btn-outline-dark me-1">
                        <i class="fa-solid fa-truck"></i> Track
                    </a>
                    <a href="invoice.html?order_id=${o.id}&amount=${o.total_price}" class="btn btn-sm btn-outline-warning">
                        <i class="fa-solid fa-file-invoice"></i> Invoice
                    </a>
                </td>
            `;

            tableBody.appendChild(tr);
        });

    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Failed to fetch order history.</td></tr>`;
    }
}
