
//SEARCH BAR
document.addEventListener('DOMContentLoaded', function () {
  const searchBar = document.getElementById('search-bar');
  const carousel = document.querySelector('.carousel');
  const apiKey = '5ae2e3f221c38a28845f05b6dda50982728e1c40dd2a9e374924f4f0';  // Replace with your actual key

  // Listen for Enter key press
  searchBar.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      const query = searchBar.value.trim();

      if (!query) {
        alert("Please enter a search term.");
        return;
      }

      searchPlaces(query);
    }
  });

  function searchPlaces(query) {
    const lat = 3.1390;
    const lon = 101.6869;
    const radius = 10000;

    const searchUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&format=json&name=${query}&apikey=${apiKey}`;

    fetch(searchUrl)
      .then(res => res.json())
      .then(async data => {
        carousel.innerHTML = ""; // clear previous results

        if (data.length === 0) {
          carousel.innerHTML = "<div class='error-message'>No place found.</div>";
          return;
        }

        for (const place of data.slice(0, 10)) {
          const detailRes = await fetch(`https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=${apiKey}`);
          const detail = await detailRes.json();

          const name = detail.name || "Unnamed";
          const desc = detail.wikipedia_extracts?.text || "No description available.";
          const image = detail.preview?.source || "https://via.placeholder.com/300x200?text=No+Image";

          const card = document.createElement('div');
          card.className = 'card';

          card.innerHTML = `
            <img src="${image}" alt="${name}" />
            <strong>${name}</strong>
            <button>♥ Save</button>
          `;

          carousel.appendChild(card);
        }
      })
      .catch(err => {
        console.error("Error while searching places:", err);
        carousel.innerHTML = "<p style='color:red;'>Error occurred during search.</p>";
      });
  }
});






