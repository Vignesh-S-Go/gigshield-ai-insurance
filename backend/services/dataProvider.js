const MOCK_RANGES = {
    AQI_HIGH: { min: 120, max: 220, unit: 'AQI' },
    HEAVY_RAIN: { min: 30, max: 90, unit: 'mm/hr' },
    FLOOD_ALERT: { min: 1, max: 4, unit: 'severity_level' },
    HEAT_WAVE: { min: 38, max: 45, unit: 'celsius' }
};

function getMockValue(type) {
    const r = MOCK_RANGES[type];
    if (!r) return 0;
    return parseFloat((Math.random() * (r.max - r.min) + r.min).toFixed(1));
}

async function getRealValue(type) {
    if (type === 'AQI_HIGH') {
        const apiKey = process.env.IQAIR_API_KEY;
        if (!apiKey || apiKey === 'your_iqair_api_key_here') {
            console.log('[dataProvider] Using mock AQI (no valid IQAir key)');
            return getMockValue(type);
        }
        try {
            // IQAir API - Using nearest city endpoint
            const response = await fetch(`https://api.airvisual.com/v2/nearest_city?key=${apiKey}`);
            const data = await response.json();
            if (data.status === 'success') {
                return data.data.current.pollution.aqius;
            }
            console.log('[dataProvider] IQAir API error, using mock:', data);
            return getMockValue(type);
        } catch (err) {
            console.log('[dataProvider] IQAir fetch failed, using mock:', err.message);
            return getMockValue(type);
        }
    }
    
    if (type === 'HEAVY_RAIN') {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            console.log('[dataProvider] Using mock rain (no weather API key)');
            return getMockValue(type);
        }
        try {
            // OpenWeatherMap API for Hyderabad
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Hyderabad&appid=${apiKey}&units=metric`);
            const data = await response.json();
            if (data.rain) {
                return data.rain['1h'] || data.rain['3h'] || 0;
            }
            return getMockValue(type);
        } catch (err) {
            console.log('[dataProvider] Weather API failed, using mock:', err.message);
            return getMockValue(type);
        }
    }
    
    if (type === 'FLOOD_ALERT') {
        // No free flood API - use mock
        return getMockValue(type);
    }
    
    if (type === 'HEAT_WAVE') {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            return getMockValue(type);
        }
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Hyderabad&appid=${apiKey}&units=metric`);
            const data = await response.json();
            if (data.main) {
                return data.main.temp;
            }
            return getMockValue(type);
        } catch (err) {
            return getMockValue(type);
        }
    }
    
    throw new Error(`Unknown trigger type: ${type}`);
}

async function getEnvironmentalValue(type) {
    if (process.env.USE_REAL_API === 'true') {
        console.log(`[dataProvider] Fetching real data for ${type}`);
        return getRealValue(type);
    }
    return getMockValue(type);
}

export { getEnvironmentalValue, getMockValue };
