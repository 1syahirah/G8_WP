
(function () {
  const carousel = document.querySelector('.carousel');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
        'X-RapidAPI-Key': '12c41cc1a9msh7ccbaaf540f4f5fp12042fjsn93428f272724',
        'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'

    }
  };
  
  const url = 'https://travel-advisor.p.rapidapi.com/locations/search?query=Kuala%20Lumpur&lang=en_US&units=km';

  fetch(url, options)
    .then(res => res.json())
    .then(data => {
      carousel.innerHTML = "";  // Clear carousel

      // Filter only lodging results
      const hotels = data.data.filter(item => item.result_type === 'lodging').slice(0, 5);

      hotels.forEach(hotel => {
        const name = hotel.result_object.name || "Unnamed";
        const image = hotel.result_object.photo?.images.original.url || "https://via.placeholder.com/300x200?text=No+Image";

        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
          <img src="${image}" alt="${name}" />
          <strong>${name}</strong>
          <h3>ACCOMMODATION</h3>
          <button>♥ Save</button>
        `;

        carousel.appendChild(card);
      });

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
    })
    .catch(err => {
      console.error("Failed to load accommodations:", err);
      carousel.innerHTML = "<p style='color:red;'>Couldn't load hotels.</p>";
    });
})();






// console.log("Accommodation script loaded!");

// document.addEventListener("DOMContentLoaded", () => {
//   const carousel = document.querySelector('.carousel');

//   async function loadAccommodations() {
//     const url = 'https://travel-advisor.p.rapidapi.com/locations/search?query=Kuala%20Lumpur&limit=10&offset=0&units=km&currency=MYR&sort=relevance&lang=en_US';

//     const options = {
//       method: 'GET',
//       headers: {
//         'X-RapidAPI-Key': '12c41cc1a9msh7ccbaaf540f4f5fp12042fjsn93428f272724',
//         'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
//       }
//     };

//     try {
//       const response = await fetch(url, options);
//       const result = await response.json();

//       const hotels = result.data;
//       console.log("Hotels data:", hotels);

//         // Filter only lodging results
//         const lodgingHotels = hotels.filter(item => item.result_type === 'lodging');

//         // Check how many are lodging
//         console.log("Filtered Lodging Hotels:", lodgingHotels);
//         // Clear previous carousel items
//         carousel.innerHTML = '';

//         lodgingHotels.forEach(item => {
//         const hotelObj = item.result_object;

//         const name = hotelObj?.name || "Unnamed Hotel";
//         const imageUrl = hotelObj?.photo?.images?.original?.url || "https://placehold.co/300x200?text=No+Image";
//         const address = hotelObj?.address || "No address available";

//         console.log("Appending hotel:", name);

//         const card = document.createElement('div');
//         card.className = 'carousel-item';
//         card.innerHTML = `
//             <img src="${imageUrl}" alt="${name}">
//             <h4>${name}</h4>
//             <p>${address}</p>
//         `;
//         carousel.appendChild(card);
//         });



//     } catch (error) {
//       console.error('Error fetching accommodations:', error);
//       carousel.innerHTML = '<p>Something went wrong while loading accommodations.</p>';
//     }
//   }

//   loadAccommodations();
// });

