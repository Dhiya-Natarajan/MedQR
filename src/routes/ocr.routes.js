import express from "express";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();

router.post("/ocr", async (req, res) => {
  if (!req.files || !req.files.prescription) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = req.files.prescription;
  const formData = new FormData();
  formData.append("file", file.data, file.name);

  try {
    const response = await axios.post("http://localhost:5000/ocr", formData, {
      headers: formData.getHeaders(),
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR service failed" });
  }
});

export default router;
