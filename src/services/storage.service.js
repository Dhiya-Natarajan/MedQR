import fs from "fs";
import path from "path";

export const saveImage = (buffer, patientUUID) => {
  const uploadsDir = path.join("uploads", "handwritten");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `${Date.now()}-${patientUUID}.png`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
};
