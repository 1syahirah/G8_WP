(async function () {
  const carousel = document.querySelector('.carousel');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const url = '/api/accomodation';  // hit your hotels API

  try {
    const [hotelRes, favRes] = await Promise.all([
      fetch(url),
      fetch('/api/favourites')
    ]);

    const hotels = await hotelRes.json();
    const favourites = await favRes.json();

     // 👉 ADD THESE 2 LINES HERE 👇
    console.log('Accommodations:', hotels);
    console.log('Favourites:', favourites);


    carousel.innerHTML = "";

    if (!hotels || hotels.length === 0) {
      carousel.innerHTML = "<p>No accommodation options available.</p>";
      return;
    }

    hotels.forEach(hotel => {
      console.log("DEBUG hotel object:", hotel);  // <-- add this
      const name = hotel.hotelname || "Unnamed";
      const imgPath = hotel.image_url
        ? hotel.image_url
        : "https://via.placeholder.com/300x200?text=No+Image";

      const isSaved = favourites.some(fav => fav.name === name && fav.type === 'ACCOMMODATION');

      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <img src="${imgPath}" alt="${name}" />
        <strong>${name}</strong>
        <h3>ACCOMMODATION</h3>
        <button 
          class="save-btn" 
          data-name="${name}" 
          data-type="ACCOMMODATION" 
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

    // Save button listener
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const name = button.getAttribute('data-name'); 
        const type = button.getAttribute('data-type');
        const image = button.getAttribute('data-img');
    
        try {
          const res = await fetch('/api/favourites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, type, image })
          });
    
          if (!res.ok) {
            throw new Error("Failed to save to favourites.");
          }
    
          // Only update UI if saving succeeded
          button.textContent = "✓ Saved";
          button.style.backgroundColor = "#4a5a42";
          button.style.color = "white";
          button.disabled = true;
          button.classList.add("saved-btn");
          displayFavourites();
    
        } catch (err) {
          console.error("Error saving favourite:", err);
          alert("Failed to save favorite. Please try again.");
        }
      });
    });

  } catch (err) {
    console.error("Failed to load accommodation data or favourites:", err);
    carousel.innerHTML = "<p style='color:red;'>Couldn't load accommodation options.</p>";
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



// (function () {
//   const carousel = document.querySelector('.carousel');
//   const prevBtn = document.querySelector('.prev');
//   const nextBtn = document.querySelector('.next');

//   const options = {
//     method: 'GET',
//     headers: {
//       accept: 'application/json',
//         'X-RapidAPI-Key': '12c41cc1a9msh7ccbaaf540f4f5fp12042fjsn93428f272724',
//         'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'

//     }
//   };
  
//   const url = 'https://travel-advisor.p.rapidapi.com/locations/search?query=Kuala%20Lumpur&lang=en_US&units=km';

//   fetch(url, options)
//     .then(res => res.json())
//     .then(data => {
//       carousel.innerHTML = "";  // Clear carousel

//       // Filter only lodging results
//       const hotels = data.data.filter(item => item.result_type === 'lodging').slice(0, 10);

//       //store globally so search can access
//       window.hotelsData = hotels;
      
//       hotels.forEach(hotel => {
//         const name = hotel.result_object.name || "Unnamed";
//         const image = hotel.result_object.photo?.images.original.url || "https://via.placeholder.com/300x200?text=No+Image";

//         const card = document.createElement('div');
//         card.className = 'card';

//         card.innerHTML = `
//           <img src="${image}" alt="${name}" />
//           <strong>${name}</strong>
//           <h3>ACCOMMODATION</h3>
//           <button data-name="${name}" data-type="ACCOMMODATION" data-image="${image}">♥ Save</button>
//         `;

//         carousel.appendChild(card);
//       });

//       // Set up scroll buttons
//       const card = document.querySelector('.card');
//       if (!card) return;

//       const cardWidth = card.offsetWidth + 20;

//       prevBtn.addEventListener('click', () => {
//         carousel.scrollBy({ left: -cardWidth * 3, behavior: 'smooth' });
//       });

//       nextBtn.addEventListener('click', () => {
//         carousel.scrollBy({ left: cardWidth * 3, behavior: 'smooth' });
//       });
//     })
//     .catch(err => {
//       console.error("Failed to load accommodations:", err);
//       carousel.innerHTML = "<p style='color:red;'>Couldn't load hotels.</p>";
//     });
// })();



