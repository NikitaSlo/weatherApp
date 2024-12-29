const apiKey = "3b72c00d3c3ba8ce472f2d401cf0a5ec"; 
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');

// Load countries data
let countriesData = {};

const loadCountriesData = async () => {
    const response = await fetch('../resources/countries.json');
    countriesData = await response.json();
};

const findCountryByCity = (city) => {
    // Traverse countries data to find the country by city
    for (const [country, cities] of Object.entries(countriesData)) {
        if (cities.includes(city)) {
            return country; // Return the country name if city is found
        }
    }
    return null; // If no country found
};

const getWeatherInfo = (input = cityInput.value) => {
    if (input) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {

                if (data.cod === 200) {
                    temperatureEl.textContent = data.main.temp;
                    humidityEl.textContent = data.main.humidity;
                    windSpeedEl.textContent = data.wind.speed;

                    // Check if input matches a country directly
                    if (countriesData[input]) {
                        const country = input; // The input is a country
                        setHighlight(country); // Highlight the country on the map
                        cityInput.value = country; // Set the country name in the input field
                    } else {
                        // Find the country for the input city
                        const country = findCountryByCity(input);
                        if (country) {
                            setHighlight(country); // Highlight the country on the map
                            cityInput.value = input; // Set the country name in the input field
                        }
                    }
                } else {
                    alert('Город не найден. Пожалуйста, проверьте ввод.');
                }
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert('Ошибка при получении данных о погоде.');
            });
    } else {
        alert('Введите название города или страны.');
    }
};

const handleSearch = (city = cityInput.value) => {
    city = city.trim();
    cityInput.value = city;

    if (city) {
        getWeatherInfo(city);
    } else {
        alert("Пожалуйста, введите название города.");
    }
};



let currentlyHighlighted = null; // Variable to keep track of the currently highlighted country

// Highlight the country by name
const setHighlight = (countryName) => {
    if (currentlyHighlighted) {
        // Reset the previously highlighted country
        const previousCountryElement = document.querySelector(`path[data-name="${currentlyHighlighted}"]`);
        if (previousCountryElement) {
            d3.select(previousCountryElement).attr("fill", "lightgray"); // Reset to original color (transparent or default)
        }
    }

    // Set the new highlighted country
    const countryElement = document.querySelector(`path[data-name="${countryName}"]`);
    if (countryElement) {
        d3.select(countryElement).attr("fill", "orange"); // Change color to highlight
        currentlyHighlighted = countryName; // Update the currently highlighted country
    }
};

// Load countries data when the script loads
loadCountriesData();

searchBtn.addEventListener('click', () => handleSearch());
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});

export { handleSearch, setHighlight };