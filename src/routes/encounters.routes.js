import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  getPatientEncounters,
  createPatientEncounter,
  getEncounterImage
} from "../controllers/encounters.controller.js";

const router = express.Router();

// GET /patients/:uuid/encounters
router.get("/:uuid/encounters", authMiddleware, getPatientEncounters);
router.post("/:uuid/encounters", authMiddleware, createPatientEncounter);
router.get("/:encounter_id/image", authMiddleware, getEncounterImage);

export default router;
