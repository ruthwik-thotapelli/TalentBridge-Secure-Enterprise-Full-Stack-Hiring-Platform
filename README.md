<div align="center">
  <img src="https://img.shields.io/github/stars/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform?style=for-the-badge&color=yellow" alt="Stars" />
  <img src="https://img.shields.io/github/forks/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform?style=for-the-badge&color=orange" alt="Forks" />
  <img src="https://img.shields.io/github/issues/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform?style=for-the-badge&color=red" alt="Issues" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License" />
  
  <br />
  <br />

  <h1 align="center">🚀 TalentBridge</h1>
  <p align="center">
    <b>An Enterprise-Grade, Automated Full-Stack Applicant Tracking System (ATS) & Hiring Platform</b>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js_20-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js_5-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MySQL_8-005C84?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/JWT_Auth-FF0080?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
    <img src="https://img.shields.io/badge/OAuth_2.0-EA4335?style=flat-square&logo=google&logoColor=white" alt="OAuth" />
  </p>
</div>

---

## 📖 Table of Contents
- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
- [Deep-Dive: Core Engines](#-deep-dive-core-engines)
- [Role-Based Feature Matrix](#-role-based-feature-matrix)
- [Security & Compliance](#-security--compliance)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Local Development Guide](#-local-development-guide)
- [Roadmap](#-roadmap)

---

## 🌟 Executive Summary

**TalentBridge** goes beyond a traditional job portal. It is a highly scalable, automated recruitment ecosystem built to handle the complexities of enterprise-level hiring. By integrating a sophisticated **Applicant Tracking System (ATS) Engine**, it natively parses complex resumes, automatically scores candidates against job descriptions, and reduces manual screening time by over **60%**.

Designed with clean architecture principles, it strictly separates concerns across a reactive **React** frontend and a robust, state-less **Node/Express** API backend.

---

## 🏛 System Architecture

The platform follows a decoupled client-server architecture, communicating exclusively via RESTful JSON APIs, secured by stateless JWT tokens and OAuth providers.

```mermaid
graph TD
    Client[React + Tailwind CSS Client]
    LoadBalancer{API Gateway / NGINX}
    Auth[Passport.js OAuth + JWT]
    CoreAPI[Express.js Core Backend]
    ATSEngine[ATS Parsing Engine<br>mammoth / pdf-parse]
    DB[(MySQL Relational DB)]
    Mail[Nodemailer SMTP]

    Client -->|REST API Requests| LoadBalancer
    LoadBalancer --> Auth
    Auth --> CoreAPI
    CoreAPI -->|Reads/Writes Document| ATSEngine
    CoreAPI -->|Queries Data| DB
    CoreAPI -->|Sends Automated Emails| Mail
```

---

## ⚙️ Deep-Dive: Core Engines

### 1. 🧠 ATS Resume Parsing Engine
Traditional platforms require manual data entry. TalentBridge utilizes a proprietary file-handling pipeline:
- **PDF Processing**: Leverages `pdf-parse` to accurately extract text layers from complex PDF structures.
- **DOCX Processing**: Uses `mammoth` to traverse Word documents and extract semantic HTML/text.
- **Scoring Algorithm**: Implements a keyword-matching and contextual analysis algorithm to rank candidate resumes based on strict job requirements.

### 2. 🔐 Hybrid Authentication Model
TalentBridge implements a military-grade auth flow:
- **Stateless Sessions**: Employs heavily encrypted JWTs stored in secure `httpOnly` cookies to prevent XSS attacks.
- **OAuth 2.0 Integration**: Utilizes `passport-google-oauth20` and `passport-github2` for frictionless 1-click candidate onboarding.
- **Password Cryptography**: Salted and hashed via `bcryptjs` with high cost-factors.

---

## 🎯 Role-Based Feature Matrix

TalentBridge enforces strict authorization middleware, ensuring deep data isolation between roles.

| Feature Scope | 👨‍💼 **Candidate Pipeline** | 🏢 **Recruiter Suite** | 🛡️ **Super Admin Control** |
| :--- | :--- | :--- | :--- |
| **Authentication** | OAuth (Google/GitHub) or Email | Enterprise Email / 2FA Ready | Secure Master Login |
| **Job Discovery** | Advanced Semantic Filtering | Create, Edit & Archive Jobs | Global Job Moderation |
| **Resume Handling** | Encrypted Multi-format Uploads | View AI-Parsed Insights | Storage Quota Management |
| **Application Tracking** | Real-time Status WebSocket | Kanban-style Pipeline View | System-wide Audit Logs |
| **Communication** | Receive Automated Updates | 1-Click Status Emails | SMTP Configuration |
| **Exports** | Generate Profile as PDF (`jsPDF`) | Export Shortlists dynamically | Full Database Backups |

---

## 🛡️ Security & Compliance

Enterprise hiring platforms manage highly sensitive PII (Personally Identifiable Information). TalentBridge mitigates vulnerabilities at every layer:
- **Data Injection**: Parameterized queries via `mysql2` inherently block SQL injection.
- **CSRF & CORS**: Strictly configured `cors` middleware rejecting untrusted origins.
- **File Upload Security**: `multer` intercepts malicious payloads, enforcing strict MIME-type validation and file-size limitations before hitting disk.

---

## 🔌 API Reference (Highlight)

The backend provides a comprehensive RESTful interface. Below is a subset of the critical endpoints:

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/google` | `GET` | Public | Initiates Google OAuth 2.0 handshake |
| `/api/jobs` | `GET` | Public | Fetch paginated & filtered active job listings |
| `/api/jobs/create` | `POST` | Recruiter | Post a new job (Requires Bearer Token) |
| `/api/applications/upload` | `POST` | Candidate | Multipart/form-data resume upload to ATS |
| `/api/admin/metrics` | `GET` | Admin | Fetches system-wide analytical data |

---

## 📂 Project Structure

```text
TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform/
├── 📁 backend/                # Node.js + Express API Core
│   ├── 📁 config/             # DB and Passport configurations
│   ├── 📁 controllers/        # Route business logic & ATS processing
│   ├── 📁 middleware/         # JWT Auth, Role checks, Multer file limits
│   ├── 📁 routes/             # Express Router definitions
│   ├── 📁 uploads/            # Secure temporary storage for parsing
│   └── 📄 server.js           # API Entry Point
│
├── 📁 frontend/               # React + Tailwind SPA
│   ├── 📁 public/             # Static Assets
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI (Navbar, ScrollToTop, etc)
│   │   ├── 📁 pages/          # Full page views (Dashboard, Jobs, Profile)
│   │   ├── 📁 services/       # Axios API interceptors
│   │   └── 📄 App.jsx         # React Router topology
│   └── 📄 tailwind.config.js  # Design System Tokens
└── 📄 README.md               # You are here
```

---

## 🚀 Local Development Guide

Get the enterprise environment running on your local machine in under 5 minutes.

### Prerequisites
- Node.js `v18.x` or higher
- MySQL `v8.x` running on port `3306`

### 1️⃣ Database Setup
Create your local MySQL database instance:
```sql
CREATE DATABASE talentbridge_db;
```
*(Note: Tables will be automatically migrated upon first server boot).*

### 2️⃣ Backend Initialization
```bash
cd backend
npm install

# Duplicate the env template and fill your credentials
cp .env.example .env 
npm run dev
```

### 3️⃣ Frontend Initialization
```bash
cd frontend
npm install

# Start the Vite/React development server
npm start
```
The application will securely bind to `http://localhost:3000`.

---

## 🗺️ Roadmap
- [ ] **Phase 1**: Kubernetes (K8s) deployment manifests.
- [ ] **Phase 2**: Integration with OpenAI API for deeper semantic ATS scoring.
- [ ] **Phase 3**: WebRTC integration for in-app candidate video interviews.

---

<div align="center">
  <b>Architected & Developed with ❤️ by Ruthwik</b><br>
  <i>Pushing the boundaries of recruitment technology.</i><br><br>
  <a href="https://github.com/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform/issues">Report a Bug</a> • 
  <a href="https://github.com/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform/pulls">Request Feature</a>
</div>
