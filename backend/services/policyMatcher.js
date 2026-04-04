import { supabase } from '../config/supabase.js';

/**
 * @param {string} city
 * @returns {Promise<Array<{id: string, worker_id: string, max_payout: number, premium: number}>>}
 */
export const getActivePoliciesForCity = async (city) => {
    try {
        const { data, error } = await supabase
            .from('policies')
            .select('id, worker_id, max_payout, premium')
            .eq('status', 'Active')
            .eq('city', city);

        if (error) {
            console.error('[policyMatcher]', `Failed to fetch policies: ${error.message}`);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[policyMatcher]', err);
        return [];
    }
};
