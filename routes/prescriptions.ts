import express from "express";
import {
    createPrescription,
    getPrescription,
    getVisitPrescriptions,
    updatePrescription,
    deletePrescription,
    markAsDispensed,
    getAllPrescriptions
} from "../controllers/prescription-controller";

const router = express.Router();

router.get("/", getAllPrescriptions);
router.post("/", createPrescription);
router.get("prescriptions/visit/:visitId", getVisitPrescriptions);
router.get("prescriptions/:id", getPrescription);
router.put("prescriptions/:id", updatePrescription);
router.put("prescriptions/:id/dispense", markAsDispensed);
router.delete("prescriptions/:id", deletePrescription);

export default router;