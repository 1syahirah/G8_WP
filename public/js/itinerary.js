// State management
let activeDay = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let itinerary = JSON.parse(localStorage.getItem('itinerary')) || {};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeFavorites();
    initializeItinerary();
    setupEventListeners();

    // Event delegation for dynamically added Save buttons
    document.body.addEventListener('click', function(e) {
        if (e.target.matches('.card button, .save-btn')) {
            const card = e.target.closest('.card');
            if (!card) return;
            // Try to get data from attributes first
            let name = e.target.getAttribute('data-name') || card.querySelector('strong')?.textContent?.trim();
            let type = e.target.getAttribute('data-type') || card.querySelector('h3')?.textContent?.trim() || 'ACTIVITIES';
            let image = e.target.getAttribute('data-image') || card.querySelector('img')?.src;
            if (!name || !image) return;
            const item = { name, type, image };
            addToFavorites(item);
        }
    });
});

// Initialize favorites from localStorage
function initializeFavorites() {
    const favoritesList = document.querySelector('.favorites-list');
    favoritesList.innerHTML = ''; // Clear existing items
    
    favorites.forEach(favorite => {
        const favoriteItem = createFavoriteItem(favorite);
        favoritesList.appendChild(favoriteItem);
    });
}

// Initialize itinerary from localStorage
function initializeItinerary() {
    const itineraryDays = document.querySelector('.itinerary-days');
    itineraryDays.innerHTML = ''; // Clear existing days
    
    // Create default days if none exist
    if (Object.keys(itinerary).length === 0) {
        itinerary = {
            'Day 1': [],
            'Day 2': [],
            'Day 3': []
        };
    }
    
    // Create day cards
    Object.entries(itinerary).forEach(([day, activities]) => {
        const dayCard = createDayCard(day, activities);
        itineraryDays.appendChild(dayCard);
    });
}

// Create a favorite item element
function createFavoriteItem(item) {
    const div = document.createElement('div');
    div.className = 'favorite-item';
    div.innerHTML = `
        <div class="favorite-content">
            <img src="${item.image}" alt="${item.name}" class="favorite-image">
            <div class="favorite-details">
                <span class="favorite-name">${item.name}</span>
                <div class="favorite-meta">
                    <span class="favorite-type" style="background: ${getTypeColor(item.type)}; color: ${getTypeTextColor(item.type)}; padding: 2px 6px; border-radius: 4px;">${item.type}</span>
                </div>
            </div>
        </div>
        <div class="favorite-actions">
            <button class="add-to-itinerary-btn" title="Add to itinerary">+ Add</button>
            <button class="remove-favorite-btn" title="Remove favorite">×</button>
        </div>
    `;
    
    // Add event listeners
    div.querySelector('.add-to-itinerary-btn').addEventListener('click', () => addToItinerary(item));
    div.querySelector('.remove-favorite-btn').addEventListener('click', () => removeFavorite(item));
    
    return div;
}

// Create a day card element
function createDayCard(day, activities) {
    const div = document.createElement('div');
    div.className = 'day-card';
    div.innerHTML = `
        <div class="day-header">
            <h4>${day}</h4>
            <button class="add-btn">+ Add Activity</button>
        </div>
        <div class="activities-container">
            ${activities.map(activity => `
                <div class="activity-item">
                    <span>${activity.name}</span>
                    <div class="activity-actions">
                        <button class="move-btn">↑↓</button>
                        <button class="remove-btn">×</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add event listeners
    div.querySelector('.add-btn').addEventListener('click', () => setActiveDay(day));
    
    return div;
}

// Setup all event listeners
function setupEventListeners() {
    // No need to attach Save button listeners here anymore
}

// Add item to favorites
function addToFavorites(item) {
    if (!favorites.some(fav => fav.name === item.name)) {
        favorites.push(item);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        initializeFavorites();
    }
}

// Remove item from favorites
function removeFavorite(item) {
    favorites = favorites.filter(fav => fav.name !== item.name);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    initializeFavorites();
}

// Set active day for adding activities
function setActiveDay(day) {
    activeDay = day;
    // Visual feedback for active day
    document.querySelectorAll('.day-card').forEach(card => {
        card.classList.remove('active');
        if (card.querySelector('h4').textContent === day) {
            card.classList.add('active');
        }
    });
}

// Add item to itinerary
function addToItinerary(item) {
    if (!activeDay) {
        alert('Please select a day first by clicking "+ Add Activity"');
        return;
    }
    
    if (!itinerary[activeDay]) {
        itinerary[activeDay] = [];
    }
    
    itinerary[activeDay].push(item);
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
    initializeItinerary();
    activeDay = null; // Reset active day
}

// Helper function to get type color
function getTypeColor(type) {
    switch(type) {
        case 'ACTIVITIES': return '#e3f2fd';
        case 'ACCOMMODATION': return '#fff3e0';
        case 'TRANSPORT': return '#e8f5e9';
        default: return '#f5f5f5';
    }
}

// Helper function to get type text color
function getTypeTextColor(type) {
    switch(type) {
        case 'ACTIVITIES': return '#1976d2';
        case 'ACCOMMODATION': return '#e65100';
        case 'TRANSPORT': return '#2e7d32';
        default: return '#616161';
    }
} 