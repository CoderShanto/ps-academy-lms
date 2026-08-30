# 🎓 PS Academy LMS

> A full-stack Learning Management System built to provide role-based course management, student enrollment, lesson progress tracking, online quizzes, automated grading, and content publishing.

## 🌐 Live Application

| Application | URL |
|---|---|
| **Frontend** | https://ps-academy-lms-mauve.vercel.app |
| **Backend API** | https://ps-academy-lms-production.up.railway.app |
| **Strapi Admin** | https://ps-academy-lms-production.up.railway.app/admin |

---

## 📌 Overview

PS Academy LMS is a full-stack learning platform designed around three main user experiences:

- **Students** can browse courses, enroll, access lessons, track their progress, and take quizzes.
- **Instructors / Content Managers** can manage learning content such as courses, lessons, quizzes, and blog posts according to their permissions.
- **Administrators** can manage users, roles, courses, lessons, and platform content.

The application follows a separated frontend/backend architecture using **Next.js** and **Strapi**, with **PostgreSQL** as the primary database.

---

## ✨ Features

### 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Role-based access control
- Protected frontend routes
- Backend permission enforcement
- Separate capabilities for:
  - Student
  - Instructor
  - Content Manager
  - Admin
- Unauthorized actions are rejected at the API level

---

### 📚 Course Management

- Course creation and management
- Course descriptions and metadata
- Lesson management
- Multiple lessons per course
- Ordered lesson sequence
- Instructor ownership restrictions
- Administrative content management

---

### 🎓 Student Enrollment

- Browse available courses
- Enroll in courses
- View enrolled courses separately
- Prevent unauthorized enrollment actions
- Student-specific course access

---

### 📈 Progress Tracking

Students can track their learning progress on a per-course basis.

The system stores lesson completion state for each student and calculates progress dynamically:

```text
Progress % =
(Completed Lessons / Total Lessons) × 100
```

Example:

```text
Completed: 3 lessons
Total:     5 lessons

Progress: 60%
```

Progress persists across page refreshes and is isolated per student.

---

### 📝 Quiz & Auto-Grading

- MCQ-based quizzes
- Multiple questions and answer options
- Correct-answer configuration
- Server-side answer validation
- Automatic score calculation
- Passing-score evaluation
- Quiz attempt persistence
- Previous quiz results can be viewed later

Quiz grading is performed on the backend rather than trusting the client-side answer evaluation.

---

### 🛠️ Admin Management

Administrators can manage platform-level resources including:

- Users
- User roles
- Courses
- Lessons
- Blog posts
- Platform statistics

The admin area is protected so that administrative functionality is not accessible to unauthorized users.

---

### 📰 Blog & Publishing

- Create blog posts
- Edit blog posts
- Delete blog posts
- Draft / Published workflow
- Cover image support
- Public access to published posts
- Draft posts remain unavailable to public users

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      Next.js         │
                    │      Frontend        │
                    │                      │
                    │  App Router          │
                    │  TypeScript          │
                    │  Tailwind CSS        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │       Strapi         │
                    │       Backend        │
                    │                      │
                    │ Authentication       │
                    │ Authorization        │
                    │ Content Management   │
                    │ Custom Controllers   │
                    │ Business Logic       │
                    └──────────┬───────────┘
                               │
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    │       Database       │
                    └──────────────────────┘
```

---

## 🔄 Example Data Flow

### Quiz Submission

```text
Student
   │
   │ Submit answers
   ▼
Next.js Frontend
   │
   │ REST API + Authentication
   ▼
Strapi Controller
   │
   ├── Authenticate user
   ├── Verify student permissions
   ├── Retrieve quiz questions
   ├── Validate submitted answers
   ├── Calculate score
   ├── Determine pass/fail
   └── Store quiz attempt
   │
   ▼
PostgreSQL
   │
   ▼
Strapi API
   │
   ▼
Next.js
   │
   ▼
Score & Result displayed to student
```

---

## 🗂️ Core Data Model

The main entities are:

```text
User
 │
 ├── Enrollments
 ├── Progress
 └── Quiz Attempts

Course
 │
 ├── Lessons
 ├── Enrollments
 ├── Progress
 └── Quizzes

Lesson
 │
 └── Progress

Quiz
 │
 ├── Questions
 └── Quiz Attempts

Blog Post
 │
 └── Author / Publishing State
```

### Main Relationships

```text
User 1 ───────── * Enrollment
Course 1 ─────── * Enrollment

Course 1 ─────── * Lesson

User 1 ───────── * Progress
Lesson 1 ─────── * Progress

Course 1 ─────── * Quiz
Quiz 1 ───────── * Question

User 1 ───────── * QuizAttempt
Quiz 1 ───────── * QuizAttempt
```

---

## 🧰 Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS
- Lucide React
- Axios

### Backend

- Strapi CMS v5
- Node.js
- REST API
- Users & Permissions Plugin
- Custom Controllers / Business Logic

### Database

- PostgreSQL

### Authentication

- JWT
- Role-Based Access Control (RBAC)

### Deployment

- Vercel — Frontend
- Railway — Backend
- PostgreSQL — Production Database

---

## 🚀 Local Development

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL
- Git

---

### 1. Clone the repositories

```bash
git clone <frontend-repository-url>
git clone <backend-repository-url>
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
HOST=0.0.0.0
PORT=1337

APP_KEYS=your_app_keys
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret

DATABASE_CLIENT=postgres
DATABASE_URL=your_postgresql_connection_string
```

Start Strapi:

```bash
npm run develop
```

The Strapi admin panel will be available at:

```text
http://localhost:1337/admin
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:1337/api
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

Start Next.js:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔑 Demo Access

Demo accounts are available for testing the different application roles.

For security, **passwords are intentionally not published in this repository**.

| Role | Access |
|---|---|
| Student | Student learning experience |
| Instructor | Course and lesson management |
| Content Manager | Platform content management |
| Admin | Full administrative management |

> Demo credentials can be provided separately for evaluation purposes.

---

## 🔒 Security Considerations

The application uses multiple layers of access control:

```text
Request
   ↓
Authentication
   ↓
User Identity
   ↓
Role Verification
   ↓
Permission / Ownership Check
   ↓
Business Logic
   ↓
Database
```

Frontend UI restrictions are not treated as the primary security mechanism. Sensitive operations are validated on the backend.

---

## 📊 Key Engineering Highlights

### Backend-enforced RBAC

Permissions are enforced at the API layer rather than relying solely on hidden frontend controls.

### Student-specific progress

Progress records are associated with individual students and lessons, preventing progress data from being shared between users.

### Server-side quiz evaluation

Quiz answers are evaluated on the backend using the stored correct answers instead of trusting a score submitted by the browser.

### Instructor data isolation

Instructor-level operations are restricted to resources they are authorized to manage.

### Persistent learning state

Enrollment, lesson completion, and quiz attempts are persisted in the database.

---

## 📁 Project Structure

```text
PS-Academy-LMS/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── ...
│   ├── config/
│   └── ...
│
└── README.md
```

> Adjust the structure above if your actual repository uses different directory names.

---

## 👨‍💻 Author

**Mahmud Hasan Shanto**

Full-Stack Software Engineer

- **GitHub:** https://github.com/CoderShanto
- **LinkedIn:** https://www.linkedin.com/in/md-mahmud-hasan-shanto-614b37224/

---

## 📄 License

This project was developed as a full-stack LMS application demonstrating modern frontend development, backend API design, authentication, authorization, database relationships, and application architecture.
