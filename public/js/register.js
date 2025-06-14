document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const phoneNumber = form.phoneNum.value;
    const profilePic = form.profilePic.files[0];

    if (!name || !email || !password || !phoneNumber) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData(); // Required for uploading files
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNum", phoneNumber);
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        body: formData,
      });

      if (response.redirected) {
        window.location.href = response.url; // Redirect if server responds with redirect
      } else {
        const text = await response.text();
        console.log(text);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again.");
    }
  });
});
