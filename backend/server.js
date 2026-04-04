import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { errorHandler } from './middlewares/errorHandler.js'
import { securityHeaders } from './middlewares/securityHeaders.js'
import { apiRateLimiter } from './middlewares/rateLimiter.js'
import { authMiddleware, adminMiddleware } from './middlewares/jwtAuth.js'
dotenv.config()

import authRoutes from './routes/authRoutes.js'
import claimCompatRoutes from './routes/claimCompatRoutes.js'
import claimRoutes from './routes/claimRoutes.js'
import explanationRoutes from './routes/explanationRoutes.js'
import gigRoutes from './routes/gigRoutes.js'
import insuranceRoutes from './routes/insuranceRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import payoutRoutes from './routes/payoutRoutes.js'
import policyRoutes from './routes/policyRoutes.js'
import riskRoutes from './routes/riskRoutes.js'
import smartPayoutRoutes from './routes/smartPayoutRoutes.js'
import userRoutes from './routes/userRoutes.js'
import workerRoutes from './routes/workerRoutes.js'
import zoneRoutes from './routes/zoneRoutes.js'
import parametricClaimRoutes from './routes/parametricClaimRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { startCronJob } from './jobs/cronJob.js'
import { formatIST } from './utils/timeUtils.js'


const app = express()
const PORT = process.env.PORT || 8000

app.use(securityHeaders)
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}))
app.use(express.json({ limit: '10kb' }))
app.use(apiRateLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/workers', workerRoutes)
app.use('/api/policies', policyRoutes)
app.use('/api/claims', claimRoutes)
app.use('/api/claim', claimCompatRoutes)
app.use('/api/zones', zoneRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/payouts', payoutRoutes)
app.use('/api/smart-payout', smartPayoutRoutes)
app.use('/api/gigs', gigRoutes)
app.use('/api/explain', explanationRoutes)
app.use('/api/user', userRoutes)
app.use('/api/risk', riskRoutes)
app.use('/api/insurance', insuranceRoutes)
app.use('/api/parametric-claims', parametricClaimRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
    res.json({
        message: 'ZeroClaim AI Intelligence Server',
        status: 'Healthy',
        version: '2.0',
        timezone: 'IST (Asia/Kolkata)',
        serverTime: formatIST(new Date(), { dateStyle: 'full', timeStyle: 'long' }),
        endpoints: [
            '/api/auth',
            '/api/workers',
            '/api/policies',
            '/api/claims',
            '/api/claim',
            '/api/zones',
            '/api/notifications',
            '/api/payouts',
            '/api/smart-payout',
            '/api/gigs',
            '/api/explain',
            '/api/user',
            '/api/risk',
            '/api/insurance',
            '/api/parametric-claims',
            '/api/admin'
        ]
    })
})

app.use(errorHandler)

const startTime = formatIST(new Date(), { dateStyle: 'full', timeStyle: 'medium' })
app.listen(PORT, () => {
    console.log('==================================================')
    console.log('ZeroClaim Server Started')
    console.log(`Date (IST): ${startTime}`)
    console.log(`Port: ${PORT}`)
    console.log(`API Base: http://localhost:${PORT}/api`)
    console.log('==================================================')
    console.log('🔒 Security Features Enabled:')
    console.log('   - Helmet security headers')
    console.log('   - Rate limiting (100 req/min)')
    console.log('   - Request size limit (10kb)')
    console.log('   - JWT authentication')
    console.log('==================================================')
    startCronJob()
})
