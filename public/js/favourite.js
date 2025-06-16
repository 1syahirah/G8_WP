// load favourites on page load
document.addEventListener('DOMContentLoaded', displayFavourites);

// color based on type
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
  
  // create favorite item element
  function createFavoriteItem(item) {
    const div = document.createElement('div');
    div.className = 'favorite-item';
  
    div.innerHTML = `
      <div class="favorite-content">
        <img src="${item.image || 'https://via.placeholder.com/80x80?text=No+Image'}" 
             alt="${item.name}" 
             class="favorite-image">
        <div class="favorite-details">
          <span class="favorite-name">${item.name}</span>
          <div class="favorite-meta">
            <span class="favorite-type"
                  style="background: ${getTypeColor(item.type)}; 
                         color: ${getTypeTextColor(item.type)}; 
                         padding: 2px 6px; 
                         border-radius: 4px;">
              ${item.type}
            </span>
          </div>
        </div>
      </div>
      <div class="favorite-actions">
        <button class="add-to-itinerary-btn" title="Add to itinerary">+ Add</button>
        <button class="remove-favorite-btn" title="Remove favorite">×</button>
      </div>
    `;
  
    // event listeners
    div.querySelector('.add-to-itinerary-btn')
       .addEventListener('click', () => addToItinerary(item));
    
    div.querySelector('.remove-favorite-btn')
       .addEventListener('click', () => removeFavorite(item));
  
    return div;
  }
  
  // fetch favourites from DB and display
  async function displayFavourites() {
    const container = document.querySelector('.favorites-list');
    container.innerHTML = ""; // clear existing list
  
    try {
      const res = await fetch('/api/favourites');
      const favourites = await res.json();
  
      if (favourites.length === 0) {
        container.innerHTML = "<p>No favourites saved yet.</p>";
        return;
      }
  
      for (const item of favourites) {
        const favElement = createFavoriteItem(item);
        container.appendChild(favElement);
      }
  
    } catch (err) {
      console.error("Error fetching favourites:", err);
      container.innerHTML = "<p style='color:red;'>Failed to load favourites.</p>";
    }
  }
  
  // remove fav
  function removeFavorite(item) {
    fetch(`/api/favourites/${encodeURIComponent(item.name)}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (res.ok) {
        displayFavourites(); // refresh list

        const allSaveButtons = document.querySelectorAll('.save-btn');
        allSaveButtons.forEach(btn => {
          const btnName = btn.getAttribute('data-name');
          const btnType = btn.getAttribute('data-type');

          if (btnName === item.name && btnType === item.type) {
            btn.textContent = '♥ Save';
            btn.style.backgroundColor = '';
            btn.style.color = '';
            btn.disabled = false;
            btn.classList.remove('saved-btn');
          }
        });
      } else {
        alert("Failed to remove favorite.");
      }
    })
    .catch(err => {
      console.error("Remove error:", err);
      alert("Error removing favorite.");
    });
  }
  
  