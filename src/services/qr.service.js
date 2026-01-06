import QRCode from "qrcode";

export const generatePatientQR = async (patientUUID) => {
  return await QRCode.toDataURL(patientUUID);
};
