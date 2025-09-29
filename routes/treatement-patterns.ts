import express from "express";
import {
    createTreatmentPattern,
    getTreatmentPattern,
    getPatientTreatmentPatterns,
    updateTreatmentPattern,
    deleteTreatmentPattern
} from "../controllers/treatement-pattern-controller";

const router = express.Router();

router.post("treatement-patterns/", createTreatmentPattern);
router.get("treatement-patterns/patient/:patientId", getPatientTreatmentPatterns);
router.get("treatement-patterns/:id", getTreatmentPattern);
router.put("treatement-patterns/:id", updateTreatmentPattern);
router.delete("treatement-patterns/:id", deleteTreatmentPattern);

export default router;