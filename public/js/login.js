document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Stop page reload

        const email = form.email.value.trim();
        const password = form.password.value;

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful!");

                // Save token to localStorage to "simulate" user being logged in
                localStorage.setItem("token", data.token);
                localStorage.setItem("loggedInUserEmail", email);

                // Redirect to homepage/dashboard
                window.location.href = "/";
            } else {
                alert(data.msg || "Login failed.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Error connecting to server. Please try again.");
        }
    });
});
