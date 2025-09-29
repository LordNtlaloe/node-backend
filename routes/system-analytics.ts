import express from "express";
import {
    createSystemAnalytic,
    getSystemAnalytic,
    getAnalytics,
    getDashboardStats,
    deleteSystemAnalytic
} from "../controllers/system-analytics-controller";

const router = express.Router();

router.post("analytics/", createSystemAnalytic);
router.get("analytics/", getAnalytics);
router.get("analytics/dashboard", getDashboardStats);
router.get("analytics/:id", getSystemAnalytic);
router.delete("analytics/:id", deleteSystemAnalytic);

export default router;