import express from "express";
import {
    createAuditLog,
    getAuditLog,
    getAuditLogs,
    getUserActivity,
    deleteAuditLog
} from "../controllers/audit-log-controller";

const router = express.Router();

router.post("audits/", createAuditLog);
router.get("audits/", getAuditLogs);
router.get("audits/user/:userId", getUserActivity);
router.get("audits/:id", getAuditLog);
router.delete("audits/:id", deleteAuditLog);

export default router;