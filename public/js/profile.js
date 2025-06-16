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
    // Submit a hidden form to trigger backend delete route
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/deleteProfile";
    document.body.appendChild(form);
    form.submit();
  }
}
//for log out top bar
function confirmLogout() {
  return confirm("Are you sure you want to logout?")
}

//user submit review button on help center section
function submitReview() {
    const reviewText = document.getElementById('concern').value;

    if (!reviewText) {
      alert("Please enter a review first.");
      return;
    }

    fetch('http://localhost:3000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // important for sending cookie with token
      body: JSON.stringify({ review: reviewText })
    })
    .then(response => {
      if (response.ok) {
        alert("Your review has been submitted!");
        document.getElementById('concern').value = ''; // clear input
      } else {
        alert("Something went wrong while submitting your review.");
      }
    })
    .catch(err => {
      console.error("Error details:", err);
      alert("Something went wrong while submitting your review.");
    });
  }


  //favourites
  document.addEventListener('DOMContentLoaded', displayFavourites);

// Util: background & text color
function getTypeColor(type) {
  switch (type.toUpperCase()) {
    case 'ACTIVITIES': return '#e3f2fd';
    case 'ACCOMMODATION': return '#fff3e0';
    case 'TRANSPORT': return '#e8f5e9';
    default: return '#f5f5f5';
  }
}

function getTypeTextColor(type) {
  switch(type.toUpperCase()) {
    case 'ACTIVITIES': return '#1976d2';
    case 'ACCOMMODATION': return '#e65100';
    case 'TRANSPORT': return '#2e7d32';
    default: return '#616161';
  }
}

// Create new favorite-card structure
function createFavoriteCard(item) {
  const card = document.createElement('div');
  card.className = 'favorite-card';

  card.innerHTML = `
    <div class="card-image-container">
      <img src="${item.image || 'https://via.placeholder.com/120x120?text=No+Image'}" alt="${item.name}">
      <button class="delete-favorite-btn" title="Remove from favorites">×</button>
    </div>
    <div class="card-content">
      <strong>${item.name}</strong>
      <div style="background: ${getTypeColor(item.type)};
                  color: ${getTypeTextColor(item.type)};
                  font-size: 0.85rem;
                  font-weight: 600;
                  margin-bottom: 12px;
                  padding: 3px 8px; 
                  border-radius: 4px;">
        ${item.type}
      </div>
    </div>
  `;

  card.querySelector('.delete-favorite-btn').addEventListener('click', () => {
    removeFavorite(item);
  });

  return card;
}

// Display favourites in new layout
async function displayFavourites() {
  const container = document.querySelector('.favorites-container2');
  const countDisplay = document.querySelector('.favorites-count');
  const emptyState = document.querySelector('.empty-favorites');

  container.innerHTML = ""; // Clear cards

  try {
    const res = await fetch('/api/favourites');
    const favourites = await res.json();

    if (favourites.length === 0) {
      container.style.display = 'none';
      emptyState.style.display = 'block';
      countDisplay.textContent = '0 items';
      return;
    }

    container.style.display = 'flex';
    emptyState.style.display = 'none';
    countDisplay.textContent = `${favourites.length} item${favourites.length > 1 ? 's' : ''}`;

    for (const item of favourites) {
      const card = createFavoriteCard(item);
      container.appendChild(card);
    }

  } catch (err) {
    console.error("Error loading favourites:", err);
    container.innerHTML = "<p style='color:red;'>Failed to load favourites.</p>";
  }
}

// DELETE fav (keep existing logic, but triggers full refresh)
function removeFavorite(item) {
  fetch(`/api/favourites/${encodeURIComponent(item.name)}`, {
    method: 'DELETE'
  })
  .then(res => {
    if (res.ok) {
      displayFavourites(); // Refresh cards
    } else {
      alert("Failed to remove favorite.");
    }
  })
  .catch(err => {
    console.error("Remove error:", err);
    alert("Error removing favorite.");
  });
}
