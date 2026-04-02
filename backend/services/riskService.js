import { getWeatherByCoordinates } from './weatherService.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const calculateRisk = async ({ lat, lon, isWorking = false }) => {
    const factors = []
    let riskScore = 22

    const weather = await getWeatherByCoordinates(lat, lon)
    const condition = weather.condition.toLowerCase()
    const temperature = Number(weather.temp || 0)

    if (condition.includes('rain')) {
        riskScore += 18
        factors.push({ type: 'WEATHER', impact: 18, message: 'Rainfall is increasing road and delivery delay risk.' })
    }

    if (condition.includes('storm')) {
        riskScore += 28
        factors.push({ type: 'WEATHER', impact: 28, message: 'Storm conditions raise accident and disruption probability.' })
    }

    if (temperature >= 40) {
        riskScore += 18
        factors.push({ type: 'TEMPERATURE', impact: 18, message: `Extreme heat detected at ${Math.round(temperature)} C.` })
    } else if (temperature >= 35) {
        riskScore += 10
        factors.push({ type: 'TEMPERATURE', impact: 10, message: `High heat detected at ${Math.round(temperature)} C.` })
    }

    if (weather.windSpeed >= 10) {
        riskScore += 8
        factors.push({ type: 'WIND', impact: 8, message: 'High wind conditions can affect rider stability.' })
    }

    if (weather.visibility <= 4000) {
        riskScore += 8
        factors.push({ type: 'VISIBILITY', impact: 8, message: 'Low visibility detected in the delivery zone.' })
    }

    if (isWorking) {
        riskScore += 12
        factors.push({ type: 'WORK_STATUS', impact: 12, message: 'Active delivery session increases exposure.' })
    }

    riskScore = clamp(Math.round(riskScore), 0, 100)

    return {
        riskScore,
        status: riskScore >= 75 ? 'HIGH_RISK' : riskScore >= 45 ? 'MODERATE_RISK' : 'LOW_RISK',
        factors,
        weather: {
            condition: weather.condition,
            temperature: Math.round(temperature),
            description: weather.description,
            rainfall: weather.rainfall,
            windSpeed: weather.windSpeed,
            source: weather.source
        }
    }
}

export const calculateRiskScore = (user, activeGig = null, weatherData = null) => {
    let score = Number(user?.safety_score ?? user?.risk_score ?? 78)
    const factors = []

    if (activeGig?.start_time) {
        const hours = (Date.now() - new Date(activeGig.start_time).getTime()) / (1000 * 60 * 60)
        if (hours > 8) {
            score -= 25
            factors.push({ type: 'FATIGUE', impact: -25, message: 'Continuous work past 8 hours materially increases fatigue risk.' })
        } else if (hours > 4) {
            score -= 10
            factors.push({ type: 'FATIGUE', impact: -10, message: 'Extended session duration is raising fatigue risk.' })
        }
    }

    if (weatherData?.condition === 'Storm') {
        score -= 20
        factors.push({ type: 'WEATHER', impact: -20, message: 'Severe storm conditions reduce worker safety score.' })
    } else if (weatherData?.condition === 'Rain') {
        score -= 8
        factors.push({ type: 'WEATHER', impact: -8, message: 'Rain conditions reduce route safety.' })
    }

    score = clamp(Math.round(score), 5, 100)

    return {
        score,
        status: score > 75 ? 'SAFE' : score > 45 ? 'CAUTION' : 'HIGH_RISK',
        explanation: `Score ${score}/100: ${factors[0]?.message || 'Normal operational parameters.'}`,
        factors
    }
}
