import express from "express";
import {
    getUser,
    getAllUsers,
    updateUser,
    deleteUser
} from "../controllers/user-controller";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;