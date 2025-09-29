import express from "express";
import {
    createTreatment,
    getTreatment,
    getVisitTreatments,
    updateTreatment,
    deleteTreatment
} from "../controllers/treatment-controller";

const router = express.Router();

router.post("treatments/", createTreatment);
router.get("treatments/visit/:visitId", getVisitTreatments);
router.get("treatments/:id", getTreatment);
router.put("treatments/:id", updateTreatment);
router.delete("treatments/:id", deleteTreatment);

export default router;