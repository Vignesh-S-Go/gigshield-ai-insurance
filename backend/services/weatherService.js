import axios from 'axios'

const WEATHER_API_KEY = process.env.WEATHER_API_KEY
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

const CONDITION_MAP = {
    thunderstorm: 'Storm',
    drizzle: 'Rain',
    rain: 'Rain',
    snow: 'Snow',
    mist: 'Fog',
    smoke: 'Smoke',
    haze: 'Haze',
    dust: 'Dust',
    fog: 'Fog',
    sand: 'Dust',
    ash: 'Smoke',
    squall: 'Storm',
    tornado: 'Storm',
    clear: 'Clear',
    clouds: 'Cloudy'
}

const buildWeatherResponse = (payload, fallback = false) => {
    const rawCondition = payload.weather?.[0]?.main?.toLowerCase() || 'clear'
    const condition = CONDITION_MAP[rawCondition] || payload.weather?.[0]?.main || 'Clear'
    const temp = Number(payload.main?.temp ?? 30)
    const rainfall = Number(payload.rain?.['1h'] ?? payload.rain?.['3h'] ?? 0)
    const windSpeed = Number(payload.wind?.speed ?? 0)
    const humidity = Number(payload.main?.humidity ?? 0)
    const visibility = Number(payload.visibility ?? 10000)

    return {
        city: payload.name || null,
        temp,
        condition,
        description: payload.weather?.[0]?.description || condition,
        rainfall,
        windSpeed,
        humidity,
        visibility,
        isParametricTriggered: condition === 'Rain' || condition === 'Storm' || temp >= 40,
        message: fallback ? 'Fallback weather profile applied.' : 'Live weather profile applied.',
        source: fallback ? 'fallback' : 'openweathermap'
    }
}

const buildFallbackWeather = ({ city = 'Unknown', lat, lon } = {}) => {
    const seed = Math.abs(Math.round((Number(lat) || 19.07) * 100 + (Number(lon) || 72.87) * 100))
    const fallbackTemp = 28 + (seed % 9)
    const condition = seed % 5 === 0 ? 'Rain' : seed % 7 === 0 ? 'Storm' : 'Clear'

    return {
        city,
        temp: fallbackTemp,
        condition,
        description: `${condition.toLowerCase()} conditions`,
        rainfall: condition === 'Rain' ? 6 : condition === 'Storm' ? 12 : 0,
        windSpeed: condition === 'Storm' ? 11 : 4,
        humidity: condition === 'Rain' ? 84 : 56,
        visibility: condition === 'Storm' ? 3500 : 9000,
        isParametricTriggered: condition !== 'Clear' || fallbackTemp >= 40,
        message: 'Fallback weather profile applied.',
        source: 'fallback'
    }
}

export const getWeatherByCoordinates = async (lat, lon) => {
    if (!WEATHER_API_KEY) {
        return buildFallbackWeather({ lat, lon })
    }

    try {
        const { data } = await axios.get(WEATHER_BASE_URL, {
            params: {
                lat,
                lon,
                appid: WEATHER_API_KEY,
                units: 'metric'
            },
            timeout: 5000
        })

        return buildWeatherResponse(data)
    } catch (error) {
        console.error('[WEATHER] Coordinate lookup failed:', error.message)
        return buildFallbackWeather({ lat, lon })
    }
}

export const getWeatherByCity = async (city) => {
    if (!WEATHER_API_KEY) {
        return buildFallbackWeather({ city })
    }

    try {
        const { data } = await axios.get(WEATHER_BASE_URL, {
            params: {
                q: city,
                appid: WEATHER_API_KEY,
                units: 'metric'
            },
            timeout: 5000
        })

        return buildWeatherResponse(data)
    } catch (error) {
        console.error('[WEATHER] City lookup failed:', error.message)
        return buildFallbackWeather({ city })
    }
}

export { buildFallbackWeather }
