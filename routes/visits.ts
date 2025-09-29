import express from "express";
import {
    createVisit,
    getVisit,
    getPatientVisits,
    updateVisit,
    deleteVisit
} from "../controllers/visits-controller";

const router = express.Router();

router.post("visits/", createVisit);
router.get("visits/patient/:patientId", getPatientVisits);
router.get("visits/:id", getVisit);
router.put("visitis/:id", updateVisit);
router.delete("visits/:id", deleteVisit);

export default router;