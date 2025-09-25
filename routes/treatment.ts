import express from "express";
import {
    createTreatment,
    getTreatments,
    getTreatmentById,
    updateTreatment,
    deleteTreatment,
    getTreatmentsByVisit
} from "../controllers/treatment-controller";

const router = express.Router();

// CRUD
router.post("/treatments", createTreatment);       // Create new treatment
router.get("/treatments", getTreatments);          // Get all treatments
router.get("/treatments/:id", getTreatmentById);   // Get treatment by ID
router.put("/treatments/:id", updateTreatment);    // Update treatment
router.delete("/treatments/:id", deleteTreatment); // Delete treatment

// Extra
router.get("/visits/:visitId/treatments", getTreatmentsByVisit); // Get treatments linked to a visit

export default router;
