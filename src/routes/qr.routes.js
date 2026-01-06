import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

router.get("/:uuid", (req, res) => {
  const { uuid } = req.params;
  const qrPath = path.join("uploads", "qr", `${uuid}.png`);

  if (!fs.existsSync(qrPath)) {
    return res.status(404).json({ message: "QR not found" });
  }
  
  res.setHeader("Content-Type", "image/png");
  res.sendFile(path.resolve(qrPath));
});

export default router;
