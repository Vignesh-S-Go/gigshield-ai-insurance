import express from 'express'
import {
    getClaims,
    getClaimById,
    createClaim,
    updateClaimStatus,
    getClaimStats,
    analyzeClaimDescription,
    validateClaimRequest
} from '../controllers/claimController.js'

const router = express.Router()

router.get('/', getClaims)
router.get('/stats', getClaimStats)
router.get('/:id', getClaimById)
router.post('/', createClaim)
router.post('/validate', validateClaimRequest)
router.put('/:id/status', updateClaimStatus)
router.post('/ai-analyze', analyzeClaimDescription)

export default router
