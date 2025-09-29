import express from "express";
import {
    createMedication,
    getMedication,
    getPatientMedications,
    updateMedication,
    deleteMedication
} from "../controllers/medication-controller";

const router = express.Router();

router.post("medication/", createMedication);
router.get("medication/patient/:patientId", getPatientMedications);
router.get("medication/:id", getMedication);
router.put("medication/:id", updateMedication);
router.delete("medication/:id", deleteMedication);

export default router;