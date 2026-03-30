import axios from 'axios';

// Fallback to demo mode if no API key is provided
const mockWeatherResponse = {
    temp: 32,
    condition: 'Rain',
    description: 'heavy intensity rain',
    isParametricTriggered: true, // IF rainfall > threshold THEN auto payout
};

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const weatherService = {
    getWeatherByCity: async (city) => {
        if (!WEATHER_API_KEY) {
            console.log("No OpenWeather API key found. Using mock simulation.");
            return Promise.resolve(mockWeatherResponse);
        }

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
            const response = await axios.get(url);

            const condition = response.data.weather[0].main;
            const description = response.data.weather[0].description;

            // Parametric Engine Trigger Logic (Auto claims if rainfall > threshold)
            // Example Rule: "Rain" triggers a parametric event.
            const isParametricTriggered = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm');

            return {
                temp: Math.round(response.data.main.temp),
                condition,
                description,
                isParametricTriggered,
                raw: response.data
            };
        } catch (error) {
            console.error("OpenWeather API Error:", error);
            return mockWeatherResponse;
        }
    }
};
