document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById("email").value.trim();
            const passwordInput = document.getElementById("password").value.trim();

            if (!emailInput || !passwordInput) {
                showToast("Please enter email and password", "warning");
                return;
            }

            try {
                const response = await apiCall('/auth/login', 'POST', {
                    email: emailInput,
                    password: passwordInput
                });

                if (response && response.user) {
                    setCurrentUser(response.user);
                    showToast(`Welcome back, ${response.user.name}!`, "success");
                    
                    setTimeout(() => {
                        if (response.user.role === 'Admin') {
                            window.location.href = "admin.html";
                        } else {
                            window.location.href = "menu.html";
                        }
                    }, 1000);
                } else {
                    showToast(response.message || "Login failed", "danger");
                }
            } catch (err) {
                console.error("Login Error:", err);
            }
        });
    }
});

function togglePassword() {
    const passInput = document.getElementById("password");
    if (!passInput) return;
    const icon = document.querySelector(".input-group button i");
    if (passInput.type === "password") {
        passInput.type = "text";
        if (icon) {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    } else {
        passInput.type = "password";
        if (icon) {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    }
}
