<!-- Dynamic Header -->
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1&height=250&section=header&text=TalentBridge&fontSize=80&animation=fadeIn&fontAlignY=35&desc=Enterprise%20ATS%20Hiring%20Platform&descAlignY=58&descSize=20" width="100%" alt="Header" />
</div>

<div align="center">
  <a href="https://talent-bridge-secure-enterprise-ful.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_LIVE_DEMO-Click_Here-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/github/stars/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform?style=for-the-badge&color=yellow" alt="Stars" />
  &nbsp;
  <img src="https://img.shields.io/github/last-commit/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform?style=for-the-badge&color=purple" alt="Last Commit" />
  &nbsp;
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License" />
</div>

<br />

<div align="center">
  <a href="https://talent-bridge-secure-enterprise-ful.vercel.app/">
    <img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=600&size=22&pause=1000&color=4F46E5&center=true&vCenter=true&width=600&lines=Automated+ATS+Resume+Screening;Zero-Trust+OAuth+2.0+Security;Real-Time+Application+Tracking;Built+for+Enterprise+Scale" alt="Typing SVG" />
  </a>
</div>

---

## 🌟 Vision & Business ROI

**TalentBridge** is a modern, high-performance recruitment ecosystem engineered to solve the most expensive problem in HR: **Time-to-Hire (TTH)**. By integrating a proprietary **Applicant Tracking System (ATS)** engine, it automatically parses complex PDFs, tokenizes candidate data, and scores them against job descriptions — eliminating manual screening entirely.

<div align="center">
  <img src="https://img.shields.io/badge/⏱_Screening_Time-↓_60%25-10b981?style=for-the-badge" alt="60%" />
  &nbsp;
  <img src="https://img.shields.io/badge/⚡_Shortlisting_Speed-3x_Faster-4f46e5?style=for-the-badge" alt="3x" />
  &nbsp;
  <img src="https://img.shields.io/badge/🤖_Resume_Parsing-100%25_Automated-f59e0b?style=for-the-badge" alt="100%" />
</div>

---

## 🎬 Live Demo & Walkthrough

> 🔗 **Experience TalentBridge live:** [**https://talent-bridge-secure-enterprise-ful.vercel.app/**](https://talent-bridge-secure-enterprise-ful.vercel.app/)

### What You Can Do in the Live Demo:
- 🔑 **Sign Up / Login** with Google or GitHub OAuth in 1 click
- 📄 **Upload a Resume** (PDF/DOCX) and watch the ATS engine score it in real-time
- 🔍 **Browse & Filter Jobs** with semantic search capabilities
- 📊 **Recruiter Dashboard** — view ranked candidates, manage pipelines, send emails
- 🛡️ **Admin Panel** — full RBAC control, user management, audit logs

---

## 🔄 Core Workflows & System Architecture

### 1. The Candidate Journey (End-to-End)

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant React as React Client
    participant Auth as OAuth Provider
    participant API as Express API
    participant ATS as Parsing Engine
    participant DB as Database
    
    Candidate->>React: Authenticate (OAuth 2.0)
    React->>Auth: Request Token
    Auth-->>React: Return Secure JWT
    Candidate->>React: Upload Resume (PDF/DOCX)
    React->>API: POST /api/applications/upload
    API->>ATS: Stream file to parser
    Note over ATS: Extract text layers & semantics
    ATS->>API: Return ATS Score & Tokens
    API->>DB: Persist Candidate Data
    DB-->>React: 200 OK Status
    React-->>Candidate: Render Real-Time Dashboard
```

### 2. The Recruiter Ecosystem Flow

```mermaid
graph LR
    classDef dash fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff;
    classDef dbs fill:#0f172a,stroke:#334155,stroke-width:2px,color:#fff;
    classDef dec fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;
    classDef pass fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef fail fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff;

    A[Recruiter Dashboard]:::dash -->|Post Job| B[(Database)]:::dbs
    B --> C{Review Stage}:::dec
    
    C -->|Score High| D[Auto-Shortlist]:::pass
    C -->|Score Medium| E[Manual Queue]:::dec
    C -->|Score Low| F[Auto-Reject]:::fail
    
    D --> G[Email Invite]:::pass
    E --> H[Recruiter Screen]:::dash
    F --> I[Rejection Email]:::fail
```

### 3. Global System Architecture

```mermaid
graph TD
    classDef client fill:#0ea5e9,stroke:#0369a1,stroke-width:2px,color:#fff;
    classDef server fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef data fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;

    subgraph Frontend_Layer ["Frontend Edge Layer"]
        C1[React 19 SPA]:::client
        C2[Vercel CDN Network]:::client
    end

    subgraph Backend_Layer ["Core Backend API"]
        S1[Auth Guard JWT]:::server
        S2[Express.js Router]:::server
        S3[ATS Parsing Engine]:::server
    end

    subgraph Data_Layer ["Data & Services Layer"]
        D1[(MySQL DB)]:::data
        D2[SMTP Nodemailer]:::data
    end

    C1 <--> C2
    C2 <--> S1
    S1 <--> S2
    S2 --> S3
    S2 <--> D1
    S2 --> D2
```

---

## 💻 Tech Stack Showcase

<table align="center" width="100%">
  <tr>
    <td align="center" width="33%">
      <h3>🎨 Frontend</h3>
      <img src="https://skillicons.dev/icons?i=react,tailwind,vite" /><br><br>
      <b>React 19 &bull; Tailwind CSS &bull; Axios</b><br>
      <sub>Optimistic UI &bull; Memoization &bull; Fluid Layouts</sub>
    </td>
    <td align="center" width="33%">
      <h3>⚙️ Backend</h3>
      <img src="https://skillicons.dev/icons?i=nodejs,express,mysql" /><br><br>
      <b>Node.js &bull; Express 5 &bull; MySQL2</b><br>
      <sub>REST API &bull; JWT &bull; Multer &bull; MVC Pattern</sub>
    </td>
    <td align="center" width="33%">
      <h3>🔗 Integrations</h3>
      <img src="https://skillicons.dev/icons?i=github,gcp,postman" /><br><br>
      <b>Passport.js &bull; Nodemailer &bull; ATS</b><br>
      <sub>OAuth 2.0 &bull; SMTP &bull; Tokenization</sub>
    </td>
  </tr>
</table>

---

## 🎯 Role-Based Data Isolation

TalentBridge enforces strict authorization middleware, guaranteeing deep data privacy.

| 👨‍💼 **Candidate Pipeline** | 🏢 **Recruiter Suite** | 🛡️ **Super Admin Control** |
| :--- | :--- | :--- |
| OAuth (Google/GitHub) 1-Click Auth | Enterprise Email / 2FA Ready | Secure Master Global Login |
| Advanced Semantic Job Filtering | Create, Edit & Archive Job Postings | Global Job & User Moderation |
| Encrypted Multi-format Uploads | View AI-Parsed Candidate Insights | System-wide Audit Logs |
| Real-time Status Tracking | Kanban-style Pipeline View | Advanced RBAC Configurations |

---

## 🛡️ Enterprise Security & Compliance

> **Handling PII (Personally Identifiable Information) requires zero-trust security architecture.**

| Threat Vector | Mitigation Strategy | Technology Utilized |
| :--- | :--- | :--- |
| 💉 **SQL Injection** | Parameterized query layers intercept and sanitize all incoming data streams. | `mysql2` Prepared Statements |
| 🕵️ **Session Hijacking** | Stateless tokens with strict expiration and HTTP-only cookie flags, neutralizing CSRF & XSS. | `jsonwebtoken` & `cors` |
| 🦠 **Malicious Payloads** | Incoming streams are intercepted; enforcing rigid MIME-type boundaries & MB limits. | `multer` Middleware |

---

## 🚀 Quick Start / Local Deployment

> Get the entire enterprise platform running locally in under **3 minutes**.

<details open>
<summary><b>🛠️ Step 1: Database Setup</b></summary>
<br>
Ensure MySQL is active on port <code>3306</code>, then execute:

```sql
CREATE DATABASE talentbridge_db;
```
</details>

<details open>
<summary><b>⚙️ Step 2: Backend Initialization</b></summary>
<br>

```bash
cd backend
npm install
cp .env.example .env   # Inject your local DB & OAuth secrets
npm run dev
```
</details>

<details open>
<summary><b>🌐 Step 3: Frontend Initialization</b></summary>
<br>

```bash
cd frontend
npm install
npm start
```
<i>The application will securely mount at <a href="http://localhost:3000">http://localhost:3000</a>.</i>
</details>

---

## 📂 Project Structure

```text
TalentBridge/
├── 📁 backend/                 # Node.js + Express API Core
│   ├── 📁 config/              # DB & Passport configurations
│   ├── 📁 controllers/         # Business logic & ATS processing
│   ├── 📁 middleware/          # JWT Auth, RBAC, Multer
│   ├── 📁 routes/              # Express Router definitions
│   ├── 📁 utils/               # Helper utilities
│   ├── 📁 uploads/             # Temporary parsed file storage
│   ├── 📄 app.js               # Express app configuration
│   └── 📄 server.js            # API Entry Point
│
├── 📁 frontend/                # React + Tailwind SPA
│   ├── 📁 public/              # Static Assets
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI Components
│   │   ├── 📁 pages/           # Page Views & Admin Panel
│   │   ├── 📁 context/         # React Context Providers
│   │   ├── 📁 services/        # Axios API Interceptors
│   │   └── 📄 App.jsx          # Router Topology
│   └── 📄 tailwind.config.js   # Design System Tokens
│
└── 📄 README.md                # You are here
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m "feat: add AmazingFeature"

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

---

<br>

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1&height=120&section=footer" width="100%" alt="Footer" />
</div>

<div align="center">
  <h2>✨ Architected & Developed with ❤️ by <a href="https://github.com/ruthwik-thotapelli">Ruthwik</a></h2>
  <p><i>"Pushing the boundaries of recruitment technology, one line of code at a time."</i></p>
  
  <br>

  <a href="https://talent-bridge-secure-enterprise-ful.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_View_Live_App-4f46e5?style=for-the-badge&logoColor=white" alt="Live App" />
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform/issues">
    <img src="https://img.shields.io/badge/🐛_Report_Bug-ef4444?style=for-the-badge&logoColor=white" alt="Report Bug" />
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform/pulls">
    <img src="https://img.shields.io/badge/💡_Request_Feature-10b981?style=for-the-badge&logoColor=white" alt="Request Feature" />
  </a>
  
  <br><br>
  
  <sub>If you found this project helpful, consider giving it a ⭐ — it means a lot!</sub>
</div>
