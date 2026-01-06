import axios from "axios";
import FormData from "form-data";

export const getOCRText = async (imageBuffer) => {
  const formData = new FormData();

  formData.append("file", imageBuffer, {
    filename: "prescription.png",
    contentType: "image/png",
  });

  const response = await axios.post(
    "http://127.0.0.1:5000/ocr",
    formData,
    {
      headers: formData.getHeaders(),
      timeout: 60000, // OCR may take time
    }
  );

  return response.data.combined_text;
};
