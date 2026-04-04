import { supabase } from '../config/supabase.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ELIGIBILITY_THRESHOLD = 70;

/**
 * Determine fraud status based on score
 * @param {number} score 
 * @returns {string} 'SAFE' | 'REVIEW' | 'BLOCKED'
 */
function getFraudStatus(score) {
    if (score <= 40) return 'SAFE';
    if (score <= 70) return 'REVIEW';
    return 'BLOCKED';
}

async function scoreFraud({ userId, triggerId, type }) {
    const flags = [];
    let score = 0;

    const since30 = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
    
    const { count: claimCount } = await supabase
        .from('claims')
        .select('id', { count: 'exact', head: true })
        .eq('worker_id', userId)
        .gte('created_at', since30);

    const freqScore = Math.min((claimCount || 0) * 10, 40);
    if (freqScore >= 20) flags.push('HIGH_CLAIM_FREQUENCY');
    score += freqScore;

    const { count: totalClaims } = await supabase
        .from('claims').select('id', { count: 'exact', head: true }).eq('worker_id', userId);
    const { count: rejectedClaims } = await supabase
        .from('claims').select('id', { count: 'exact', head: true })
        .eq('worker_id', userId).eq('status', 'Rejected');

    const rejectionRate = totalClaims > 0 ? (rejectedClaims || 0) / totalClaims : 0;
    const rejScore = Math.round(rejectionRate * 30);
    if (rejScore >= 15) flags.push('HIGH_REJECTION_RATE');
    score += rejScore;

    const { data: workerData } = await supabase
        .from('workers').select('joined_date').eq('id', userId).single();
    const ageMs = workerData?.joined_date ? Date.now() - new Date(workerData.joined_date).getTime() : 0;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays < 7) { score += 20; flags.push('NEW_ACCOUNT'); }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentTriggerClaims } = await supabase
        .from('claims')
        .select('id', { count: 'exact', head: true })
        .eq('worker_id', userId)
        .gte('created_at', since24h);

    if ((recentTriggerClaims || 0) >= 1) { score += 10; flags.push('TRIGGER_OVERLAP'); }

    const finalScore = Math.min(score, 100);
    const eligible = finalScore <= 70;
    const status = getFraudStatus(finalScore);

    return { 
        score: finalScore, 
        flags, 
        eligible,
        status,
        verification_status: eligible ? 'Verified' : 'Pending'
    };
}

export { scoreFraud };
