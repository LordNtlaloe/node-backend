import express from "express";
import {
    createHealthAlert,
    getHealthAlert,
    getPatientHealthAlerts,
    updateHealthAlert,
    deleteHealthAlert,
    acknowledgeAlert,
    resolveAlert
} from "../controllers/health-alert-controller"

const router = express.Router();

router.post("health-alerts/", createHealthAlert);
router.get("health-alerts/patient/:patientId", getPatientHealthAlerts);
router.get("health-alerts/:id", getHealthAlert);
router.put("health-alerts/:id", updateHealthAlert);
router.put("health-alerts/:id/acknowledge", acknowledgeAlert);
router.put("health-alerts/:id/resolve", resolveAlert);
router.delete("health-alerts/:id", deleteHealthAlert);

export default router;