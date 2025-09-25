import express from "express";
import {
    createVisit,
    getVisits,
    getVisitById,
    updateVisit,
    deleteVisit,
    getVisitsByPatient
} from "../controllers/visits-controller";

const router = express.Router();

// CRUD
router.post("/visits", createVisit);       // Create a new visit
router.get("/visits", getVisits);          // Get all visits
router.get("/visits/:id", getVisitById);   // Get visit by ID
router.put("/visits/:id", updateVisit);    // Update visit
router.delete("/visits/:id", deleteVisit); // Delete visit

// Extra: visits by patient
router.get("/patients/:patientId/visits", getVisitsByPatient);

export default router;
