import express from 'express'
import { createClaim, validateClaimRequest } from '../controllers/claimController.js'

const router = express.Router()

router.post('/create', createClaim)
router.post('/validate', validateClaimRequest)

export default router
