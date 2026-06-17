// Open-Meteo Weather API (Free, No API Key Required)
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

// Weather icon mapping
const weatherIcons = {
    'clear': '☀️',
    'sunny': '☀️',
    'partly': '⛅',
    'cloudy': '☁️',
    'rain': '🌧️',
    'drizzle': '🌦️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'fog': '🌫️',
    'windy': '💨'
};

let currentWeatherData = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    getWeatherByCity('Lovina');
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        const city = document.getElementById('cityInput').value.trim();
        if (city) {
            getWeatherByCity(city);
        }
    });

    document.getElementById('cityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = document.getElementById('cityInput').value.trim();
            if (city) {
                getWeatherByCity(city);
            }
        }
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const city = btn.dataset.city;
            getWeatherByCity(city);
        });
    });
}

// Get weather by city name
async function getWeatherByCity(cityName) {
    try {
        showLoading();
        
        // Get coordinates from city name
        const geoResponse = await fetch(
            `${GEOCODING_API}?name=${cityName}&count=1&language=en&format=json`
        );
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            showError(`City "${cityName}" not found. Please try another location.`);
            return;
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country } = location;

        // Get weather data
        const weatherResponse = await fetch(
            `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,apparent_temperature,wind_speed_10m,pressure_msl&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        // Update UI with weather data
        updateWeatherDisplay(weatherData, name, country);
        document.getElementById('cityInput').value = name;

    } catch (error) {
        console.error('Error fetching weather:', error);
        showError('Failed to fetch weather data. Please try again.');
    }
}

// Update weather display
function updateWeatherDisplay(data, cityName, country) {
    currentWeatherData = data;
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    // Update main weather card
    document.getElementById('cityName').textContent = `${cityName}, ${country}`;
    document.getElementById('temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('feelsLike').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('pressure').textContent = `${current.pressure_msl} mb`;

    // Update weather description and icon
    const weatherCode = current.weather_code;
    const description = getWeatherDescription(weatherCode);
    document.getElementById('weatherDesc').textContent = description;
    document.getElementById('weatherIcon').textContent = getWeatherIcon(weatherCode);

    // Calculate and update extra info
    const dewPoint = calculateDewPoint(current.temperature_2m, current.relative_humidity_2m);
    document.getElementById('dewPoint').textContent = `${Math.round(dewPoint)}°C`;
    document.getElementById('visibility').textContent = '10 km';
    document.getElementById('uvIndex').textContent = calculateUVIndex(weatherCode);

    // Update sunrise/sunset (using approximate times for now)
    document.getElementById('sunrise').textContent = '05:30';
    document.getElementById('sunset').textContent = '18:15';

    // Update water temperature
    document.getElementById('waterTemp').textContent = `${Math.round(current.temperature_2m - 2)}°C`;

    // Update travel tips based on conditions
    updateTravelTips(current, weatherCode);

    // Update hourly forecast
    updateHourlyForecast(hourly);

    // Update daily forecast
    updateDailyForecast(daily);

    // Show weather content, hide loading
    showWeatherContent();
}

// Get weather description from WMO code
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Slight Hail',
        99: 'Thunderstorm with Heavy Hail'
    };
    return descriptions[code] || 'Unknown';
}

// Get weather icon from WMO code
function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '⛅';
    if (code === 3) return '☁️';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 80, 81, 82].includes(code)) return '🌧️';
    if ([61, 63, 65].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌤️';
}

// Update hourly forecast
function updateHourlyForecast(hourly) {
    const container = document.getElementById('hourlyForecast');
    container.innerHTML = '';

    const now = new Date();
    const currentHour = now.getHours();

    for (let i = 0; i < 12; i++) {
        const hour = (currentHour + i) % 24;
        const timeString = String(hour).padStart(2, '0') + ':00';

        const temp = hourly.temperature_2m[i];
        const code = hourly.weather_code[i];
        const precipProb = hourly.precipitation_probability[i] || 0;

        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="hourly-time">${timeString}</div>
            <div class="hourly-icon">${getWeatherIcon(code)}</div>
            <div class="hourly-temp">${Math.round(temp)}°C</div>
            <div class="hourly-chance">💧 ${precipProb}%</div>
        `;
        container.appendChild(hourlyItem);
    }
}

// Update daily forecast
function updateDailyForecast(daily) {
    const container = document.getElementById('dailyForecast');
    container.innerHTML = '';

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayName = daysOfWeek[date.getDay()];
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const high = daily.temperature_2m_max[i];
        const low = daily.temperature_2m_min[i];
        const code = daily.weather_code[i];

        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        dailyItem.innerHTML = `
            <div class="daily-date">${dayName}, ${dateString}</div>
            <div class="daily-icon">${getWeatherIcon(code)}</div>
            <div class="daily-temps">
                <span class="daily-high">${Math.round(high)}°</span>
                <span class="daily-low">${Math.round(low)}°</span>
            </div>
            <div class="daily-condition">${getWeatherDescription(code)}</div>
        `;
        container.appendChild(dailyItem);
    }
}

// Calculate dew point
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
}

// Calculate UV index (simplified)
function calculateUVIndex(code) {
    if (code === 0) return '8-10 (Very High)';
    if (code === 1 || code === 2) return '6-7 (High)';
    if (code === 3) return '4-5 (Moderate)';
    return '2-3 (Low)';
}

// Update travel tips
function updateTravelTips(current, weatherCode) {
    const tips = [];
    
    if (current.temperature_2m > 32) {
        tips.push('🌡️ Very hot - drink plenty of water and wear light clothing');
    }
    
    if (current.wind_speed_10m > 20) {
        tips.push('💨 Windy conditions - secure loose items and be cautious near water');
    }
    
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
        tips.push('☔ Rain expected - bring an umbrella and plan indoor activities');
    } else {
        tips.push('☀️ Good weather for outdoor activities and water sports');
    }
    
    if (current.relative_humidity_2m > 80) {
        tips.push('💧 High humidity - take it easy and stay hydrated');
    }
    
    if ([95, 96, 99].includes(weatherCode)) {
        tips.push('⚡ Thunderstorm warning - avoid open areas and water activities');
    } else {
        tips.push('✅ Perfect time to visit beaches and enjoy tours');
    }

    const tipsList = document.getElementById('travelTips');
    tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    document.getElementById('currentTime').textContent = `Current Time: ${timeString}`;
}

// Show/hide UI elements
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('weatherContent').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

function showWeatherContent() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('weatherContent').style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
}

function showError(message) {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('weatherContent').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('errorMessage').textContent = '❌ ' + message;
}

// Initialize season and recommendations
function updateSeasonInfo() {
    const month = new Date().getMonth();
    
    if (month >= 4 && month <= 9) {
        document.getElementById('season').textContent = 'Dry Season ☀️';
        document.getElementById('bestForTours').textContent = 'Excellent - Perfect for all tours';
        document.getElementById('recommendation').textContent = 'Best time to visit! Water is calm and clear.';
    } else {
        document.getElementById('season').textContent = 'Rainy Season 🌧️';
        document.getElementById('bestForTours').textContent = 'Good - Some afternoon showers';
        document.getElementById('recommendation').textContent = 'Still great for activities, just plan around showers.';
    }
}

// Call on load
updateSeasonInfo();

console.log('✅ Weather dashboard loaded successfully!');
console.log('📍 Using Open-Meteo API (Free, No API Key Required)');
