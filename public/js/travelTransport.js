(function () {
  const carousel = document.querySelector('.carousel');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const url = '/api/transports';

  // Expose globally so the main script can call it
  window.renderTransportCarousel = function (filterType = 'All') {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        carousel.innerHTML = "";

        // Filter by type
        const filteredData = filterType === 'All'
          ? data
          : data.filter(item => item.type === filterType);

        if (filteredData.length === 0) {
          carousel.innerHTML = "<p>No transport options found for this type.</p>";
          return;
        }

        for (const place of filteredData) {
          const name = place.name || "Unnamed";
          const desc = place.line || "No description available.";
          const imgPath = place.image
            ? `${window.location.origin}/${place.image.replace(/^public\//, '')}`
            : "https://via.placeholder.com/300x200?text=No+Image";

          const card = document.createElement('div');
          card.className = 'card';

          card.innerHTML = `
            <img src="${imgPath}" alt="${name}" />
            <strong>${name} <br>${desc}</br></strong>
            <h3>TRANSPORT</h3>
            <button>♥ Save</button>
          `;

          carousel.appendChild(card);
        }

        // Setup scrolling
        const card = document.querySelector('.card');
        if (!card) return;

        const cardWidth = card.offsetWidth + 20;

        prevBtn.addEventListener('click', () => {
          carousel.scrollBy({ left: -cardWidth * 3, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
          carousel.scrollBy({ left: cardWidth * 3, behavior: 'smooth' });
        });
      })
      .catch(err => {
        console.error("Failed to load transport data:", err);
        carousel.innerHTML = "<p style='color:red;'>Couldn't load transport options.</p>";
      });
  };

  // Initial load (default to All)
  renderTransportCarousel();

  // Sidebar toggle
  window.toggleSidebar = function () {
    document.getElementById("mainsidebar").classList.toggle("open");
  };

  window.confirmLogout = function () {
    return confirm("Are you sure you want to logout?");
  };
})();
