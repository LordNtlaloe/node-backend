import express from "express";
import {
    createStaff,
    getStaff,
    getAllStaff,
    updateStaff,
    deleteStaff
} from "../controllers/staff-controller";

const router = express.Router();

router.post("/", createStaff);
router.get("/", getAllStaff);
router.get("/:id", getStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;