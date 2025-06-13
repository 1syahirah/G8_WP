document.addEventListener('DOMContentLoaded', function() {
  const select = document.getElementById('category-select');
  
  if (select) {
    select.addEventListener('change', function() {
      const selected = select.value;
      const carousel = document.querySelector('.carousel');
      
      // Clear existing content
      carousel.innerHTML = '<div class="loading-spinner">Loading...</div>';
      
      // Load appropriate content
      switch(selected) {
        case 'Activities':
          loadActivities();
          break;
        case 'Accommodation':
          loadAccommodation();
          break;
        case 'Transport':
          loadTransport();
          break;
        default:
          loadActivities();
      }
    });
  }

  // Initialize with activities by default
  if (document.querySelector('.carousel')) {
    loadActivities();
  }
});

function loadActivities() {
  // Remove any existing script to avoid duplicates
  const oldScript = document.querySelector('script[data-type="activities"]');
  if (oldScript) oldScript.remove();
  
  const script = document.createElement('script');
  script.src = '/js/travelActivities.js';
  script.setAttribute('data-type', 'activities');
  document.body.appendChild(script);
}

function loadAccommodation() {
  // Similar implementation for accommodation
  console.log("Loading accommodation...");
  // Implement similar to loadActivities()
}

function loadTransport() {
  // Similar implementation for transport
  console.log("Loading transport...");
  // Implement similar to loadActivities()
}