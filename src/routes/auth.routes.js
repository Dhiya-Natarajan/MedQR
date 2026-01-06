import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/dev-login", (req, res) => {
  const { role } = req.body;

  if (!["doctor", "nurse", "patient"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const token = jwt.sign(
    { role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

export default router;
