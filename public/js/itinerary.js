// State management
let activeDay = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let itinerary = JSON.parse(localStorage.getItem('itinerary')) || {};
let selectedDayForDeletion = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeFavorites();
    initializeItinerary();
    setupEventListeners();


    // Add event listener for the Delete Selected Day button
    document.querySelector('.delete-selected-day-btn').addEventListener('click', deleteSelectedDay);

    // // Event delegation for selecting a day card
    // document.querySelector('.itinerary-days').addEventListener('click', function(e) {
    //     const dayCard = e.target.closest('.day-card');
    //     if (dayCard) {
    //         // Remove 'selected' class from all day cards
    //         document.querySelectorAll('.day-card').forEach(card => {
    //             card.classList.remove('selected');
    //         });
    //         // Add 'selected' class to the clicked day card
    //         dayCard.classList.add('selected');
    //         selectedDayForDeletion = dayCard.querySelector('h4').textContent;
    //     }
    // });
    

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

    // Event delegation for itinerary actions (remove and move)
    document.querySelector('.itinerary-days').addEventListener('click', function(e) {
        // Remove activity
        if (e.target.classList.contains('remove-btn')) {
            const activityDiv = e.target.closest('.activity-item');
            const dayCard = e.target.closest('.day-card');
            const day = dayCard.querySelector('h4').textContent;
            const index = parseInt(activityDiv.getAttribute('data-index'));
            removeActivityFromDay(day, index);
        }
        // Move activity (up or down)
        if (e.target.classList.contains('move-btn')) {
            const activityDiv = e.target.closest('.activity-item');
            const dayCard = e.target.closest('.day-card');
            const day = dayCard.querySelector('h4').textContent;
            const index = parseInt(activityDiv.getAttribute('data-index'));
            moveActivityInDay(day, index);
        }
        const dayCard = e.target.closest('.day-card');
        if (dayCard) {
            const dayName = dayCard.querySelector('h4').textContent;
            if (dayName === selectedDayForDeletion) {
                // If already selected, unselect it
                dayCard.classList.remove('selected');
                selectedDayForDeletion = null;
            } else {
                // Remove 'selected' class from all day cards
                document.querySelectorAll('.day-card').forEach(card => {
                    card.classList.remove('selected');
                });
                // Add 'selected' class to the clicked day card
                dayCard.classList.add('selected');
                selectedDayForDeletion = dayName;
            }
        }
    });

    // Add event listener for the Add Day button
    document.querySelector('.add-day-btn').addEventListener('click', addNewDay);
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
            ${activities.map((activity, idx) => `
                <div class="activity-item" data-index="${idx}">
                    <span>${activity.name}</span>
                    <div class="activity-actions">
                        <button class="move-btn" title="Move up/down">↑↓</button>
                        <button class="remove-btn" title="Remove">×</button>
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

// Remove activity from a day by index
function removeActivityFromDay(day, index) {
    if (!itinerary[day]) return;
    itinerary[day].splice(index, 1);
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
    initializeItinerary();
}

// Move activity up or down in a day (cycle order)
function moveActivityInDay(day, index) {
    if (!itinerary[day]) return;
    // Move down if not last, else move to top
    if (index < itinerary[day].length - 1) {
        [itinerary[day][index], itinerary[day][index + 1]] = [itinerary[day][index + 1], itinerary[day][index]];
    } else {
        // Move last to first
        const [last] = itinerary[day].splice(index, 1);
        itinerary[day].unshift(last);
    }
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
    initializeItinerary();
}

// Add a new day to the itinerary
function addNewDay() {
    const days = Object.keys(itinerary);
    const lastDay = days[days.length - 1];
    const lastDayNumber = parseInt(lastDay.split(' ')[1]);
    const newDayNumber = lastDayNumber + 1;
    const newDay = `Day ${newDayNumber}`;
    
    itinerary[newDay] = [];
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
    initializeItinerary();
} 

// Delete selected day from the itinerary
function deleteSelectedDay() {
    if (!selectedDayForDeletion) {
        alert('Please select a day to delete first by clicking on its card.');
        return;
    }

    if (confirm(`Are you sure you want to delete ${selectedDayForDeletion} and all its activities?`)) {
        delete itinerary[selectedDayForDeletion];
        localStorage.setItem('itinerary', JSON.stringify(itinerary));
        initializeItinerary();
        selectedDayForDeletion = null;
    }
} 