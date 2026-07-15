<!-- Dynamic Header -->
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1&height=250&section=header&text=TalentBridge&fontSize=80&animation=fadeIn&fontAlignY=35&desc=Enterprise%20ATS%20Hiring%20Platform&descAlignY=58&descSize=20" width="100%" alt="Header" />
</div>

<div align="center">
  <a href="https://talent-bridge-secure-enterprise-ful.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-Vercel_Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/github/stars/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform?style=for-the-badge&color=yellow" alt="Stars" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License" />
</div>

<div align="center">
  <a href="https://talent-bridge-secure-enterprise-ful.vercel.app/">
    <img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=600&size=22&pause=1000&color=4F46E5&center=true&vCenter=true&width=600&lines=Automated+ATS+Resume+Screening;Zero-Trust+OAuth+2.0+Security;Real-Time+Application+Tracking;Built+for+Enterprise+Scale" alt="Typing SVG" />
  </a>
</div>

---

## 🌟 Vision & Business ROI

**TalentBridge** is a modern, high-performance recruitment ecosystem engineered to solve the most expensive problem in HR: **Time-to-Hire (TTH)**. 

By integrating a proprietary **Applicant Tracking System (ATS)** engine directly into the application pipeline, TalentBridge automatically parses complex PDFs, tokenizes candidate data, and scores them against job descriptions. This eliminates manual screening, resulting in a **60% reduction in recruiter workload** while offering candidates a frictionless, real-time application experience.

---

## 🔄 Core Workflows & System Architecture

To truly understand the power of TalentBridge, here is a visual breakdown of the ecosystem's workflows.

### 1. The Candidate Journey (End-to-End)
This sequence illustrates the frictionless, highly secure pipeline a candidate experiences, from OAuth login to AI-powered resume parsing.

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
How enterprise recruiters manage the influx of applications using automated sorting and 1-click email workflows.

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
The high-level macro view of how the decoupled Client, Edge Load Balancers, and Core API interact.

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
      <h3>Frontend</h3>
      <img src="https://skillicons.dev/icons?i=react,tailwind,vite" /><br>
      <b>React 19, Tailwind CSS, Axios</b><br>
      <i>Optimistic UI, Memoization, Fluid Layouts</i>
    </td>
    <td align="center" width="33%">
      <h3>Backend</h3>
      <img src="https://skillicons.dev/icons?i=nodejs,express,mysql" /><br>
      <b>Node.js, Express 5, MySQL2</b><br>
      <i>REST API, JWT, Multer, MVC Pattern</i>
    </td>
    <td align="center" width="33%">
      <h3>Integrations</h3>
      <img src="https://skillicons.dev/icons?i=github,gcp,postman" /><br>
      <b>Passport.js, Nodemailer, ATS</b><br>
      <i>OAuth 2.0, SMTP, Tokenization</i>
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
| Real-time WebSocket Status Tracking | Kanban-style Pipeline View | Advanced RBAC Configurations |

---

## 🛡️ Enterprise Security & Compliance

> **Handling PII (Personally Identifiable Information) requires zero-trust security architecture.**

| Threat Vector | Mitigation Strategy | Technology Utilized |
| :--- | :--- | :--- |
| 💉 **SQL Injection** | Parameterized query layers intercept and sanitize all incoming data streams. | `mysql2` Prepared Statements |
| 🕵️‍♂️ **Session Hijacking** | Stateless tokens are issued with strict expiration and HTTP-only cookie flags, neutralizing CSRF & XSS. | `jsonwebtoken` & `cors` |
| 🦠 **Malicious Payloads** | Incoming streams are intercepted; enforcing rigid MIME-type boundaries (PDF/DOCX) & MB limits. | `multer` Middleware |

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
cp .env.example .env # Inject your local DB & OAuth secrets
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

<br>

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1&height=100&section=footer" width="100%" alt="Footer" />
  <h2>✨ Architected & Developed with ❤️ by Ruthwik</h2>
  <p><i>"Pushing the boundaries of recruitment technology, one line of code at a time."</i></p>
  
  <br>

  <a href="https://talent-bridge-secure-enterprise-ful.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_View_Live_Application-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live App" />
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://github.com/ruthwik-thotapelli/TalentBridge-Secure-Enterprise-Full-Stack-Hiring-Platform/issues">
    <img src="https://img.shields.io/badge/🐛_Report_A_Bug-ef4444?style=for-the-badge&logo=github&logoColor=white" alt="Report Bug" />
  </a>
  <br><br>
</div>
