export async function uploadPrescription(file, patientUUID) {
  const token = localStorage.getItem("token"); // must exist

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `http://localhost:3000/patients/${patientUUID}/upload`,
    // `/api/patients/${patientUUID}/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Upload failed");
  }

  return response.json();
}
