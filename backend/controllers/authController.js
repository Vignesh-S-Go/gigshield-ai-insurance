import { supabase } from '../config/supabase.js';
import { generateOtp } from '../services/otpService.js';
import { getISTDate, addMinutesIST, isExpiredIST, formatIST } from '../utils/timeUtils.js';

function normalizePhone(phone) {
    if (!phone) return null;
    // Remove all spaces and +91 prefix first
    const cleaned = phone.replace(/\s/g, '').replace(/^\+91/, '');
    // Return with +91 prefix
    return `+91 ${cleaned}`;
}

export const sendOtp = async (req, res, next) => {
    try {
        const { phone } = req.body;
        const normalizedPhone = normalizePhone(phone);

        // Check if user exists in database
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, name')
            .eq('phone', normalizedPhone)
            .single();

        if (userError || !user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Phone number not registered. Please contact your admin to get access.' 
            });
        }

        const otp = generateOtp();
        const nowIST = getISTDate();
        const expiresAtIST = addMinutesIST(nowIST, 10);

        const { error } = await supabase
            .from('otp_codes')
            .upsert({
                phone: normalizedPhone,
                otp,
                expires_at: expiresAtIST.toISOString(),
                verified: false,
                updated_at: nowIST.toISOString()
            }, {
                onConflict: 'phone'
            });

        if (error) {
            console.error('[OTP ERROR]', error);
            throw error;
        }

        console.log(`[OTP] ✅ OTP generated for ${normalizedPhone}: ${otp}`);
        console.log('--------------------------------------------------');
        console.log(`[AUTH: IST] 📱 Phone: ${normalizedPhone}`);
        console.log(`[AUTH: IST] 🔐 OTP Code: ${otp}`);
        console.log(`[AUTH: IST] ⏰ Generated At: ${formatIST(nowIST, { timeStyle: 'medium' })}`);
        console.log(`[AUTH: IST] ⌛ Expires At: ${formatIST(expiresAtIST, { timeStyle: 'medium' })}`);
        console.log('--------------------------------------------------');

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;
        const normalizedPhone = normalizePhone(phone);
        const nowIST = getISTDate();

        // Check if user exists
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', normalizedPhone)
            .single();

        if (userError || !user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Phone number not registered. Please contact your admin.' 
            });
        }

        const { data: record, error } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('phone', normalizedPhone)
            .single();

        if (error || !record) {
            return res.status(401).json({ success: false, message: 'No OTP found. Please request a new OTP.' });
        }

        if (isExpiredIST(record.expires_at)) {
            return res.status(401).json({ success: false, message: 'OTP expired. Please request a new OTP.' });
        }

        if (record.otp.toString() !== otp.toString()) {
            return res.status(401).json({ success: false, message: 'Invalid OTP' });
        }

        // Delete OTP after successful verification
        await supabase.from('otp_codes').delete().eq('id', record.id);
        console.log(`[OTP] ✅ Deleted OTP for ${normalizedPhone}`);

        // Find or create worker
        let { data: worker } = await supabase.from('workers').select('*').eq('user_id', user.id).single();
        
        if (!worker) {
            const { data: workerByPhone } = await supabase.from('workers').select('*').eq('phone', normalizedPhone).single();
            
            if (workerByPhone) {
                const { data: updatedWorker } = await supabase
                    .from('workers')
                    .update({ user_id: user.id })
                    .eq('id', workerByPhone.id)
                    .select()
                    .single();
                worker = updatedWorker;
            } else if (user.role === 'worker') {
                const { data: newWorker } = await supabase
                    .from('workers')
                    .insert([{
                        user_id: user.id,
                        phone: normalizedPhone,
                        name: user.name || `Worker_${normalizedPhone.slice(-4)}`,
                        city: 'Mumbai',
                        delivery_platform: 'Zomato',
                        risk_score: 0.50,
                        status: 'active'
                    }])
                    .select()
                    .single();
                worker = newWorker;
            }
        }

        const workerData = worker ? {
            id: worker.id,
            name: worker.name,
            phone: worker.phone,
            city: worker.city,
            plan: worker.plan,
            weeklyEarnings: parseFloat(worker.weekly_earnings),
            totalEarnings: parseFloat(worker.total_earnings),
            riskScore: parseFloat(worker.risk_score),
            status: worker.status,
            deliveryPlatform: worker.delivery_platform,
            totalDeliveries: worker.total_deliveries,
            avgRating: parseFloat(worker.avg_rating),
            earningsHistory: worker.earnings_history || [],
            riskBreakdown: worker.risk_breakdown || {}
        } : null;

        const userResponse = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role
        };

        console.log(`[AUTH: IST] ✅ ${user.name} (${user.role}) logged in at ${formatIST(nowIST, { dateStyle: 'medium', timeStyle: 'medium' })}`);
        res.json({ success: true, user: userResponse, worker: workerData, token: 'session-ist-token' });
    } catch (error) {
        next(error);
    }
};

// Admin: Create new user
export const createUser = async (req, res, next) => {
    try {
        const { name, phone, email, role } = req.body;
        const normalizedPhone = normalizePhone(phone);

        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('phone', normalizedPhone)
            .single();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Phone number already registered' });
        }

        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                name: name.trim(),
                phone: normalizedPhone,
                email: email?.trim() || null,
                role: role || 'worker',
                is_verified: false
            }])
            .select()
            .single();

        if (error) throw error;

        console.log(`[ADMIN: IST] ✅ New user created: ${name} (${role}) at ${formatIST(new Date(), { dateStyle: 'medium', timeStyle: 'medium' })}`);

        res.status(201).json({ 
            success: true, 
            message: 'User created successfully.',
            user: {
                id: newUser.id,
                name: newUser.name,
                phone: newUser.phone,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            phone: u.phone,
            email: u.email,
            role: u.role,
            isVerified: u.is_verified,
            createdAt: u.created_at
        }));

        res.json({ success: true, count: formattedUsers.length, data: formattedUsers });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        console.log(`[ADMIN: IST] ✅ User deleted at ${formatIST(new Date(), { dateStyle: 'medium', timeStyle: 'medium' })}`);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ name, email, role, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        next(error);
    }
};
