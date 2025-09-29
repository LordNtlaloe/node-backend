import express from "express";
import {
    createDiagnosis,
    getDiagnosis,
    getPatientDiagnoses,
    updateDiagnosis,
    deleteDiagnosis
} from "../controllers/diagnosis-controller";

const router = express.Router();

router.post("diagnosis/", createDiagnosis);
router.get("diagnosis/patient/:patientId", getPatientDiagnoses);
router.get("diagnosis/:id", getDiagnosis);
router.put("diagnosis/:id", updateDiagnosis);
router.delete("diagnosis/:id", deleteDiagnosis);

export default router;