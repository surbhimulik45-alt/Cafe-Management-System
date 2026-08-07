document.addEventListener("DOMContentLoaded", async () => {
    const user = getCurrentUser();
    
    // Auto-fill customer details from user session
    const nameInput = document.getElementById("bookName");
    if (nameInput && user && user.name) {
        nameInput.value = user.name;
    }

    const phoneInput = document.getElementById("bookPhone");
    if (phoneInput && user && user.phone) {
        phoneInput.value = user.phone;
    }

    // Set default date to today
    const dateInput = document.getElementById("bookDate");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.min = today;
    }

    const timeInput = document.getElementById("bookTime");
    if (timeInput) {
        timeInput.value = "19:30";
    }

    // Render floor plan and current bookings
    await refreshFloorPlan();
    await renderBookings();

    // Floor plan reload when date/time inputs change to dynamically query slots
    if (dateInput) dateInput.addEventListener("change", refreshFloorPlan);
    if (timeInput) timeInput.addEventListener("change", refreshFloorPlan);

    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("bookName").value.trim();
            const phone = document.getElementById("bookPhone").value.trim();
            const date = document.getElementById("bookDate").value;
            const time = document.getElementById("bookTime").value;
            const guests = parseInt(document.getElementById("bookGuests").value) || 2;
            const tableId = parseInt(document.getElementById("selectedTableId").value);

            if (!tableId) {
                showToast("Please choose a table from the seating layout map!", "warning");
                return;
            }

            // Find selected table to get its type text
            let tableText = "Standard Table";
            try {
                const tables = await apiCall('/tables/');
                const tableObj = tables.find(t => t.id === tableId);
                if (tableObj) {
                    tableText = tableObj.name;
                }
            } catch {}

            const bookingId = Math.floor(100000 + Math.random() * 900000);

            const newBooking = {
                id: bookingId,
                user_id: user.id || 1,
                customer_name: name,
                phone_number: phone,
                table_id: tableId,
                table_type: tableText,
                number_of_people: guests,
                booking_date: date,
                booking_time: time,
                status: "Pending Approval"
            };

            try {
                const response = await apiCall('/booking/', 'POST', newBooking);
                showToast(response.message || "Reservation requested successfully!", "success");
                
                // Clear selection
                document.getElementById("selectedTableId").value = "";
                
                // Refresh views
                await refreshFloorPlan();
                await renderBookings();
                
                // Pop up ticket modal with QR
                showTicketModal(newBooking);
            } catch (err) {
                console.error("Booking Error:", err);
            }
        });
    }
});

// Refresh Seating Floor Plan
async function refreshFloorPlan() {
    const grid = document.getElementById("floorPlanGrid");
    if (!grid) return;

    grid.innerHTML = `
        <div class="text-center py-4 col-span-4" style="grid-column: 1 / -1;">
            <div class="spinner-border text-warning" role="status"></div>
        </div>
    `;

    try {
        const tablesList = await apiCall('/tables/').catch(() => []);
        if (!tablesList || tablesList.length === 0) {
            grid.innerHTML = `<p class="text-muted text-center py-4" style="grid-column:1/-1;">No seating spots configured.</p>`;
            return;
        }

        grid.innerHTML = "";
        tablesList.forEach(table => {
            const wrapper = document.createElement("div");
            wrapper.className = `table-wrapper`;
            wrapper.setAttribute("data-id", table.id);
            wrapper.setAttribute("data-seats", table.seats);

            // Determine status text class
            const statusClass = `status-${table.status.toLowerCase()}`;
            if (table.status !== "Available") {
                wrapper.classList.add("disabled");
            }

            // Create seat dots
            let seatDotsHTML = "";
            for (let s = 0; s < table.seats; s++) {
                seatDotsHTML += `<div class="seat-dot"></div>`;
            }

            wrapper.innerHTML = `
                ${seatDotsHTML}
                <div class="table-graphic ${statusClass}">
                    T${table.id}
                </div>
            `;

            // Click listener
            if (table.status === "Available") {
                wrapper.addEventListener("click", () => {
                    // Deselect previous
                    document.querySelectorAll(".table-wrapper").forEach(w => w.classList.remove("selected"));
                    // Select clicked
                    wrapper.classList.add("selected");
                    document.getElementById("selectedTableId").value = table.id;
                });
            }

            grid.appendChild(wrapper);
        });

    } catch (e) {
        grid.innerHTML = `<p class="text-danger text-center" style="grid-column:1/-1;">Error rendering seating configuration.</p>`;
    }
}

// Render Bookings List
async function renderBookings() {
    const container = document.getElementById("bookingsListContainer");
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-warning" role="status"></div>
        </div>
    `;

    try {
        const bookings = await apiCall('/booking/');
        const user = getCurrentUser();
        
        // Filter bookings belonging to current user session (or show all for guest/demo convenience)
        const userBookings = bookings.filter(b => b.user_id == user.id);

        if (!userBookings || userBookings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fa-solid fa-chair fa-3x mb-3 text-opacity-50 text-warning"></i>
                    <p>No active reservations found.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        userBookings.forEach(b => {
            const card = document.createElement("div");
            
            // Color code card borders based on approval
            let borderClass = "border-warning";
            let statusColor = "bg-warning text-dark";
            if (b.status === "Approved") {
                borderClass = "border-success";
                statusColor = "bg-success text-white";
            } else if (b.status === "Checked In" || b.status === "Occupied") {
                borderClass = "border-info";
                statusColor = "bg-info text-white";
            } else if (b.status === "Cancelled" || b.status === "Rejected") {
                borderClass = "border-danger";
                statusColor = "bg-danger text-white";
            }

            card.className = `card border-start ${borderClass} border-4 shadow-sm mb-3`;
            card.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="fw-bold mb-1">${b.customer_name}</h5>
                            <p class="text-muted mb-1 small">
                                <i class="fa-solid fa-phone me-1"></i> ${b.phone_number || 'N/A'} • 
                                <i class="fa-solid fa-users me-1"></i> ${b.number_of_people || 2} Guests
                            </p>
                            <span class="badge bg-dark">${b.table_type || `Table #${b.table_id}`}</span>
                            <span class="badge ${statusColor} ms-1">${b.status || 'Pending Approval'}</span>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold text-primary">${b.booking_date || ''}</div>
                            <div class="small text-muted mb-2">${b.booking_time || ''}</div>
                            
                            <div class="d-flex gap-1 justify-content-end">
                                <button class="btn btn-sm btn-outline-dark btn-view-ticket" data-id="${b.id}">
                                    <i class="fa-solid fa-qrcode"></i> Ticket
                                </button>
                                
                                ${b.status === "Approved" ? `
                                    <button class="btn btn-sm btn-success btn-check-in" data-id="${b.id}" data-table="${b.table_id}">
                                        Check In
                                    </button>
                                ` : ''}

                                ${b.status !== "Cancelled" && b.status !== "Checked In" ? `
                                    <button class="btn btn-sm btn-outline-danger btn-cancel-booking" data-id="${b.id}">
                                        Cancel
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // View ticket QR click
            card.querySelector(".btn-view-ticket").addEventListener("click", () => {
                showTicketModal(b);
            });

            // Cancel click
            const cancelBtn = card.querySelector(".btn-cancel-booking");
            if (cancelBtn) {
                cancelBtn.addEventListener("click", () => cancelBooking(b.id));
            }

            // Check In click
            const checkInBtn = card.querySelector(".btn-check-in");
            if (checkInBtn) {
                checkInBtn.addEventListener("click", () => checkInCustomer(b, card));
            }

            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = `<p class="text-danger">Failed to load reservations.</p>`;
    }
}

// Cancel Booking
async function cancelBooking(id) {
    if (confirm("Are you sure you want to cancel this reservation?")) {
        try {
            // Retrieve booking details to know the status
            const booking = await apiCall(`/booking/${id}`).catch(() => null);
            if (booking) {
                booking.status = "Cancelled";
                await apiCall(`/booking/${id}`, 'PUT', booking);
                showToast("Reservation cancelled successfully", "info");
                await refreshFloorPlan();
                await renderBookings();
            }
        } catch (err) {
            console.error("Cancel Booking Error:", err);
        }
    }
}

// Check In Customer (Changes booking status to Checked In and Table status to Occupied)
async function checkInCustomer(booking, card) {
    try {
        // Step 1: Update booking status
        const updatedBooking = { ...booking, status: "Checked In" };
        await apiCall(`/booking/${booking.id}`, 'PUT', updatedBooking);
        
        // Step 2: Trigger backend table checkin
        if (booking.table_id) {
            await apiCall(`/tables/${booking.table_id}/checkin`, 'POST', { booking_id: booking.id });
        }

        showToast("Welcome! Checked in successfully. Table is now Occupied.", "success");
        await refreshFloorPlan();
        await renderBookings();
    } catch (err) {
        console.error("Check In Error:", err);
    }
}

// Show Booking QR Ticket Modal
function showTicketModal(booking) {
    const modalEl = document.getElementById("ticketModal");
    if (!modalEl) return;

    document.getElementById("ticketCustomerName").textContent = booking.customer_name;
    document.getElementById("ticketId").textContent = `#${booking.id}`;
    document.getElementById("ticketTable").textContent = booking.table_type || `Table #${booking.table_id}`;
    document.getElementById("ticketGuests").textContent = `${booking.number_of_people} Guests`;
    document.getElementById("ticketDate").textContent = booking.booking_date;
    document.getElementById("ticketTime").textContent = booking.booking_time;

    const statusBadge = document.getElementById("ticketStatus");
    if (statusBadge) {
        statusBadge.textContent = booking.status || "Pending Approval";
        statusBadge.className = `badge ${booking.status === 'Approved' ? 'bg-success' : booking.status === 'Checked In' ? 'bg-info' : 'bg-warning text-dark'}`;
    }

    const qrContainer = document.getElementById("ticketQrContainer");
    if (qrContainer) {
        qrContainer.innerHTML = generateMockQRCode(`CafeDelight-Booking-${booking.id}`);
    }

    if (window.bootstrap) {
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
    }
}

// High Fidelity SVG QR Code Generator
function generateMockQRCode(text) {
    const size = 180;
    let pathData = "";
    
    // Create structured blocks representing QR data grids
    for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
            // Skip finder corners
            if ((r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)) continue;
            // Skip middle center for coffee cup logo
            if (r > 8 && r < 12 && c > 8 && c < 12) continue;
            
            // Structured deterministic grid pattern
            const sum = r * 2.3 + c * 3.7;
            if (Math.sin(sum) > -0.25) {
                pathData += `M${c * 8 + 8},${r * 8 + 8}h6v6h-6z `;
            }
        }
    }
    
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect width="180" height="180" fill="#ffffff"/>
            <!-- Finder Pattern Top-Left -->
            <path d="M8,8h56v56h-56zM16,16h40v40h-40zM24,24h24v24h-24z" fill="#1a0f0a"/>
            <!-- Finder Pattern Top-Right -->
            <path d="M116,8h56v56h-56zM124,16h40v40h-40zM132,24h24v24h-24z" fill="#1a0f0a"/>
            <!-- Finder Pattern Bottom-Left -->
            <path d="M8,116h56v56h-56zM16,124h40v40h-40zM24,132h24v24h-24z" fill="#1a0f0a"/>
            <!-- Random Data Blocks -->
            <path d="${pathData}" fill="#2c1810"/>
            <!-- Center logo coffee cup -->
            <rect x="72" y="72" width="36" height="36" rx="6" fill="#ff9800" stroke="#1a0f0a" stroke-width="2"/>
            <text x="90" y="94" font-family="'Outfit', sans-serif" font-size="18" fill="#ffffff" text-anchor="middle">☕</text>
        </svg>
    `;
}
