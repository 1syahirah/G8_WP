document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser")); // find out which user is currently login

    if (!user) {
        alert("Your're not logged in.");
        window.location.href = "login.html"; //if there is no user, display message and go to login page
        return;
    }

    document.getElementById("user-name").textContent = user.name; // the span element in index.html

    const profilePic = document.getElementById("profile-pic");
    if (user.profilePic) {
        profilePic.src = "assets/" + user.profilePic;
    } else {
        profilePic.style.display = "none";
    }

    function logout() {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    }

    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            logout();
        });
    }
});