import { userModel } from '../models/userModel.js'
import { normalizePhone } from '../utils/timeUtils.js'
import { supabase } from '../config/supabase.js'

const getWorkerByPhone = async (phone) => {
    const { data } = await supabase
        .from('workers')
        .select('*')
        .eq('phone', phone)
        .maybeSingle()

    return data
}

const syncWorkerProfile = async (user, updates = {}, deliveryAmount = 0) => {
    const worker = await getWorkerByPhone(user.phone)
    if (!worker) return null

    const workerUpdates = {
        updated_at: new Date().toISOString()
    }

    if (updates.platform) {
        workerUpdates.delivery_platform = updates.platform
    }

    if (updates.is_working !== undefined) {
        workerUpdates.status = updates.is_working ? 'active' : 'inactive'
    }

    if (deliveryAmount > 0) {
        workerUpdates.total_earnings = Number(worker.total_earnings || 0) + deliveryAmount
        workerUpdates.weekly_earnings = Number(worker.weekly_earnings || 0) + deliveryAmount
        workerUpdates.total_deliveries = Number(worker.total_deliveries || 0) + 1
    }

    const hasMeaningfulUpdate = Object.keys(workerUpdates).some((key) => key !== 'updated_at')
    if (!hasMeaningfulUpdate) {
        return worker
    }

    const { data, error } = await supabase
        .from('workers')
        .update(workerUpdates)
        .eq('id', worker.id)
        .select('*')
        .single()

    if (error) throw error
    return data
}

export const getUserByPhone = async (req, res, next) => {
    try {
        const { phone } = req.params
        const normalizedPhone = normalizePhone(phone)

        const user = await userModel.findByPhone(normalizedPhone)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const worker = await getWorkerByPhone(normalizedPhone)

        res.json({ success: true, data: formatUser(user, worker) })
    } catch (error) {
        next(error)
    }
}

export const createUser = async (req, res, next) => {
    try {
        const { phone, name, role, platform, email } = req.body
        const normalizedPhone = normalizePhone(phone)

        const existing = await userModel.findByPhone(normalizedPhone)
        if (existing) {
            return res.status(400).json({ success: false, message: 'User already exists' })
        }

        const user = await userModel.create({
            phone: normalizedPhone,
            name: name || `User_${normalizedPhone.slice(-4)}`,
            role: role || 'worker',
            email: email || null,
            platform: platform || 'Zomato',
            deliveries: 0,
            rating: 4.5,
            today_earnings: 0,
            total_earnings: 0
        })

        res.status(201).json({ success: true, data: formatUser(user, null) })
    } catch (error) {
        next(error)
    }
}

export const updateUser = async (req, res, next) => {
    try {
        const { id, name, role, platform, email } = req.body
        const updates = {}

        if (name) updates.name = name
        if (role) updates.role = role
        if (platform) updates.platform = platform
        if (email !== undefined) updates.email = email

        const user = await userModel.update(id, updates)
        const worker = await syncWorkerProfile(user, updates)

        res.json({ success: true, data: formatUser(user, worker) })
    } catch (error) {
        next(error)
    }
}

export const toggleWork = async (req, res, next) => {
    try {
        const { id, isWorking } = req.body

        const user = await userModel.toggleWork(id, isWorking)
        const worker = await syncWorkerProfile(user, { is_working: Boolean(isWorking) })

        res.json({ success: true, data: formatUser(user, worker) })
    } catch (error) {
        next(error)
    }
}

export const updateEarnings = async (req, res, next) => {
    try {
        const { id, amount, weekly } = req.body
        const numericAmount = Number(amount || 0)

        if (Number.isNaN(numericAmount)) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' })
        }

        const user = await userModel.updateEarnings(id, { amount: numericAmount, weekly })
        const existingUser = await userModel.findById(id)
        const worker = existingUser ? await getWorkerByPhone(existingUser.phone) : null

        res.json({ success: true, data: formatUser(user, worker) })
    } catch (error) {
        next(error)
    }
}

export const completeDelivery = async (req, res, next) => {
    try {
        const { id } = req.body
        const user = await userModel.findById(id)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const amount = Math.floor(Math.random() * 51) + 30

        await userModel.updateEarnings(id, { amount })
        const updatedUser = await userModel.incrementDeliveries(id)
        const worker = await syncWorkerProfile(user, {}, amount)

        res.json({
            success: true,
            data: {
                amount,
                totalEarnings: Number(updatedUser.total_earnings || 0),
                todayEarnings: Number(updatedUser.today_earnings || 0),
                deliveries: Number(updatedUser.deliveries || 0),
                riskScore: Number(worker?.risk_score || user.risk_score || 0.5)
            }
        })
    } catch (error) {
        next(error)
    }
}

function formatUser(user, worker) {
    return {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        platform: user.platform || worker?.delivery_platform || 'Zomato',
        isWorking: Boolean(user.is_working),
        totalEarnings: Number(user.total_earnings || 0),
        todayEarnings: Number(user.today_earnings || 0),
        weeklyEarnings: Number(user.weekly_earnings || 0),
        deliveries: Number(user.deliveries || 0),
        rating: Number(user.rating || 4.5),
        riskScore: Number(worker?.risk_score || user.risk_score || 0.5),
        createdAt: user.created_at
    }
}
