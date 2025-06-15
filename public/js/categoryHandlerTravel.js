document.addEventListener('DOMContentLoaded', function () {
  const select = document.getElementById('category-select');
  const transportTypeSelect = document.getElementById('transport-type-select');
  const carousel = document.querySelector('.carousel');

  if (select && transportTypeSelect && carousel) {
    // Initial load
    loadActivities();

    // Category change
    select.addEventListener('change', function () {
      const selected = select.value;
      carousel.innerHTML = '<div class="loading-spinner">Loading...</div>';

      if (selected === 'Transport') {
        transportTypeSelect.style.display = 'inline-block';
        loadTransportType(transportTypeSelect.value); // Initial filter
      } else {
        transportTypeSelect.style.display = 'none';
      }

      switch (selected) {
        case 'Activities':
          loadActivities();
          break;
        case 'Accommodation':
          loadAccommodation();
          break;
        case 'Transport':
          loadTransport(); // Just load script
          break;
        default:
          loadActivities();
      }
    });

    // Filter by transport type
    transportTypeSelect.addEventListener('change', function () {
      if (select.value === 'Transport') {
        loadTransportType(transportTypeSelect.value);
      }
    });
  }

  // Dynamically load script and call filtering
  function loadTransportType(filterType) {
    // Wait for the transport script to load first
    if (typeof renderTransportCarousel === 'function') {
      renderTransportCarousel(filterType);
    } else {
      loadTransport(() => {
        if (typeof renderTransportCarousel === 'function') {
          renderTransportCarousel(filterType);
        }
      });
    }
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

  function loadTransport(callback) {
    removeOldScript();
    const script = document.createElement('script');
    script.src = '/js/travelTransport.js';
    script.setAttribute('data-type', 'transport');

    // Call callback after script is loaded
    script.onload = function () {
      if (callback) callback();
    };

    document.body.appendChild(script);
  }

  function removeOldScript() {
    const oldScript = document.querySelector('script[data-type]');
    if (oldScript) oldScript.remove();
  }
});
