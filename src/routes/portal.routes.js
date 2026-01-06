import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    getAllPatients,
    getAllEncounters,
    getMyData
} from "../controllers/portal.controller.js";

const router = express.Router();

// Doctor routes - view all patients and encounters
router.get("/doctor/patients", authMiddleware, getAllPatients);
router.get("/doctor/encounters", authMiddleware, getAllEncounters);

// Patient routes - view own data
router.get("/patient/my-data", authMiddleware, getMyData);

export default router;
