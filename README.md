# Health ID System

## Overview
Secure medical identification system using:
- UUID v4 as patient identifier
- QR codes (UUID only)
- PostgreSQL backend
- AI-assisted medical record digitization

## Security Model
- QR codes contain UUID only
- No medical data stored on cards
- Encrypted medical records
- Role-based API access

## Setup
```bash
npm install
cp .env.example .env
npm run dev


