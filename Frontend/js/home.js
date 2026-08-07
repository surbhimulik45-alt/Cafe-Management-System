document.addEventListener("DOMContentLoaded", () => {
    // Session state button update
    const user = getCurrentUser();
    const loginBtn = document.getElementById('navLoginBtn');
    if (loginBtn) {
        if (user && user.email) {
            loginBtn.textContent = `👤 ${user.name || 'Account'}`;
            loginBtn.href = "#";
            loginBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm(`Logged in as ${user.name} (${user.email}). Do you want to log out?`)) {
                    logoutUser();
                }
            };
        }
    }

    // Card animation effects
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-5px)";
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0)";
        });
    });
});