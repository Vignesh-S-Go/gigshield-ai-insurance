import crypto from 'crypto'
import { supabase } from '../config/supabase.js'
import { analyzeClaim, explainClaim } from '../services/aiService.js'
import { validateClaim, normalizeClaimType } from '../services/claimService.js'
import { getISTISODate, formatIST, normalizePhone } from '../utils/timeUtils.js'

export const getClaims = async (req, res, next) => {
    try {
        const { status, trigger_type, worker_id, search } = req.query

        let query = supabase
            .from('claims')
            .select(`
                *,
                workers (id, name, city)
            `)

        if (status && status !== 'All') query = query.eq('status', status)
        if (trigger_type && trigger_type !== 'All') query = query.eq('trigger_type', trigger_type)
        if (worker_id) query = query.eq('worker_id', worker_id)
        if (search) {
            query = query.or(`workers.name.ilike.%${search}%,id.ilike.%${search}%`)
        }

        const { data, error } = await query.order('created_at', { ascending: false })
        if (error) throw error

        const claimsWithWorker = data.map((claim) => ({
            id: claim.id,
            workerId: claim.worker_id,
            workerName: claim.workers?.name,
            workerCity: claim.workers?.city,
            triggerType: claim.claim_type || claim.trigger_type,
            status: claim.status,
            payoutAmount: parseFloat(claim.payout || claim.payout_amount),
            date: claim.created_at,
            triggerData: claim.trigger_data,
            validationStatus: claim.validation_status,
            gpsVerified: claim.gps_verified,
            processingTime: claim.processing_time,
            weatherSource: claim.weather_source,
            blockchain_tx: claim.blockchain_tx
        }))

        res.json({ success: true, count: claimsWithWorker.length, data: claimsWithWorker })
    } catch (error) {
        next(error)
    }
}

export const getClaimById = async (req, res, next) => {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from('claims')
            .select(`
                *,
                workers (id, name, city, risk_score)
            `)
            .eq('id', id)
            .single()

        if (error) throw error

        res.json({ success: true, data })
    } catch (error) {
        next(error)
    }
}

export const createClaim = async (req, res, next) => {
    try {
        const { worker_id, trigger_type, trigger_data, claim_type, phone, requested_payout } = req.body
        const normalizedClaim = normalizeClaimType(claim_type || trigger_type)
        const workerId = worker_id || await resolveWorkerIdByPhone(phone)

        if (!workerId) {
            return res.status(400).json({ success: false, message: 'worker_id or valid phone is required' })
        }

        const { data: worker } = await supabase
            .from('workers')
            .select('id, name, city, risk_score')
            .eq('id', workerId)
            .single()

        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found' })
        }

        const { data: policy } = await supabase
            .from('policies')
            .select('*')
            .eq('worker_id', workerId)
            .eq('status', 'Active')
            .maybeSingle()

        const validation = validateClaim({
            riskScore: Number(worker.risk_score || 0),
            claimType: normalizedClaim,
            requestedPayout: requested_payout,
            maxPayout: policy?.max_payout || 5000,
            policy
        })

        let aiAnalysis = { incident_type: 'EMERGENCY', severity: 'HIGH', confidence_score: 0.9 }
        try {
            aiAnalysis = await analyzeClaim(req.body.description || `${normalizedClaim} claim reported in ${worker.city}`)
        } catch (error) {
            console.log('[CLAIM] Using fallback AI analysis')
        }

        let aiInsight = 'Claim evaluated using deterministic fallback rules.'
        try {
            aiInsight = await explainClaim({ trigger_type: normalizedClaim, policy }, validation.claimStatus)
        } catch (error) {
            console.log('[CLAIM] Using fallback explanation')
        }

        const { data: newClaim, error } = await supabase
            .from('claims')
            .insert([{
                worker_id: workerId,
                trigger_type: normalizedClaim,
                claim_type: normalizedClaim,
                status: validation.claimStatus,
                payout_amount: validation.payout,
                payout: validation.payout,
                trigger_data: trigger_data || {},
                validation_status: validation.claimStatus === 'Flagged' ? 'Failed' : 'Passed',
                gps_verified: true,
                processing_time: 'Auto (< 1 min)',
                weather_source: 'IMD API',
                ai_meta: aiAnalysis,
                date: getISTISODate()
            }])
            .select()
            .single()

        if (error) throw error

        const txHash = crypto.createHash('sha256').update(`${newClaim.id}-${validation.claimStatus}`).digest('hex')

        await supabase
            .from('claims')
            .update({ blockchain_tx: `0x${txHash}` })
            .eq('id', newClaim.id)

        console.log(`[CLAIM: IST] New claim created at ${formatIST(new Date(), { dateStyle: 'medium', timeStyle: 'medium' })}`)

        if (validation.claimStatus === 'Approved' || validation.claimStatus === 'Paid') {
            await createNotification({
                worker_id: workerId,
                title: 'Claim Approved',
                message: `Your claim for ${normalizedClaim} has been ${validation.claimStatus.toLowerCase()}. Amount: Rs ${validation.payout}`,
                type: 'success',
                icon: 'approved'
            })
        } else if (validation.claimStatus === 'Flagged') {
            await createNotification({
                worker_id: workerId,
                title: 'Claim Flagged',
                message: `Your claim for ${normalizedClaim} requires review.`,
                type: 'warning',
                icon: 'review'
            })
        }

        res.status(201).json({
            success: true,
            data: { ...newClaim, blockchain_tx: `0x${txHash}` },
            validation,
            ai_insight: aiInsight
        })
    } catch (error) {
        next(error)
    }
}

export const validateClaimRequest = async (req, res, next) => {
    try {
        const { worker_id, claim_type, trigger_type, requested_payout, max_payout } = req.body
        let worker = null
        let policy = null

        if (worker_id) {
            const workerResult = await supabase
                .from('workers')
                .select('id, risk_score')
                .eq('id', worker_id)
                .maybeSingle()

            worker = workerResult.data

            const policyResult = await supabase
                .from('policies')
                .select('*')
                .eq('worker_id', worker_id)
                .eq('status', 'Active')
                .maybeSingle()

            policy = policyResult.data
        }

        const validation = validateClaim({
            riskScore: Number(worker?.risk_score || req.body.riskScore || 0),
            claimType: claim_type || trigger_type,
            requestedPayout: requested_payout,
            maxPayout: max_payout || policy?.max_payout || 5000,
            policy
        })

        res.json({ success: true, data: validation })
    } catch (error) {
        next(error)
    }
}

export const updateClaimStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status, payout_amount } = req.body

        const { data, error } = await supabase
            .from('claims')
            .update({ status, payout_amount, payout: payout_amount, updated_at: getISTISODate() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        console.log(`[CLAIM: IST] Claim ${id} status updated to ${status} at ${formatIST(new Date(), { timeStyle: 'medium' })}`)

        if (status === 'Paid') {
            await supabase.from('payouts').insert([{
                claim_id: id,
                worker_id: data.worker_id,
                amount: payout_amount,
                status: 'completed',
                processed_at: getISTISODate()
            }])
            console.log(`[PAYOUT: IST] Payout processed for claim ${id}`)
        }

        res.json({ success: true, data })
    } catch (error) {
        next(error)
    }
}

export const getClaimStats = async (req, res, next) => {
    try {
        const { data: claims } = await supabase.from('claims').select('*')

        const stats = {
            total: claims?.length || 0,
            pending: claims?.filter((claim) => claim.status === 'Pending').length || 0,
            approved: claims?.filter((claim) => claim.status === 'Approved').length || 0,
            paid: claims?.filter((claim) => claim.status === 'Paid').length || 0,
            flagged: claims?.filter((claim) => claim.status === 'Flagged').length || 0,
            byTrigger: {
                Rain: claims?.filter((claim) => (claim.claim_type || claim.trigger_type) === 'Rain').length || 0,
                Heat: claims?.filter((claim) => (claim.claim_type || claim.trigger_type) === 'Heat').length || 0,
                Flood: claims?.filter((claim) => (claim.claim_type || claim.trigger_type) === 'Flood').length || 0,
                AQI: claims?.filter((claim) => (claim.claim_type || claim.trigger_type) === 'AQI').length || 0,
                Curfew: claims?.filter((claim) => (claim.claim_type || claim.trigger_type) === 'Curfew').length || 0
            },
            totalPayout: claims?.filter((claim) => claim.status === 'Paid').reduce((sum, claim) => sum + parseFloat(claim.payout || claim.payout_amount), 0) || 0
        }

        res.json({ success: true, data: stats })
    } catch (error) {
        next(error)
    }
}

export const analyzeClaimDescription = async (req, res, next) => {
    try {
        const { description } = req.body
        if (!description) {
            return res.status(400).json({ success: false, message: 'Description required' })
        }

        const analysis = await analyzeClaim(description)
        res.json({ success: true, analysis })
    } catch (error) {
        next(error)
    }
}

async function createNotification({ worker_id, title, message, type, icon }) {
    const { data: worker } = await supabase.from('workers').select('user_id').eq('id', worker_id).single()

    await supabase.from('notifications').insert([{
        user_id: worker?.user_id,
        worker_id,
        title,
        message,
        type,
        icon,
        time_ago: 'Just now'
    }])
}

async function resolveWorkerIdByPhone(phone) {
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) return null

    const { data } = await supabase
        .from('workers')
        .select('id')
        .eq('phone', normalizedPhone)
        .maybeSingle()

    return data?.id || null
}
