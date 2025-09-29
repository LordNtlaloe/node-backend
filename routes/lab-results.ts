import express from "express";
import {
    createLabResult,
    getLabResult,
    getPatientLabResults,
    updateLabResult,
    deleteLabResult,
    getLabStats
} from "../controllers/lab-results-controller";

const router = express.Router();

router.post("lab-results/", createLabResult);
router.get("lab-results/patient/:patientId", getPatientLabResults);
router.get("lab-results/patient/:patientId/stats", getLabStats);
router.get("lab-results/:id", getLabResult);
router.put("lab-results/:id", updateLabResult);
router.delete("lab-results/:id", deleteLabResult);

export default router;