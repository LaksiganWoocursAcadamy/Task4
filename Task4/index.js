// script.js

// Replace 'YOUR_API_KEY' with your actual WeatherAPI.com API key
const API_KEY = 'e01e17bb5cf04fc4b8733149242312';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const locationInput = document.getElementById('location-input');
    const currentWeatherDiv = document.getElementById('current-weather');
    const futureWeatherDiv = document.getElementById('future-weather');

    // Initialize the map
    const map = L.map('map').setView([20, 0], 2); // Default view

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const location = locationInput.value.trim();
        if (location === '') return;

        try {
            // Fetch current weather
            const currentResponse = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(location)}`);
            if (!currentResponse.ok) throw new Error('Location not found');
            const currentData = await currentResponse.json();

            // Fetch 5-day forecast
            const forecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=5&aqi=no&alerts=no`);
            if (!forecastResponse.ok) throw new Error('Forecast data not available');
            const forecastData = await forecastResponse.json();

            // Update Map
            const lat = currentData.location.lat;
            const lon = currentData.location.lon;
            map.setView([lat, lon], 10);
            if (marker) {
                marker.setLatLng([lat, lon]);
            } else {
                marker = L.marker([lat, lon]).addTo(map);
            }

            // Display Current Weather
            currentWeatherDiv.innerHTML = `
                <h3>${currentData.location.name}, ${currentData.location.country}</h3>
                <p><strong>Temperature:</strong> ${currentData.current.temp_c}°C / ${currentData.current.temp_f}°F</p>
                <p><strong>Condition:</strong> ${currentData.current.condition.text} <img src="${currentData.current.condition.icon}" alt="${currentData.current.condition.text}"></p>
                <p><strong>Precipitation:</strong> ${currentData.current.precip_mm} mm</p>
            `;

            // Display Future Weather (5 days)
            futureWeatherDiv.innerHTML = ''; // Clear any existing content
            forecastData.forecast.forecastday.forEach(dayData => {
                const dayHTML = `
                    <div class="col-md-4 mb-5">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${dayData.date}</h5>
                                <p class="card-text">
                                    <strong>Avg Temp:</strong> ${dayData.day.avgtemp_c}°C / ${dayData.day.avgtemp_f}°F<br>
                                    <strong>Condition:</strong> ${dayData.day.condition.text} 
                                    <img src="${dayData.day.condition.icon}" alt="${dayData.day.condition.text}"><br>
                                    <strong>Chance of Precipitation:</strong> ${dayData.day.daily_chance_of_rain}% 
                                </p>
                            </div>
                        </div>
                    </div>
                `;
                futureWeatherDiv.innerHTML += dayHTML;
            });

        } catch (error) {
            alert(error.message);
        }
    });
});
