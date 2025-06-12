document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser")); // find out which user is currently login

    if (!user) {
        alert("Your're not logged in.");
        window.location.href = "/login"; //if there is no user, display message and go to login page
        return;
    }

    document.getElementById("user-name").textContent = user.name; // the span element in index.html, change based of the current user name

    //display user profile picture
    const profilePic = document.getElementById("profile-pic");
    if (user.profilePic) {
        profilePic.src = "/assets/" + user.profilePic;
    } else {
        profilePic.src = "/assets/profile-pics/default-profile-pic.png";
    }


    //if the logout nav is clicked, call the logout function
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            logout();
        });
    }

    //logout function
    function logout() {
        localStorage.removeItem("loggedInUser");
        window.location.href = "/login";
    }
});