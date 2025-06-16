document.addEventListener('DOMContentLoaded', function () {
  const select = document.getElementById('category-select');
  const carousel = document.querySelector('.carousel');

  if (select && carousel) {
    // Initial load
    loadActivities();

    // Category change
    select.addEventListener('change', function () {
      const selected = select.value;
      //window.setCurrentCategory(selected);  // Optional: if you use this for search bar context
      carousel.innerHTML = '<div class="loading-spinner">Loading...</div>';

      switch (selected) {
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

  function loadActivities() {
    removeOldScript();
    const script = document.createElement('script');
    script.src = '/js/travelActivities.js';
    script.setAttribute('data-type', 'activities');
    document.body.appendChild(script);
  }

  function loadAccommodation() {
    removeOldScript();
    const script = document.createElement('script');
    script.src = '/js/travelAccom.js';
    script.setAttribute('data-type', 'accommodation');
    document.body.appendChild(script);
  }

  function loadTransport() {
    removeOldScript();
    const script = document.createElement('script');
    script.src = '/js/travelTransport.js';
    script.setAttribute('data-type', 'transport');
    document.body.appendChild(script);
  }

  function removeOldScript() {
    const oldScript = document.querySelector('script[data-type]');
    if (oldScript) oldScript.remove();
  }
});
