document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("regName").value.trim();
            const email = document.getElementById("regEmail").value.trim();
            const password = document.getElementById("regPassword").value.trim();
            const role = document.getElementById("regRole").value || "Customer";

            if (!name || !email || !password) {
                showToast("Please fill in all fields", "warning");
                return;
            }

            try {
                const newUser = {
                    id: Date.now(),
                    name: name,
                    email: email,
                    password: password,
                    role: role
                };

                const response = await apiCall('/auth/register', 'POST', newUser);

                if (response && response.message) {
                    showToast(response.message, "success");
                    // Save user session
                    setCurrentUser({
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role
                    });
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 1200);
                }
            } catch (err) {
                console.error("Registration Error:", err);
            }
        });
    }
});
