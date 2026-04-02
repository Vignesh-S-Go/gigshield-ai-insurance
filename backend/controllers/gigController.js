import crypto from 'crypto';

const activeSessions = new Map();

export const startGig = async (req, res, next) => {
    try {
        const { worker_id } = req.body;
        
        const sessionId = crypto.randomBytes(16).toString('hex');
        const startTime = new Date();
        
        activeSessions.set(sessionId, {
            worker_id,
            startTime,
            status: 'active'
        });
        
        console.log(`[GIG: IST] 🚀 Gig started for worker ${worker_id} at ${startTime.toLocaleString('en-IN')}`);
        
        res.json({ 
            success: true, 
            session_id: sessionId,
            start_time: startTime.toISOString(),
            premium_deducted: 0
        });
    } catch (error) {
        next(error);
    }
};

export const stopGig = async (req, res, next) => {
    try {
        const { session_id } = req.body;
        
        const session = activeSessions.get(session_id);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        
        const endTime = new Date();
        const duration = Math.floor((endTime - session.startTime) / 1000 / 60);
        const premiumDeducted = Math.max(0, duration * 0.5);
        
        activeSessions.delete(session_id);
        
        console.log(`[GIG: IST] 🛑 Gig ended for worker ${session.worker_id} - Duration: ${duration} mins, Premium: ₹${premiumDeducted.toFixed(2)}`);
        
        res.json({ 
            success: true, 
            session_id,
            duration_minutes: duration,
            premium_deducted: premiumDeducted.toFixed(2),
            end_time: endTime.toISOString()
        });
    } catch (error) {
        next(error);
    }
};
