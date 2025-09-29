import express from "express";
import {
    createHealthTrend,
    getHealthTrend,
    getPatientHealthTrends,
    getPatientTrendSummary,
    deleteHealthTrend
} from "../controllers/health-trend-controller";

const router = express.Router();

router.post("trends/", createHealthTrend);
router.get("trends/patient/:patientId", getPatientHealthTrends);
router.get("trends/patient/:patientId/summary", getPatientTrendSummary);
router.get("trends/:id", getHealthTrend);
router.delete("trends/:id", deleteHealthTrend);

export default router;