## Project Overview

**MediQR** is a full-stack healthcare application designed to **digitize, secure, and simplify access to patient medical records** using QR codes.
It enables **doctors, nurses, and patients** to interact with medical data through dedicated portals while maintaining privacy and ease of use.

The system supports **QR-based patient identification**, **image uploads**, **OCR-powered data extraction**, and **graph detection from medical reports**, making it ideal for modern clinical workflows.

---

## Key Features

### Doctor Portal

* Register new patients
* Auto-generate **unique patient QR codes**
* View and manage patient lists
* Search patients instantly
* View & download patient QR codes
* View uploaded medical images and extracted data

### Nurse Portal

* Scan patient QR codes using **device camera**
* Manual UUID entry fallback
* Upload handwritten prescriptions / reports
* Secure, fast patient identification

### Patient Portal

* Access personal medical records
* View & download own QR code
* See encounter history
* Secure patient switching

---

## Advanced Capabilities

*  **Camera-based QR scanning**
*  **Medical image preview**
*  **OCR extraction from handwritten notes**
*  **Graph detection & extraction from reports**
*  **Fast patient search**
*  **Restricted access to sensitive records**
*  **Fully responsive UI (mobile & desktop)**

---
## User Workflows

### Doctor

```
Login → Patients → Add Patient → Generate QR → Download / Print
```

### Nurse

```
Login → Scan QR → Identify Patient → Upload Prescription
```

### Patient

```
Login → View Records → View / Download QR
```

---

## Tech Stack

### Frontend

* React.js
* Axios
* Modern CSS (Gradients, Animations)
* QR Scanner Integration

### Backend

* Node.js
* Express.js
* REST APIs
* Authentication & Authorization

### Database

* Postgres (UUID-based patient records)

### AI / Processing

* Python OCR for handwritten text extraction
* Image analysis for graph detection

---

## Security Highlights

* UUID-based patient identification
* Role-based access control (Doctor / Nurse / Patient)
* Restricted access to medical reports
* Optional biometric hash support 



## Screenshots



---


## Acknowledgements

Inspired by real-world hospital workflows and modern digital healthcare systems.

---

---



