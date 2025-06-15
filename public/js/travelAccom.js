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
      const hotels = data.data.filter(item => item.result_type === 'lodging').slice(0, 10);

      //store globally so search can access
      window.hotelsData = hotels;
      
      hotels.forEach(hotel => {
        const name = hotel.result_object.name || "Unnamed";
        const image = hotel.result_object.photo?.images.original.url || "https://via.placeholder.com/300x200?text=No+Image";

        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
          <img src="${image}" alt="${name}" />
          <strong>${name}</strong>
          <h3>ACCOMMODATION</h3>
          <button data-name="${name}" data-type="ACCOMMODATION" data-image="${image}">♥ Save</button>
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



