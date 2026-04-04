import { supabase } from '../config/supabase.js';

const THRESHOLDS = {
    AQI_HIGH: 300,
    HEAVY_RAIN: 150,
    FLOOD_ALERT: 8,
    HEAT_WAVE: 42
};

const MOCK_DATA = {
    Delhi: [
        { type: 'AQI_HIGH', value: 350, threshold: THRESHOLDS.AQI_HIGH },
        { type: 'HEAVY_RAIN', value: 180, threshold: THRESHOLDS.HEAVY_RAIN },
        { type: 'FLOOD_ALERT', value: 9, threshold: THRESHOLDS.FLOOD_ALERT }
    ],
    Mumbai: [
        { type: 'FLOOD_ALERT', value: 9, threshold: THRESHOLDS.FLOOD_ALERT },
        { type: 'AQI_HIGH', value: 320, threshold: THRESHOLDS.AQI_HIGH }
    ],
    Chennai: [
        { type: 'HEAVY_RAIN', value: 200, threshold: THRESHOLDS.HEAVY_RAIN },
        { type: 'AQI_HIGH', value: 310, threshold: THRESHOLDS.AQI_HIGH }
    ],
    Bangalore: [
        { type: 'HEAVY_RAIN', value: 160, threshold: THRESHOLDS.HEAVY_RAIN },
        { type: 'FLOOD_ALERT', value: 7, threshold: THRESHOLDS.FLOOD_ALERT }
    ],
    Hyderabad: [
        { type: 'HEAVY_RAIN', value: 170, threshold: THRESHOLDS.HEAVY_RAIN },
        { type: 'HEAT_WAVE', value: 44, threshold: THRESHOLDS.HEAT_WAVE }
    ]
};

const getRandomTriggerValue = (type) => {
    const variance = Math.random() * 0.3 + 0.7;
    switch (type) {
        case 'AQI_HIGH':
            return Math.round(280 + (50 * variance));
        case 'HEAVY_RAIN':
            return Math.round(140 + (80 * variance));
        case 'FLOOD_ALERT':
            return Math.round(6 + (4 * variance));
        case 'HEAT_WAVE':
            return Math.round(40 + (8 * variance));
        default:
            return 0;
    }
};

/**
 * @param {string} city
 * @returns {Promise<Array<{type: string, city: string, value: number, threshold: number, firedAt: string}>>}
 */
export const checkTriggers = async (city) => {
    try {
        const mockCity = process.env.MOCK_TRIGGER_CITY || '';
        const useMockForce = mockCity.toLowerCase() === city.toLowerCase();

        let triggers = [];

        if (useMockForce) {
            for (const [type, threshold] of Object.entries(THRESHOLDS)) {
                const value = getRandomTriggerValue(type);
                triggers.push({
                    type,
                    city,
                    value,
                    threshold,
                    firedAt: new Date().toISOString()
                });
            }
        } else {
            const cityData = MOCK_DATA[city];
            if (cityData) {
                triggers = cityData.map(t => ({
                    ...t,
                    city,
                    firedAt: new Date().toISOString()
                }));
            }
        }

        for (const trigger of triggers) {
            const { error } = await supabase
                .from('trigger_logs')
                .insert([{
                    trigger_type: trigger.type,
                    city: trigger.city,
                    value: trigger.value,
                    threshold: trigger.threshold,
                    fired_at: trigger.firedAt
                }]);

            if (error) {
                console.error('[triggerEngine]', `Failed to log trigger: ${error.message}`);
            }
        }

        return triggers;
    } catch (err) {
        console.error('[triggerEngine]', err);
        return [];
    }
};

export const THRESHOLD_MAP = THRESHOLDS;

export const VALID_TRIGGER_TYPES = Object.keys(THRESHOLDS);
