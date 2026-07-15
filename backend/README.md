# TalentBridge Backend API

## Overview
This is the core RESTful API server for TalentBridge, built with **Node.js**, **Express.js v5**, and **MySQL2**. It handles authentication, job management, resume parsing (ATS), and automated email workflows.

## Architecture
```
backend/
├── config/          # Database & Passport.js configurations
│   ├── db.js        # MySQL2 connection pool
│   └── passport.js  # Google & GitHub OAuth strategies
│
├── controllers/     # Business logic layer
│   ├── authController.js        # User registration, login, verification
│   ├── adminAuthController.js   # Admin authentication flows
│   ├── oauthController.js       # OAuth callback handlers
│   ├── profileController.js     # User profile management
│   ├── resumeController.js      # Resume upload & retrieval
│   └── atsHistoryController.js  # ATS scoring history
│
├── middleware/      # Request pipeline interceptors
│   ├── authMiddleware.js        # JWT verification & RBAC guards
│   └── globalErrorHandler.js    # Centralized error handling
│
├── routes/          # Express Router definitions
│   ├── authRoutes.js            # /api/auth/*
│   ├── adminAuthRoutes.js       # /api/admin/auth/*
│   ├── profileRoutes.js         # /api/profile/*
│   └── resumeRoutes.js          # /api/resume/*
│
├── utils/           # Shared utilities & services
│   ├── asyncHandler.js          # Async/await error wrapper
│   ├── atsPdf.js                # PDF generation for ATS reports
│   ├── atsScorer.js             # Core ATS scoring algorithm
│   ├── emailService.js          # Nodemailer transporter & templates
│   ├── mailer.js                # Mail dispatch utility
│   ├── resumeParser.js          # PDF/DOCX text extraction
│   └── tokenUtil.js             # JWT token generation helpers
│
├── uploads/         # Temporary file storage for parsed resumes
├── app.js           # Express app configuration & middleware stack
└── server.js        # Server entry point & port binding
```

## Key Technologies
- **Express.js v5** — Latest framework with async route support
- **MySQL2** — High-performance database driver with prepared statements
- **Passport.js** — Google & GitHub OAuth 2.0 strategies
- **JWT (jsonwebtoken)** — Stateless authentication tokens
- **Multer** — Secure multipart file upload handling
- **pdf-parse & mammoth** — Resume text extraction (PDF & DOCX)
- **Nodemailer** — Automated email dispatch (SMTP)
- **bcryptjs** — Password hashing with salted rounds
- **pdfkit** — Dynamic PDF report generation

## Environment Variables
Create a `.env` file in this directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=talentbridge_db
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email (SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Running Locally
```bash
npm install
npm run dev   # Starts with nodemon (hot-reload)
```
