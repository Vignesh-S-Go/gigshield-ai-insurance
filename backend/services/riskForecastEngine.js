/**
 * ZeroClaim Risk Forecast Engine
 * Provides real-time risk intelligence for workers
 * Currently uses simulated data - can be enhanced with real weather APIs
 */

import { getEnvironmentalValue } from './dataProvider.js';

const RISK_LEVELS = {
    LOW: { color: 'green', label: 'Low Risk', priority: 1 },
    MEDIUM: { color: 'yellow', label: 'Medium Risk', priority: 2 },
    HIGH: { color: 'orange', label: 'High Risk', priority: 3 },
    SEVERE: { color: 'red', label: 'Severe Risk', priority: 4 }
};

const CITIES = ['Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];

function calculateRiskLevel(aqi, rainProbability, temperature) {
    let score = 0;

    if (aqi > 300) score += 4;
    else if (aqi > 200) score += 3;
    else if (aqi > 150) score += 2;
    else if (aqi > 100) score += 1;

    if (rainProbability > 80) score += 3;
    else if (rainProbability > 60) score += 2;
    else if (rainProbability > 40) score += 1;

    if (temperature > 44) score += 3;
    else if (temperature > 42) score += 2;
    else if (temperature > 38) score += 1;

    if (score >= 8) return 'SEVERE';
    if (score >= 5) return 'HIGH';
    if (score >= 2) return 'MEDIUM';
    return 'LOW';
}

function generateRiskMessage(riskLevel, aqi, rainProbability, temperature) {
    const messages = {
        SEVERE: [
            'Severe weather alert. Consider pausing work for safety.',
            'Extremely high AQI levels. Outdoor work not recommended.',
            'Heavy rainfall expected. Risk of flooding in your area.'
        ],
        HIGH: [
            'AQI rising. Consider reducing outdoor work hours.',
            'Heavy rain expected in your area within 2 hours.',
            'High temperature warning. Stay hydrated and take breaks.'
        ],
        MEDIUM: [
            'Monitor weather conditions. Be prepared for sudden changes.',
            'Light rain possible. Keep rain gear ready.',
            'Air quality moderate. Consider mask if sensitive.'
        ],
        LOW: [
            'Conditions favorable for work. Stay safe!',
            'Clear skies ahead. Good day for deliveries.',
            'All clear. Normal operations recommended.'
        ]
    };

    const possibleMessages = messages[riskLevel] || messages.LOW;
    return possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
}

function generateNextEvent(riskLevel, city) {
    const events = {
        SEVERE: [
            'Heavy rainfall expected in 30 minutes',
            'AQI to cross 300 in 1 hour',
            'Flash flood warning issued'
        ],
        HIGH: [
            'Rain expected in 2 hours',
            'AQI rising to unhealthy levels',
            'Heat wave alert in 3 hours'
        ],
        MEDIUM: [
            'Light rain possible in 4 hours',
            'AQI may increase later today',
            'Partly cloudy with chance of rain'
        ],
        LOW: [
            'No significant weather events expected',
            'Clear conditions for next 6 hours',
            'Stable weather pattern'
        ]
    };

    const possibleEvents = events[riskLevel] || events.LOW;
    return possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
}

/**
 * Get risk forecast for a city
 * @param {string} city - City name
 * @returns {Promise<Object>} Risk forecast data
 */
export async function getRiskForecast(city = 'Hyderabad') {
    try {
        let aqi, temperature;
        
        try {
            aqi = await getEnvironmentalValue('AQI_HIGH');
            temperature = await getEnvironmentalValue('HEAT_WAVE');
        } catch (e) {
            aqi = 120 + Math.floor(Math.random() * 80);
            temperature = 36 + Math.floor(Math.random() * 8);
        }

        const rainProbability = Math.floor(30 + Math.random() * 60);
        
        const riskLevel = calculateRiskLevel(aqi, rainProbability, temperature);
        const riskInfo = RISK_LEVELS[riskLevel];
        
        return {
            location: city,
            timestamp: new Date().toISOString(),
            current: {
                aqi: aqi,
                temperature: temperature,
                rain_probability: rainProbability,
                risk_level: riskLevel,
                risk_label: riskInfo.label,
                risk_color: riskInfo.color
            },
            forecast: {
                next_event: generateNextEvent(riskLevel, city),
                message: generateRiskMessage(riskLevel, aqi, rainProbability, temperature),
                recommendation: riskLevel === 'SEVERE' || riskLevel === 'HIGH' 
                    ? 'Consider pausing work or reducing hours'
                    : 'Continue normal operations'
            },
            triggers: {
                rain_threshold: 75,
                aqi_threshold: 150,
                heat_threshold: 42,
                flood_alert: riskLevel === 'SEVERE'
            }
        };
    } catch (err) {
        console.error('[riskForecastEngine]', err.message);
        return getFallbackRisk(city);
    }
}

/**
 * Get fallback risk data when API fails
 */
function getFallbackRisk(city) {
    return {
        location: city,
        timestamp: new Date().toISOString(),
        current: {
            aqi: 145,
            temperature: 38,
            rain_probability: 45,
            risk_level: 'MEDIUM',
            risk_label: 'Medium Risk',
            risk_color: 'yellow'
        },
        forecast: {
            next_event: 'Light rain possible in 4 hours',
            message: 'Monitor weather conditions. Be prepared for sudden changes.',
            recommendation: 'Continue normal operations'
        },
        triggers: {
            rain_threshold: 75,
            aqi_threshold: 150,
            heat_threshold: 42,
            flood_alert: false
        }
    };
}

/**
 * Get risk for multiple cities
 * @param {Array<string>} cities
 * @returns {Promise<Array>}
 */
export async function getMultiCityRisk(cities = CITIES) {
    const forecasts = [];
    for (const city of cities) {
        const forecast = await getRiskForecast(city);
        forecasts.push(forecast);
    }
    return forecasts;
}