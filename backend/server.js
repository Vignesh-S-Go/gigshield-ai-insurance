import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { errorHandler } from './middlewares/errorHandler.js'

import authRoutes from './routes/authRoutes.js'
import claimCompatRoutes from './routes/claimCompatRoutes.js'
import claimRoutes from './routes/claimRoutes.js'
import policyRoutes from './routes/policyRoutes.js'
import workerRoutes from './routes/workerRoutes.js'
import zoneRoutes from './routes/zoneRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import payoutRoutes from './routes/payoutRoutes.js'
import smartPayoutRoutes from './routes/smartPayoutRoutes.js'
import gigRoutes from './routes/gigRoutes.js'
import explanationRoutes from './routes/explanationRoutes.js'
import userRoutes from './routes/userRoutes.js'
import riskRoutes from './routes/riskRoutes.js'
import insuranceRoutes from './routes/insuranceRoutes.js'
import { formatIST } from './utils/timeUtils.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

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

app.get('/', (req, res) => {
    res.json({
        message: 'GigShield AI Intelligence Server',
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
            '/api/insurance'
        ]
    })
})

app.use(errorHandler)

const startTime = formatIST(new Date(), { dateStyle: 'full', timeStyle: 'medium' })
app.listen(PORT, () => {
    console.log('==================================================')
    console.log('GigShield Server Started')
    console.log(`Date (IST): ${startTime}`)
    console.log(`Port: ${PORT}`)
    console.log(`API Base: http://localhost:${PORT}/api`)
    console.log('==================================================')
})
