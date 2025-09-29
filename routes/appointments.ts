import express from "express";
import {
    createAppointment,
    getAppointment,
    getAllAppointments,
    updateAppointment,
    deleteAppointment,
    sendAppointmentReminder,
    getUpcomingAppointments
} from "../controllers/appointment-controller";

const router = express.Router();

router.post("/", createAppointment);
router.get("/", getAllAppointments);
router.get("/upcoming", getUpcomingAppointments);
router.get("/:id", getAppointment);
router.put("/:id", updateAppointment);
router.put("/:id/reminder", sendAppointmentReminder);
router.delete("/:id", deleteAppointment);

export default router;