import { supabase } from '../config/supabase.js'

const now = () => new Date().toISOString()

export const userModel = {
    async findByPhone(phone) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single()

        if (error) return null
        return data
    },

    async findById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return null
        return data
    },

    async create(userData) {
        const payload = {
            role: 'worker',
            platform: 'Zomato',
            is_working: false,
            total_earnings: 0,
            today_earnings: 0,
            weekly_earnings: 0,
            deliveries: 0,
            risk_score: 0.5,
            ...userData
        }

        const { data, error } = await supabase
            .from('users')
            .insert([payload])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('users')
            .update({ ...updates, updated_at: now() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateEarnings(id, earnings) {
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('total_earnings, today_earnings, weekly_earnings')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        const amount = Number(earnings.amount || 0)
        const weeklyEarnings = earnings.weekly !== undefined
            ? Number(earnings.weekly || 0)
            : Number(user.weekly_earnings || 0) + amount

        const { data, error } = await supabase
            .from('users')
            .update({
                total_earnings: Number(user.total_earnings || 0) + amount,
                today_earnings: Number(user.today_earnings || 0) + amount,
                weekly_earnings: weeklyEarnings,
                updated_at: now()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async toggleWork(id, isWorking) {
        const { data, error } = await supabase
            .from('users')
            .update({ is_working: Boolean(isWorking), updated_at: now() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async incrementDeliveries(id) {
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('deliveries')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        const { data, error } = await supabase
            .from('users')
            .update({
                deliveries: Number(user.deliveries || 0) + 1,
                updated_at: now()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}
