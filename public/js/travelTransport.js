(async function () {
  const carousel = document.querySelector('.carousel');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const url = '/api/transports';

  try {
    const [transportRes, favRes] = await Promise.all([
      fetch(url),
      fetch('/api/favourites')
    ]);

    const transports = await transportRes.json();
    const favourites = await favRes.json();

    carousel.innerHTML = "";

    if (!transports || transports.length === 0) {
      carousel.innerHTML = "<p>No transport options available.</p>";
      return;
    }

    transports.forEach(place => {
      const name = place.name || "Unnamed";
      const imgPath = place.image
        ? `${window.location.origin}/${place.image.replace(/^public\//, '')}`
        : "https://via.placeholder.com/300x200?text=No+Image";

      const isSaved = favourites.some(fav => fav.name === name && fav.type === 'TRANSPORT');

      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <img src="${imgPath}" alt="${name}" />
        <strong>${name}</strong>
        <h3>TRANSPORT</h3>
        <button 
          class="save-btn" 
          data-name="${name}" 
          data-type="TRANSPORT" 
          data-img="${imgPath}"
          style="${isSaved ? 'background-color: #4a5a42; color: white;' : ''}"
          ${isSaved ? 'disabled' : ''}>
          ${isSaved ? '✓ Saved' : '♥ Save'}
        </button>
      `;

      carousel.appendChild(card);
    });

    // Setup carousel scroll
    const card = document.querySelector('.card');
    if (card) {
      const cardWidth = card.offsetWidth + 20;

      prevBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: -cardWidth * 3, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: cardWidth * 3, behavior: 'smooth' });
      });
    }

    // save to db btn listener
    addBtnFavourite();

  } catch (err) {
    console.error("Failed to load transport data or favourites:", err);
    carousel.innerHTML = "<p style='color:red;'>Couldn't load transport options.</p>";
  }

  // Sidebar toggle
  window.toggleSidebar = function () {
    document.getElementById("mainsidebar").classList.toggle("open");
  };

  // Logout confirmation
  window.confirmLogout = function () {
    return confirm("Are you sure you want to logout?");
  };
})();
