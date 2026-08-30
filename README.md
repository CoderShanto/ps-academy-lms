# 🎓 PS Academy LMS — Full-Stack Learning Management System

A production-grade, full-stack Learning Management System (LMS) engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Strapi CMS (v5)** with **PostgreSQL**.

---

## 🔗 Live Deployments

* **Frontend Web Application (Vercel):** [https://ps-academy-lms-mauve.vercel.app](https://ps-academy-lms-mauve.vercel.app)
* **Backend API & Admin (Railway):** [https://ps-academy-lms-production.up.railway.app](https://ps-academy-lms-production.up.railway.app)
* **Strapi Admin Dashboard:** [https://ps-academy-lms-production.up.railway.app/admin](https://ps-academy-lms-production.up.railway.app/admin)

---

## 🔑 Demo Access & Role Credentials

The platform enforces Role-Based Access Control (RBAC) across **four distinct user roles**. Use the credentials below to test each user journey:

| Role | Username / Identifier | Password | Key Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `Student_User` | `Student@12345` | Browse catalog, enroll in courses, track lesson completion milestones, take interactive quizzes with automated grading, and view personal dashboard progress. |
| **Instructor** | `Instructor_User` | `Instructor@12345` | Author and update courses, manage lesson contents, and view student progress analytics strictly isolated to their own created courses. |
| **Content Manager** | `Manager_User` / `Content_User` | `Manager@12345` | Review, curate, and organize course curricula, lesson modules, quizzes, and multimedia assets without elevated system administration rights. |
| **Admin** | `Admin_User` | `Admin@12345` | Full platform governance, user role provisioning, global curriculum oversight, and database monitoring via the Strapi Admin Panel and custom views. |

---

## 🚀 Core Features & Technical Architecture

### 1. 🛡️ Role-Based Access Control (RBAC) & Backend Security
* **Gateway-Level Policy Enforcement:** Permissions are enforced at the API level via the Strapi **Users & Permissions Plugin** and custom controller middlewares. Unauthorized requests return `401 Unauthorized` or `403 Forbidden`.
* **Data Isolation:** In the progress controller (`getAllStudentProgress`), instructor requests apply strict filtering (`courseOwnerId === user.id`) to prevent unauthorized cross-instructor data visibility.
* **Client Route Guards:** Next.js middleware and React Context authenticate session state and user roles prior to rendering protected pages.

---

### 2. 📊 Relational Progress Tracking Engine
* **Relational Schema:** Course progress is persisted in a relational `Progress` entity referencing `student` (User ID), `lesson` (Lesson ID), and a `completed` (Boolean) state.
* **Idempotent Toggle Flow:** The `handleToggleProgress` controller method enables students to toggle lesson completion states idempotently.
* **Dynamic Percentage Aggregation:** The `getMyProgress` endpoint aggregates completed lessons against total course modules:
  $$\text{Progress (\%)} = \left( \frac{\text{Completed Lessons}}{\text{Total Lessons}} \right) \times 100$$
  This calculation dynamically drives dashboard progress bars and course completion badges.

---

### 3. 📝 Assessment Engine & Server-Side Auto-Grading
* **Secure Evaluation:** The `submitAttempt` controller compares student inputs on the server side against canonical answer keys stored in the database.
* **Automated Scoring:** Computes percentage scores in real time and evaluates pass status against `quiz.passingScore` (default 60%).
* **Historical Records:** Submissions are saved into the `QuizAttempt` entity for student record reviews and historical analytics.

---

## 🔄 End-to-End Data Flow

```text
[ Next.js Client ]
       │  (1) POST /api/quiz-attempts/submit (JWT + Answers Payload)
       ▼
[ Strapi Backend Controller ]
       │  (2) Verify JWT & Authorize Student Role
       │  (3) Query Canonical Quiz & Question Keys from DB
       │  (4) Grade Submissions & Calculate Percentage Score
       │  (5) Persist Attempt to PostgreSQL ('QuizAttempt' Table)
       ▼
[ Next.js Client ]
          (6) Receives Real-Time Score, Passing Badge & Updated Progress

          🛠️ Tech Stack
Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React, Axios

Backend: Strapi CMS v5 (Node.js REST API)

Database: PostgreSQL

Authentication: JWT (JSON Web Tokens)

Deployment: Vercel (Frontend), Railway (Backend & PostgreSQL Database)

💻 Local Development Setup
1. Backend Setup (Strapi)
Bash
# Clone the repository
git clone <your-backend-repo-url>
cd backend

# Install dependencies
npm install

# Configure environment variables (.env)
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys
API_TOKEN_SALT=your_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret
DATABASE_CLIENT=postgres
DATABASE_URL=your_postgres_connection_string

# Start backend development server
npm run develop
2. Frontend Setup (Next.js)
Bash
# Clone the repository
git clone <your-frontend-repo-url>
cd frontend

# Install dependencies
npm install

# Configure environment variables (.env.local)
NEXT_PUBLIC_API_URL=[https://ps-academy-lms-production.up.railway.app/api](https://ps-academy-lms-production.up.railway.app/api)
NEXT_PUBLIC_STRAPI_URL=[https://ps-academy-lms-production.up.railway.app](https://ps-academy-lms-production.up.railway.app)

# Start frontend development server
npm run dev
Visit http://localhost:3000 to interact with the application locally.

👤 Author
Developer: Pranta Saha

Role: Full-Stack Software Engineer

GitHub: https://github.com/prantasaha

LinkedIn: https://linkedin.com/in/prantasaha
