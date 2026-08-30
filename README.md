# 🎓 PS Academy LMS — Full-Stack Learning Management System

A production-ready, full-stack Learning Management System (LMS) built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Strapi CMS (v5)** powered by a **PostgreSQL** relational database.

---

## 🔗 Live Deployments

* **Frontend Application (Vercel):** [https://ps-academy-lms-mauve.vercel.app](https://ps-academy-lms-mauve.vercel.app)
* **Backend API & Admin (Railway):** [https://ps-academy-lms-production.up.railway.app](https://ps-academy-lms-production.up.railway.app)
* **Strapi Admin Panel:** [https://ps-academy-lms-production.up.railway.app/admin](https://ps-academy-lms-production.up.railway.app/admin)

---

## 🔑 Demo Access & Role Credentials

The platform enforces Role-Based Access Control (RBAC) across three distinct user roles. Use the following credentials to test the features:

| Role | Username / Identifier | Password | Key Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `Student_User` | `Student@12345` | Browse course catalog, enroll in courses, track lesson completion milestones, take interactive quizzes with automated grading, and view personalized dashboard analytics. |
| **Instructor** | `Instructor_User` | `Instructor@12345` | Create, update, and manage assigned courses and lessons; access student progress analytics strictly isolated to their own courses. |
| **Admin** | `Admin_User` | `Admin@12345` | Full administrative control, global course and content management, user role assignment, and platform-wide monitoring. |

---

## 🚀 Key Features & Implementation Architecture

### 1. 🛡️ Role-Based Access Control (RBAC) & Backend Security
* **Gateway-Level Policy Enforcement:** Permissions are enforced at the API layer via the Strapi **Users & Permissions Plugin** and custom controller logic. Unauthorized or unauthenticated requests are rejected with `401 Unauthorized` or `403 Forbidden`.
* **Data Isolation:** In the progress controller (`getAllStudentProgress`), instructor queries are strictly restricted with `courseOwnerId === user.id`, preventing cross-instructor data visibility.
* **Frontend Route Protection:** Client-side route guards and React Context verify session state and user roles before rendering protected views.

---

### 2. 📊 Progress Tracking Engine
* **Relational Schema:** Student progress is stored in a relational `Progress` table linking `student` (User ID), `lesson` (Lesson ID), and a `completed` (Boolean) state.
* **Idempotent State Toggle:** The `handleToggleProgress` controller method enables students to toggle lesson completion status seamlessly.
* **Dynamic Percentage Aggregation:** The `getMyProgress` endpoint aggregates completed lessons against total course lessons:
  $$\text{Progress (\%)} = \left( \frac{\text{Completed Lessons}}{\text{Total Lessons}} \right) \times 100$$
  This allows real-time progress bar rendering across student dashboards.

---

### 3. 📝 Quiz Engine & Server-Side Auto-Grading
* **Secure Server Evaluation:** When a student submits quiz answers, the backend controller (`submitAttempt`) compares inputs directly against canonical answer keys stored in the database.
* **Automated Scoring:** Calculates percentage scores and validates whether the student met the course's `passingScore` (e.g., 60%).
* **Historical Persistence:** Stores every submission in the `QuizAttempt` entity for retrospective review and student achievement metrics.

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
