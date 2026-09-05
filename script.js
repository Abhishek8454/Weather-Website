// =========================
// HTML Elements
// =========================

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const locationBtn =
    document.getElementById("locationBtn");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const cityName =
    document.getElementById("cityName");

const temperature =
    document.getElementById("temperature");

const temperatureUnit =
    document.getElementById("temperatureUnit");

const weatherIcon =
    document.getElementById("weatherIcon");

const condition =
    document.getElementById("condition");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const feelsLike =
    document.getElementById("feelsLike");

const rain =
    document.getElementById("rain");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const hourlyForecast =
    document.getElementById("hourlyForecast");

const dailyForecast =
    document.getElementById("dailyForecast");
const weatherContent =
    document.getElementById("weatherContent");

const celsiusBtn =
    document.getElementById("celsiusBtn");

const fahrenheitBtn =
    document.getElementById("fahrenheitBtn");


// =========================
// Temperature Variables
// =========================

let currentCelsius = 0;

let currentFeelsLike = 0;

let selectedUnit = "C";

let weatherData = null;


// =========================
// Search Button
// =========================

searchBtn.addEventListener("click", () => {

    const city =
        cityInput.value.trim();

    if (city === "") {

        errorMessage.textContent =
            "❌ Please enter a city name.";

        errorMessage.style.display =
            "block";

        return;
    }

    getWeather(city);

});


// =========================
// Enter Key
// =========================

cityInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            searchBtn.click();

        }

    }
);


// =========================
// Get Weather By City
// =========================

async function getWeather(city) {

    loading.style.display =
        "block";

    errorMessage.style.display =
        "none";

    try {

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response =
            await fetch(geoURL);

        const data =
            await response.json();

        if (
            !data.results ||
            data.results.length === 0
        ) {

            errorMessage.textContent =
                "❌ City not found. Please try another city.";

            errorMessage.style.display =
                "block";

            return;
        }

        const location =
            data.results[0];

        await getWeatherData(
            location.latitude,
            location.longitude,
            location.name
        );

    }

    catch (error) {

        console.log(error);

        errorMessage.textContent =
            "❌ Unable to load weather.";

        errorMessage.style.display =
            "block";

    }

    finally {

        loading.style.display =
            "none";

    }

}


// =========================
// Weather API
// =========================

async function getWeatherData(
    latitude,
    longitude,
    city
) {

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7`;

        const response =
            await fetch(url);

        const data =
            await response.json();
        weatherContent.style.display = "block";

        weatherData = data;


        // =========================
        // Current Weather
        // =========================

        cityName.textContent =
            city;

        currentCelsius =
            data.current.temperature_2m;

        currentFeelsLike =
            data.current.apparent_temperature;

        updateCurrentTemperature();


        humidity.textContent =
            data.current.relative_humidity_2m
            + "%";


        wind.textContent =
            Math.round(
                data.current.wind_speed_10m
            )
            + " km/h";


        // =========================
        // Weather Condition
        // =========================

        const code =
            data.current.weather_code;

        weatherIcon.textContent =
            getIcon(code);

        condition.textContent =
            getCondition(code);


        // =========================
        // Sunrise / Sunset
        // =========================

        sunrise.textContent =
            formatTime(
                data.daily.sunrise[0]
            );

        sunset.textContent =
            formatTime(
                data.daily.sunset[0]
            );


        // =========================
        // Rain
        // =========================

        rain.textContent =
            data.daily
                .precipitation_probability_max[0]
            + "%";


        // =========================
        // Background
        // =========================

        changeBackground(
            code,
            data.current.is_day
        );


        // =========================
        // Forecast
        // =========================

        showHourly(data);

        showDaily(data);

    }

    catch (error) {

        console.log(error);

        errorMessage.textContent =
            "❌ Unable to load weather.";

        errorMessage.style.display =
            "block";

    }

}


// =========================
// Temperature Update
// =========================

function updateCurrentTemperature() {

    let temp =
        currentCelsius;

    let feels =
        currentFeelsLike;


    if (selectedUnit === "F") {

        temp =
            (currentCelsius * 9 / 5) + 32;

        feels =
            (currentFeelsLike * 9 / 5) + 32;

    }


    temperature.textContent =
        Math.round(temp);

    temperatureUnit.textContent =
        "°" + selectedUnit;

    feelsLike.textContent =
        Math.round(feels)
        + "°"
        + selectedUnit;

}


// =========================
// Celsius
// =========================

celsiusBtn.addEventListener(
    "click",
    () => {

        selectedUnit = "C";

        updateCurrentTemperature();

        celsiusBtn.classList.add("active");

        fahrenheitBtn.classList.remove("active");

        refreshForecast();

    }
);


// =========================
// Fahrenheit
// =========================

fahrenheitBtn.addEventListener(
    "click",
    () => {

        selectedUnit = "F";

        updateCurrentTemperature();

        fahrenheitBtn.classList.add("active");

        celsiusBtn.classList.remove("active");

        refreshForecast();

    }
);


// =========================
// Weather Icon
// =========================

function getIcon(code) {

    if (code === 0) {
        return "☀️";
    }

    if (code <= 3) {
        return "⛅";
    }

    if (code <= 48) {
        return "🌫️";
    }

    if (code <= 67) {
        return "🌧️";
    }

    if (code <= 77) {
        return "❄️";
    }

    if (code <= 82) {
        return "🌦️";
    }

    if (code <= 86) {
        return "❄️";
    }

    if (code >= 95) {
        return "⛈️";
    }

    return "🌤️";

}


// =========================
// Weather Condition
// =========================

function getCondition(code) {

    if (code === 0) {
        return "Clear Sky";
    }

    if (code <= 3) {
        return "Cloudy";
    }

    if (code <= 48) {
        return "Fog";
    }

    if (code <= 67) {
        return "Rain";
    }

    if (code <= 77) {
        return "Snow";
    }

    if (code <= 82) {
        return "Rain Showers";
    }

    if (code <= 86) {
        return "Snow Showers";
    }

    if (code >= 95) {
        return "Thunderstorm";
    }

    return "Unknown";

}


// =========================
// Background
// =========================

function changeBackground(
    code,
    isDay
) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "night"
    );


    if (!isDay) {

        document.body.classList.add("night");

    }

    else if (code === 0) {

        document.body.classList.add("sunny");

    }

    else if (code >= 51) {

        document.body.classList.add("rainy");

    }

    else {

        document.body.classList.add("cloudy");

    }

}


// =========================
// Hourly Forecast
// =========================

function showHourly(data) {

    hourlyForecast.innerHTML = "";

    const currentHour =
        new Date().getHours();

    let startIndex = 0;


    for (
        let i = 0;
        i < data.hourly.time.length;
        i++
    ) {

        const hour =
            new Date(
                data.hourly.time[i]
            ).getHours();

        if (hour >= currentHour) {

            startIndex = i;

            break;

        }

    }


    for (
        let i = startIndex;
        i < startIndex + 6;
        i++
    ) {

        if (
            i >= data.hourly.time.length
        ) {
            break;
        }


        let temp =
            data.hourly.temperature_2m[i];


        if (selectedUnit === "F") {

            temp =
                (temp * 9 / 5) + 32;

        }


        const card =
            document.createElement("div");

        card.className =
            "forecast-card";


        card.innerHTML = `

            <p>
                ${formatTime(
                    data.hourly.time[i]
                )}
            </p>

            <p>
                ${getIcon(
                    data.hourly.weather_code[i]
                )}
            </p>

            <p>
                ${Math.round(temp)}
                °${selectedUnit}
            </p>

            <p>
                🌧️
                ${data.hourly
                    .precipitation_probability[i]
                }%
            </p>

        `;


        hourlyForecast.appendChild(card);

    }

}


// =========================
// 7 Day Forecast
// =========================

function showDaily(data) {

    dailyForecast.innerHTML = "";


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        let maxTemp =
            data.daily
                .temperature_2m_max[i];

        let minTemp =
            data.daily
                .temperature_2m_min[i];


        if (selectedUnit === "F") {

            maxTemp =
                (maxTemp * 9 / 5) + 32;

            minTemp =
                (minTemp * 9 / 5) + 32;

        }


        const weather =
            getCondition(
                data.daily.weather_code[i]
            );


        const rainChance =
            data.daily
                .precipitation_probability_max[i];


        const card =
            document.createElement("div");

        card.className =
            "forecast-card";


        card.innerHTML = `

            <p>
                ${getDay(
                    data.daily.time[i]
                )}
            </p>

            <p>
                ${getIcon(
                    data.daily.weather_code[i]
                )}
            </p>

            <p>
                ${Math.round(maxTemp)}
                ° /
                ${Math.round(minTemp)}
                °${selectedUnit}
            </p>

            <p>
                ${weather}
            </p>

            <p>
                🌧️ ${rainChance}%
            </p>

        `;


        dailyForecast.appendChild(card);

    }

}


// =========================
// Refresh Forecast
// =========================

function refreshForecast() {

    if (weatherData === null) {
        return;
    }

    showHourly(weatherData);

    showDaily(weatherData);

}


// =========================
// Day Name
// =========================

function getDay(date) {

    return new Date(date)
        .toLocaleDateString(
            "en-US",
            {
                weekday: "short"
            }
        );

}


// =========================
// Time Format
// =========================

function formatTime(time) {

    return new Date(time)
        .toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

}


// =========================
// My Location
// =========================

locationBtn.addEventListener(
    "click",
    () => {

        if (!navigator.geolocation) {

            alert(
                "Location is not supported"
            );

            return;

        }


        loading.style.display =
            "block";

        errorMessage.style.display =
            "none";


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                try {

                    const weatherPromise =
                        getWeatherData(
                            latitude,
                            longitude,
                            "My Location"
                        );


                    const cityPromise =
                        fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                        )
                        .then(
                            response =>
                                response.json()
                        );


                    const cityData =
                        await cityPromise;


                    const address =
                        cityData.address || {};


                    const city =
                        address.city ||
                        address.town ||
                        address.village ||
                        address.municipality ||
                        address.county ||
                        "My Location";


                    cityName.textContent =
                        city;


                    await weatherPromise;


                    cityName.textContent =
                        city;

                }

                catch (error) {

                    console.log(error);

                    errorMessage.textContent =
                        "❌ Unable to find your city.";

                    errorMessage.style.display =
                        "block";

                }

                finally {

                    loading.style.display =
                        "none";

                }

            },


            () => {

                loading.style.display =
                    "none";


                errorMessage.textContent =
                    "❌ Please allow location permission.";

                errorMessage.style.display =
                    "block";

            },


            {
                enableHighAccuracy: false,

                timeout: 5000,

                maximumAge: 60000

            }

        );

    }
);
// =========================
// Light / Dark Mode
// =========================

const themeBtn =
    document.getElementById("themeBtn");


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );


        if (
            document.body.classList.contains(
                "dark-mode"
            )
        ) {

            themeBtn.textContent =
                "☀️ Light Mode";

        }

        else {

            themeBtn.textContent =
                "🌙 Dark Mode";

        }

    }
);
