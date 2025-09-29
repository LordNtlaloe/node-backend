import express from "express";
import {
    createVitalSigns,
    getVitalSigns,
    getPatientVitalSigns,
    updateVitalSigns,
    deleteVitalSigns
} from "../controllers/vital-signs-controller";

const router = express.Router();

router.post("vital-signs/", createVitalSigns);
router.get("vitals-signs/patient/:patientId", getPatientVitalSigns);
router.get("vital-signs/:id", getVitalSigns);
router.put("vital-signs/:id", updateVitalSigns);
router.delete("vital-signs/:id", deleteVitalSigns);

export default router;
