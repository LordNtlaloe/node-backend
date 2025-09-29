// routes/patient-routes.ts
import express from "express";
import {
    createPatient,
    getPatient,
    getAllPatients,
    updatePatient,
    deletePatient,
    getPatientStats
} from "../controllers/patient-controller";

const router = express.Router();

// Group all routes under /patients
router.post("/", createPatient);
router.get("/", getAllPatients);
router.get("/:id", getPatient);
router.get("/:id/stats", getPatientStats);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;