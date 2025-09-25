import express from "express";
import {
    getPatientById,
    getPatients,
    updatePatient,
    deletePatient,
    createPatient,
    searchPatients
} from "../controllers/patient-controller";

const router = express.Router();

// CRUD
router.get("/patients/:id", getPatientById);
router.get("/patients", getPatients);
router.post("/patients", createPatient);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);

// Search
router.get("/patients/search", searchPatients);

export default router;
