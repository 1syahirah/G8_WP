//SEARCH BAR
document.addEventListener('DOMContentLoaded', function () {
  const searchBar = document.getElementById('search-bar');
  const carousel = document.querySelector('.carousel');
  const apiKey = '12c41cc1a9msh7ccbaaf540f4f5fp12042fjsn93428f272724';
  const apiHost = 'travel-advisor.p.rapidapi.com';
  const activityApiKey = '5ae2e3f221c38a28845f05b6dda50982728e1c40dd2a9e374924f4f0';

  let klLocationId = null;
  let hotelsData = [];
  let currentCategory = 'Activities';  // default category

  // --- GET KL location_id ---
  async function fetchKLLocationId() {
    const url = `https://${apiHost}/locations/search?query=Kuala%20Lumpur&lang=en_US&units=km`;

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      const locationObj = data.data.find(item => item.result_type === 'geos');
      if (locationObj) {
        klLocationId = locationObj.result_object.location_id;
        await fetchHotels();
      } else {
        console.error("Kuala Lumpur not found");
      }
    } catch (err) {
      console.error("Error getting location_id:", err);
    }
  }

  // --- Fetch hotels list ---
  async function fetchHotels() {
    const url = `https://${apiHost}/hotels/list?location_id=${klLocationId}&lang=en_US&currency=USD&limit=50`;

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.data) {
        hotelsData = data.data.filter(item => item.result_type === 'lodging');
        console.log("Hotels loaded into hotelsData");
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
    }
  }

  // --- Main Search Function ---
  searchBar.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      const query = searchBar.value.trim().toLowerCase();
      if (!query) {
        alert("Please enter a search term.");
        return;
      }

      // Search based on currentCategory
      if (currentCategory === 'Activities') {
        searchActivities(query);
      } else if (currentCategory === 'Accommodation') {
        searchAccommodation(query);
        } else if (currentCategory === 'Transport') {
        searchTransport(query);
      } else {
        alert("Search not implemented for this category.");
      }
    }
  });

  // --- Activities search ---
  async function searchActivities(query) {
    const lat = 3.1390;
    const lon = 101.6869;
    const radius = 10000;
    const carousel = document.querySelector('.carousel');
    const searchUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&format=json&name=${query}&apikey=${activityApiKey}`;
  
    carousel.innerHTML = "";
  
    try {
      const [activityData, favourites] = await Promise.all([
        fetch(searchUrl).then(res => res.json()),
        fetch('/api/favourites').then(res => res.json())
      ]);
  
      if (!activityData || activityData.length === 0) {
        carousel.innerHTML = "<div class='error-message'>No activity found.</div>";
        return;
      }
  
      const results = activityData.slice(0, 10);
  
      for (const place of results) {
        const detailRes = await fetch(`https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=${activityApiKey}`);
        const detail = await detailRes.json();
  
        const name = detail.name || "Unnamed";
        const imgPath = detail.preview?.source || "https://via.placeholder.com/300x200?text=No+Image";
  
        // Normalize for comparison
        const normalizedName = name.trim().toLowerCase();
  
        const isSaved = favourites.some(fav =>
          fav.type === 'ACTIVITIES' && fav.name?.trim().toLowerCase() === normalizedName
        );
  
        const card = document.createElement('div');
        card.className = 'card';
  
        card.innerHTML = `
          <img src="${imgPath}" alt="${name}" />
          <strong>${name}</strong>
          <h3>ACTIVITY</h3>
          <button 
            class="save-btn" 
            data-name="${name}" 
            data-type="ACTIVITIES" 
            data-img="${imgPath}"
            style="${isSaved ? 'background-color: #4a5a42; color: white;' : ''}"
            ${isSaved ? 'disabled' : ''}>
            ${isSaved ? '✓ Saved' : '♥ Save'}
          </button>
        `;
  
        carousel.appendChild(card);
      }
  
      // Add save button listeners
      document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', () => {
          const name = button.getAttribute('data-name');
          const type = button.getAttribute('data-type');
          const image = button.getAttribute('data-img');
  
          try {
            window.dispatchEvent(new CustomEvent('save-to-favorites', {
              detail: { name, type, image }
            }));
  
            button.textContent = "✓ Saved";
            button.style.backgroundColor = "#4a5a42";
            button.style.color = "white";
            button.disabled = true;
          } catch (err) {
            console.error("Error saving to favourites:", err);
            alert("Failed to save.");
          }
        });
      });
  
    } catch (err) {
      console.error("Error while searching activities:", err);
      carousel.innerHTML = "<p style='color:red;'>Error occurred during search.</p>";
    }
  }
  


  // --- Hotels search ---
  async function searchTransport(query) {
  try {
    const [transportRes, favRes] = await Promise.all([
      fetch('/api/transports'),
      fetch('/api/favourites')
    ]);

    const data = await transportRes.json();
    const favourites = await favRes.json();

    const carousel = document.querySelector('.carousel');
    carousel.innerHTML = "";

    const normalizedQuery = query.toLowerCase().trim();

    const filtered = data.filter(item =>
      (item.name && item.name.toLowerCase().includes(normalizedQuery)) ||
      (item.line && item.line.toLowerCase().includes(normalizedQuery))
    );

    if (filtered.length === 0) {
      carousel.innerHTML = "<div class='error-message'>No transport option found.</div>";
      return;
    }

    for (const place of filtered) {
      const name = place.name || "Unnamed";
      const desc = place.line || "No description available.";
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
    }

    // Add event listeners to newly added save buttons
    document.querySelectorAll('.save-btn').forEach(button => {
      button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const type = button.getAttribute('data-type');
        const image = button.getAttribute('data-img');

        try {
          window.dispatchEvent(new CustomEvent('save-to-favorites', {
            detail: { name, type, image }
          }));

          button.textContent = "✓ Saved";
          button.style.backgroundColor = "#4a5a42";
          button.style.color = "white";
          button.disabled = true;
        } catch (err) {
          console.error("Error saving to favourites:", err);
          alert("Failed to save.");
        }
      });
    });

  } catch (err) {
    console.error("Error while searching transport:", err);
    const carousel = document.querySelector('.carousel');
    carousel.innerHTML = "<p style='color:red;'>Error occurred during search.</p>";
  }
}


  async function searchTransport(query) {
    try {
      const [transportRes, favRes] = await Promise.all([
        fetch('/api/transports'),
        fetch('/api/favourites')
      ]);
  
      const data = await transportRes.json();
      const favourites = await favRes.json();
  
      const carousel = document.querySelector('.carousel');
      carousel.innerHTML = "";
  
      const normalizedQuery = query.toLowerCase().trim();
  
      const filtered = data.filter(item =>
        (item.name && item.name.toLowerCase().includes(normalizedQuery)) ||
        (item.line && item.line.toLowerCase().includes(normalizedQuery))
      );
  
      if (filtered.length === 0) {
        carousel.innerHTML = "<div class='error-message'>No transport option found.</div>";
        return;
      }
  
      for (const place of filtered) {
        const name = place.name || "Unnamed";
        const desc = place.line || "No description available.";
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
      }
  
      // Add event listeners to newly added save buttons
      document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', () => {
          const name = button.getAttribute('data-name');
          const type = button.getAttribute('data-type');
          const image = button.getAttribute('data-img');
  
          try {
            window.dispatchEvent(new CustomEvent('save-to-favorites', {
              detail: { name, type, image }
            }));
  
            button.textContent = "✓ Saved";
            button.style.backgroundColor = "#4a5a42";
            button.style.color = "white";
            button.disabled = true;
          } catch (err) {
            console.error("Error saving to favourites:", err);
            alert("Failed to save.");
          }
        });
      });
  
    } catch (err) {
      console.error("Error while searching transport:", err);
      const carousel = document.querySelector('.carousel');
      carousel.innerHTML = "<p style='color:red;'>Error occurred during search.</p>";
    }
  }
  

  // --- Expose a function so categoryHandlerTravel can call this ---
  window.setCurrentCategory = function (category) {
    currentCategory = category;
  }

  // INIT
  fetchKLLocationId();
});



  