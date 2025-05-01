document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", (e) => {
        e.preventDefault(); // stop page from reloading

        const email = form.email.value.trim();
        const password = form.password.value;

        if (!email || !password){
            alert("Please enter both email and password.");
            return;
        }

        //Get user form local storage, if no data just assign empty string
        const users = JSON.parse(localStorage.getItem("users")) || [];

        //find user with email
        const foundUser = users.find(user => user.email == email);

        //user not found
        if (!foundUser){
            alert("Usesr not found. Please register first.");
            return;
        }

        //wrong password
        if (foundUser.password != password) {
            alert("Incorrect password.");
            return;
        }

        //Stimulate login : store user session, so that we know who is currently logged in
        localStorage.setItem("loggedInUser", JSON.stringify(foundUser));

        alert("Login successful!");
        window.location.href = "index.html"; // redirect to homepage

    });
});