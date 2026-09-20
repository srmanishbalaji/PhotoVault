# PhotoVault

Full-stack photo sharing platform for photography and event teams.

## Overview

PhotoVault supports Admin/Lead, Team Member, and Customer workflows. Admins create events, assign members, review/select photos, and publish PIN-protected galleries. Team Members access assigned events and upload/view their own photos. Customers access published galleries through a shareable link and PIN.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: FastAPI, SQLAlchemy, PostgreSQL, Pydantic
- Authentication: JWT + bcrypt
- Image storage: Cloudinary
- Testing: Pytest + HTTPX

## Core Features

- Registration and login
- Role-based authorization
- Event creation and team assignment
- Secure photo upload to Cloudinary
- Photo metadata in PostgreSQL
- Admin-only photo selection and gallery publishing
- Unique shareable gallery links
- PIN-protected customer access
- Responsive UI
- Automated authorization and gallery-access tests

## Architecture

```text
React / Vite / Tailwind
          |
          v
      FastAPI API
       /       \
      v         v
PostgreSQL   Cloudinary
```

## Database Design

### users
Stores registered users and roles.

| Column | Description |
|---|---|
| id | Primary key |
| name | User name |
| email | Unique email |
| password | Hashed password |
| role | admin or member |
| created_at | Account creation time |

### events
Stores event information owned by an Admin.

| Column | Description |
|---|---|
| id | Primary key |
| name | Event name |
| description | Event description |
| admin_id | Event owner |
| created_at | Event creation time |

### event_members
Maps Team Members to assigned events.

| Column | Description |
|---|---|
| id | Primary key |
| event_id | Event reference |
| user_id | Team Member reference |

### photos
Stores photo metadata while image files are stored in Cloudinary.

| Column | Description |
|---|---|
| id | Primary key |
| event_id | Event reference |
| uploaded_by | Uploading user |
| filename | Original filename |
| storage_url | Cloudinary image URL |
| cloudinary_id | Cloudinary asset identifier |
| file_size | File size |
| is_selected | Admin selection flag |
| created_at | Upload time |

### galleries
Stores customer gallery access information.

| Column | Description |
|---|---|
| id | Primary key |
| event_id | Related event |
| pin | Gallery access PIN |
| share_link | Unique public gallery identifier |
| is_published | Publication status |
| created_at | Creation time |

## Authorization

- Admin can manage their own events.
- Only assigned Team Members can access their assigned events.
- Team Members can upload only to assigned events.
- Team Members can view only their own uploaded photos.
- Only Admin can select photos and publish galleries.
- Customers can access only published galleries with the correct PIN.
- Unpublished photos are not exposed through the customer gallery.

## Local Setup

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
SECRET_KEY=<your-secret-key>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

Run:

```powershell
uvicorn main:app --reload
```

Backend: `http://127.0.0.1:8000`  
Swagger: `http://127.0.0.1:8000/docs`

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Tests

From `backend`:

```powershell
pytest -q
```

Tests cover password hashing, JWT authentication, Admin authorization, Team Member event/photo access, photo-selection authorization, gallery publishing, and PIN-protected gallery access.

## Deployment

Deploy the frontend as a React/Vite static site, the backend as a FastAPI web service, PostgreSQL as a hosted database, and Cloudinary for image storage. Configure production environment variables on the hosting platforms and update the frontend API URL to the deployed backend.

## Known Limitations

- Optional features such as thumbnails, pagination, search/filtering, bulk upload, downloads, expiration, and CDN optimization are not included.
- Tables are created by SQLAlchemy at application startup rather than through migrations.

## Demo Credentials

**Admin:** `admin@photovault.com` / `admin123`  
**Team Member:** `member@photovault.com` / `member123`

**Demo Gallery:** `http://localhost:5173/gallery/eff9be15-cc69-471c-b2fe-0928c6711844`  
**PIN:** `123456`

> Demo credentials are for evaluation. Change credentials and secrets before real production use.

## Repository

https://github.com/srmanishbalaji/PhotoVault

Prepared for the **TrizenAI Technologies Private Limited Full Stack Internship Challenge**.
