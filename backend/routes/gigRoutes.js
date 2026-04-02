import express from 'express';
const router = express.Router();

let activeGigs = {};

router.post('/start', (req, res) => {
    const { user_id } = req.body;
    const session_id = `GIG-${Math.floor(Math.random() * 8999) + 1000}`;

    activeGigs[session_id] = {
        user_id,
        start_time: new Date(),
        status: 'ACTIVE'
    };

    res.json({ success: true, session_id, message: 'Coverage is now LIVE.' });
});

router.post('/stop', (req, res) => {
    const { session_id } = req.body;
    const gig = activeGigs[session_id];

    if (!gig) return res.status(404).json({ success: false, message: 'Session not found' });

    const end_time = new Date();
    const durationHours = (end_time - new Date(gig.start_time)) / (1000 * 60 * 60);

    const baseRate = 0.15;
    const finalPremium = (durationHours * baseRate).toFixed(4);

    gig.status = 'COMPLETED';
    gig.end_time = end_time;
    gig.premium = finalPremium;

    res.json({
        success: true,
        data: {
            duration: durationHours.toFixed(2),
            premium_deducted: finalPremium,
            receipt_id: `TX-${Math.random().toString(36).substring(7).toUpperCase()}`
        }
    });
});

export default router;
