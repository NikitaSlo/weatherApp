const APIKEY = "3b72c00d3c3ba8ce472f2d401cf0a5ec";
const APIURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.getElementById("city-input");
const searchBtn = document.querySelector(".search-bar button");

const clearInput = () => {
    searchBox.value = "";
};

const updateWeatherDisplay = (data) => {
    document.querySelector(".city").textContent = data.name || "Unknown";
    document.querySelector(".temp").textContent = `${Math.round(data.main.temp)} °C`;
    document.querySelector("#humidity-value").textContent = data.main.humidity || "--";
    document.querySelector("#wind-value").textContent = data.wind.speed || "--";
    document.querySelector("#pressure-value").textContent = data.main.pressure || "--";
    document.querySelector("#visibility-value").textContent = data.visibility || "--";
    document.querySelector("#precipitation-value").textContent = data.clouds.all || "--";

};

const checkWeather = async (city) => {
    try {
        const response = await fetch(`${APIURL}${city}&appid=${APIKEY}`);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();
        updateWeatherDisplay(data);
        clearInput();
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
};

const handleSearch = () => {
    const city = searchBox.value.trim();
    if (city) {
        checkWeather(city);
    } else {
        alert("Please enter a city name.");
    }
};

searchBtn.addEventListener("click", handleSearch);
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});