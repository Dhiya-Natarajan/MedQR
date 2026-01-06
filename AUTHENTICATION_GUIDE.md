# QR Medical - Mobile-Ready Authentication Guide

## Overview
The application now supports proper authentication flow for mobile use with three roles: **Doctor**, **Nurse**, and **Patient**.

## Key Changes

### 1. **Authentication Flow**
- Users must log in before accessing the application
- Token is stored in `localStorage` (persistent across page refreshes)
- No need to manually use Postman to set tokens

### 2. **Role-Based Access Control**
- **Nurses**: Can upload prescriptions (full access)
- **Doctors**: Can view records (to be implemented)
- **Patients**: Can view their own records (to be implemented)

### 3. **Dynamic Patient UUID**
- Removed hardcoded patient UUID
- Nurses scan QR code or manually enter patient UUID
- Each upload is associated with the scanned patient

## How to Use

### For Nurses (Upload Workflow)
1. **Login**: Select "Nurse" role and click Login
2. **Scan QR**: Enter or scan patient's UUID
3. **Upload**: Take photo of prescription and upload
4. **View Results**: See OCR text and structured data
5. **Back**: Return to scan another patient's QR

### For Doctors/Patients
- Login with respective role
- Currently shows "Access Restricted" message
- Future: Will show patient records and analytics

## Testing the Application

### Step 1: Start the servers
```bash
# Backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev

# Python OCR service (in another terminal)
cd python
python ocr_service.py
```

### Step 2: Login as Nurse
1. Open http://localhost:5173
2. Select "Nurse" from dropdown
3. Click "Login"

### Step 3: Enter Patient UUID
Use this test UUID: `439362cd-b473-4f57-85b9-394d7e404e00`

### Step 4: Upload Prescription
1. Click "Choose Image"
2. Select a prescription image
3. Click "Upload & OCR"
4. View the results

## API Endpoints

### Authentication
```
POST /auth/dev-login
Body: { "role": "nurse" | "doctor" | "patient" }
Response: { "token": "jwt_token" }
```

### Upload Prescription (Nurses Only)
```
POST /patients/:uuid/upload
Headers: { "Authorization": "Bearer <token>" }
Body: FormData with "image" field
Response: { encounter_id, digitized_text, structured_data }
```

## Mobile Deployment Notes

### For Production
1. **Replace dev-login** with proper authentication (username/password, biometrics)
2. **Add QR Scanner**: Use `react-qr-reader` or native camera API
3. **Use HTTPS**: Required for camera access on mobile browsers
4. **Add offline support**: Use service workers for offline uploads
5. **Implement real-time sync**: Upload when connection is restored

### Recommended Libraries for Mobile
- **QR Scanning**: `react-qr-reader`, `html5-qrcode`
- **Camera Access**: `react-camera-pro`
- **PWA**: `workbox` for offline support
- **UI**: `react-native` for native app or keep as PWA

## Security Considerations

### Current (Development)
- Simple role-based login (no password)
- JWT stored in localStorage
- 1-hour token expiration

### Production Requirements
- Add password/PIN authentication
- Implement refresh tokens
- Use secure storage (not localStorage)
- Add biometric authentication for mobile
- Implement rate limiting
- Add CSRF protection
- Use HTTPS only

## File Structure
```
frontend/src/
├── components/
│   ├── Login.jsx          # Authentication screen
│   └── QRScanner.jsx      # Patient UUID input/scanner
├── App.jsx                # Main app with routing logic
└── UploadNote.jsx         # Upload form (nurses only)
```

## Next Steps
1. ✅ Authentication flow
2. ✅ Role-based access control
3. ✅ Dynamic patient UUID
4. ⏳ Implement QR code camera scanning
5. ⏳ Add doctor portal (view records)
6. ⏳ Add patient portal (view own records)
7. ⏳ Convert to PWA for mobile installation
8. ⏳ Add offline support
