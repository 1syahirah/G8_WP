(function () {
  const carousel = document.querySelector('.carousel');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const apiKey = '5ae2e3f221c38a28845f05b6dda50982728e1c40dd2a9e374924f4f0'; //geopify: 531235499a7a46edb074f43b9e88dbe3
  // opentripmap: 5ae2e3f221c38a28845f05b6dda50982728e1c40dd2a9e374924f4f0

  const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=101.6869&lat=3.1390&rate=2&format=json&apikey=5ae2e3f221c38a28845f05b6dda50982728e1c40dd2a9e374924f4f0`;


  fetch(url)
    .then(res => res.json())
    .then(async data => {
        carousel.innerHTML = ""; // Clear carousel

      // fetch favourites
      const favResponse = await fetch('/api/favourites');
      const favourites = await favResponse.json();

      // loop through places
      for (const place of data.slice(0, 5)) {
        const detailRes = await fetch(`https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=${apiKey}`);
        const detail = await detailRes.json();

        const name = detail.name || "Unnamed";
        const desc = detail.wikipedia_extracts?.text || "No description available.";
        const image = detail.preview?.source || "https://via.placeholder.com/300x200?text=No+Image";

        // check if saved
        const isSaved = favourites.some(fav => fav.name === name && fav.type === 'ACTIVITIES');

        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
          <img src="${image}" alt="${name}" />
          <strong>${name}</strong>
          <h3>ACTIVITIES</h3>
          <button class="save-btn" data-name="${name}" data-type="ACTIVITIES" data-img="${image}"
            style="${isSaved ? 'background-color: #4a5a42; color: white;' : ''}">
            ${isSaved ? '✓ Saved' : '♥ Save'}
          </button>
        `;

        carousel.appendChild(card);
      }

      // Set up scroll buttons
      const card = document.querySelector('.card');
      if (!card) return;

      const cardWidth = card.offsetWidth + 20;

      prevBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: -cardWidth * 3, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: cardWidth * 3, behavior: 'smooth' });
      });
      
      //save to fav db button listener
      addBtnFavourite();
    })
    .catch(err => {
      console.error("Failed to load data:", err);
      carousel.innerHTML = "<p style='color:red;'>Couldn't load recommended places.</p>";
    });

  // Sidebar toggle
  window.toggleSidebar = function () {
    document.getElementById("mainsidebar").classList.toggle("open");
  };

  // Logout confirmation
  window.confirmLogout = function () {
    return confirm("Are you sure you want to logout?");
  };
})();
