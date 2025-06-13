// for preview image for profile pic
document.getElementById('photoUpload').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('avatarPreview').style.backgroundImage = `url(${e.target.result})`;
      document.getElementById('avatarPreview').style.backgroundSize = 'cover';
      document.getElementById('avatarPreview').style.backgroundPosition = 'center';
    };
    reader.readAsDataURL(file);
  }
});

//for section + in help center
function showSection(id) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.style.display = 'none';
  });
  // Show the selected one
  document.getElementById(id).style.display = 'block';
}

//sidebar
function toggleSidebar() {
  document.getElementById("mainsidebar").classList.toggle("open");
}

//DOM for toggle button for FAQs
document.addEventListener('DOMContentLoaded', function () {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const toggleButton = item.querySelector('.toggle-button');

    question.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });
});

// change email
const emailModal = document.getElementById("emailModal");
const emailBtn = document.getElementById("changeEmailBtn");
const closeEmailModal = document.getElementById("closeEmailModal");

emailBtn.onclick = () => {
  emailModal.style.display = "block";
};

closeEmailModal.onclick = () => {
  emailModal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target == emailModal) {
    emailModal.style.display = "none";
  }
};

//to change password
const passwordModal = document.getElementById("passwordModal");
const passwordBtn = document.getElementById("changePasswordBtn");
const closePasswordModal = document.getElementById("closePasswordModal");

passwordBtn.onclick = () => {
  passwordModal.style.display = "block";
};

closePasswordModal.onclick = () => {
  passwordModal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target == passwordModal) {
    passwordModal.style.display = "none";
  }
};

function confirmDelete() {
  if (confirm("Are you sure you want to permanently delete your account?")) {
    // Here, you would send a request to your backend to delete the account.
    alert("Account deleted. (Simulated)");
    // Redirect or clear session, etc.
  }
}
//for log out top bar
function confirmLogout() {
  return confirm("Are you sure you want to logout?")
}

//user submit review button on help center section
document.getElementById("submitReviewBtn").addEventListener("click", async () => {
  const username = "testuser"; // TEMPORARY hardcoded username
  const review = document.getElementById("concern").value.trim();

  if (!review) {
    alert("Please enter your concern!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, review })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Your review has been submitted!");
      document.getElementById("concern").value = "";
    } else {
      alert("Failed to submit review: " + data.message);
    }
  } catch (err) {
    console.error("Error details:", err);
    alert("Something went wrong while submitting your review.");
  }
});