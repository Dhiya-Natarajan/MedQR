import express from "express";
import {
  upload,
  uploadHandwrittenNote,
  createPatient,
  getPatient
} from "../controllers/patients.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /patients
router.post("/", authMiddleware, createPatient);
router.get("/:uuid", authMiddleware, getPatient);
router.post("/:uuid/upload", authMiddleware, upload, uploadHandwrittenNote);


export default router;
