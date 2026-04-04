import { supabase } from '../config/supabase.js';
import { generateOtp } from '../services/otpService.js';
import { getISTDate, addMinutesIST, isExpiredIST, formatIST } from '../utils/timeUtils.js';
import { generateToken } from '../middlewares/jwtAuth.js';

function normalizePhone(phone) {
    if (!phone) return null;
    const cleaned = phone.replace(/\s/g, '').replace(/^\+91/, '');
    return `+91 ${cleaned}`;
}

export const sendOtp = async (req, res, next) => {
    try {
        const { phone } = req.body;
        const normalizedPhone = normalizePhone(phone);

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

        // NOTE: OTP is returned for demo purposes only. Disable in production.
        // Always show OTP for demo environment
        res.json({ 
            success: true, 
            message: 'OTP sent successfully',
            otp,
            demo: true
        });
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;
        const normalizedPhone = normalizePhone(phone);
        const nowIST = getISTDate();

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

        await supabase.from('otp_codes').delete().eq('id', record.id);
        console.log(`[OTP] ✅ Deleted OTP for ${normalizedPhone}`);

        let worker = null;
        if (user.role === 'worker') {
            worker = await supabase
                .from('workers')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (worker?.data) {
                await supabase
                    .from('workers')
                    .update({ last_active_at: new Date().toISOString() })
                    .eq('id', worker.data.id);
                
                worker = worker.data;
            }
        }

        const token = generateToken(user);

        const workerData = worker ? {
            id: worker.id,
            name: worker.name,
            phone: worker.phone,
            city: worker.city,
            plan: worker.plan,
            weeklyEarnings: parseFloat(worker.weekly_earnings || 0),
            totalEarnings: parseFloat(worker.total_earnings || 0),
            riskScore: parseFloat(worker.risk_score || 0.5),
            status: worker.status,
            deliveryPlatform: worker.delivery_platform,
            totalDeliveries: worker.total_deliveries || 0,
            avgRating: parseFloat(worker.avg_rating || 4.0),
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
        res.json({ success: true, user: userResponse, worker: workerData, token });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const { name, phone, email, role, city, platform } = req.body;
        const normalizedPhone = normalizePhone(phone);

        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('phone', normalizedPhone)
            .single();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Phone number already registered' });
        }

        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([{
                name: name.trim(),
                phone: normalizedPhone,
                email: email?.trim() || null,
                role: role || 'worker',
                is_verified: false,
                platform: platform || 'Zomato'
            }])
            .select()
            .single();

        if (userError) throw userError;

        if (role === 'admin' || !role || role === 'worker') {
            const workerId = `GS-${Date.now().toString(36).toUpperCase()}`;
            
            const { error: workerError } = await supabase
                .from('workers')
                .insert([{
                    id: workerId,
                    user_id: newUser.id,
                    name: name.trim(),
                    phone: normalizedPhone,
                    email: email?.trim() || null,
                    city: city || 'Mumbai',
                    plan: 'Standard',
                    delivery_platform: platform || 'Zomato',
                    status: 'active',
                    last_active_at: new Date().toISOString()
                }]);

            if (workerError) {
                console.error('[ADMIN: IST]', 'Failed to create worker:', workerError);
            }
        }

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

        const { data: user } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', id)
            .single();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'worker') {
            await supabase.from('workers').delete().eq('user_id', id);
        }

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
            .update({ name, email })
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        next(error);
    }
};

export const registerWorker = async (req, res, next) => {
    try {
        const { name, phone, email, city, platform } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({ success: false, message: 'Name and phone are required' });
        }

        const normalizedPhone = normalizePhone(phone);

        // Check if user already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('phone', normalizedPhone)
            .single();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Phone number already registered' });
        }

        // Create user with worker role
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([{
                name: name.trim(),
                phone: normalizedPhone,
                email: email?.trim() || null,
                role: 'worker',
                is_verified: false,
                platform: platform || 'Zomato'
            }])
            .select()
            .single();

        if (userError) throw userError;

        // Create worker record
        const workerId = `GS-${Date.now().toString(36).toUpperCase()}`;
        
        const { error: workerError } = await supabase
            .from('workers')
            .insert([{
                id: workerId,
                user_id: newUser.id,
                name: name.trim(),
                phone: normalizedPhone,
                email: email?.trim() || null,
                city: city || 'Mumbai',
                plan: 'Standard',
                status: 'active',
                delivery_platform: platform || 'Zomato'
            }]);

        if (workerError) {
            // Cleanup user if worker creation fails
            await supabase.from('users').delete().eq('id', newUser.id);
            throw workerError;
        }

        // Create default policy for worker
        await supabase.from('policies').insert([{
            worker_id: workerId,
            plan_type: 'Standard',
            premium: 49,
            max_payout: 1200,
            status: 'Active',
            city: city || 'Mumbai'
        }]);

        console.log(`[AUTH] New worker registered: ${name} (${normalizedPhone})`);
        
        res.json({ 
            success: true, 
            message: 'Registration successful. Please login with OTP.',
            userId: newUser.id
        });
    } catch (error) {
        console.error('[registerWorker]', error);
        next(error);
    }
};
