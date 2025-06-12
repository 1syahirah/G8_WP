document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("carbonForm");
    const emissionResult = document.getElementById("emissionResult");
    const resultsArea = document.getElementById("resultsArea");
  
    const emissionFactors = {
      car: 0.21,       // kg CO₂e per km per person (average car)
      bus: 0.05,       // kg CO₂e per km per person
      train: 0.041,    // kg CO₂e per km per person
      airplane: 0.133, // kg CO₂e per km per person (economy class, medium haul)
    };
  
    const accommodationFactor = 6.5; // kg CO₂e per person per night (average hotel stay)
  
    form.addEventListener("submit", function (event) {
      event.preventDefault();
  
      // Get user inputs
      const transportType = document.getElementById("transportType").value;
      const distance = parseFloat(document.getElementById("distance").value);
      const travelers = parseInt(document.getElementById("travelers").value);
      const daysOfStay = parseInt(document.getElementById("daysOfStay").value) || 0;
  
      if (!emissionFactors[transportType] || isNaN(distance) || isNaN(travelers)) {
        emissionResult.innerHTML = `<p class="text-danger">Please fill in all required fields correctly.</p>`;
        return;
      }
  
      // Calculate transport emission
      const transportEmission = distance * emissionFactors[transportType] * travelers;
  
      // Calculate accommodation emission (optional)
      const accommodationEmission = daysOfStay > 0 ? travelers * daysOfStay * accommodationFactor : 0;
  
      // Total emission
      const totalEmission = (transportEmission + accommodationEmission).toFixed(2);
  
      // Display result
      emissionResult.innerHTML = `
        <h5>Total Carbon Footprint</h5>
        <p class="display-6">${totalEmission} kg CO₂e</p>
        <small>(Transport: ${transportEmission.toFixed(2)} kg, 
                Accommodation: ${accommodationEmission.toFixed(2)} kg)</small>
      `;
  
      resultsArea.style.display = "block";
  
      // Optional: trigger chart update or suggestions (you can implement later)
    });
  });
  