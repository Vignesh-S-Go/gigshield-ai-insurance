import express from 'express';
import { getZones, getZoneById, createZone, updateZoneRisk, getZoneStats, getHighRiskZones } from '../controllers/zoneController.js';

const router = express.Router();

router.get('/', getZones);
router.get('/stats', getZoneStats);
router.get('/high-risk', getHighRiskZones);
router.get('/:id', getZoneById);
router.post('/', createZone);
router.put('/:id/risk', updateZoneRisk);

export default router;
