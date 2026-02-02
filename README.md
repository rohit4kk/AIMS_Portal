# Project Setup and Run Instructions

Follow the steps below to run the project locally.

## Steps to Run the Project

1. Open two terminal windows.

   * In the first terminal, navigate to the frontend folder:

     ```bash
     cd frontend
     ```
   * In the second terminal, navigate to the backend folder:

     ```bash
     cd backend
     ```

2. Install dependencies in both terminals by running:

   ```bash
   npm install
   ```

3. Start the frontend server by running the following command in the frontend terminal:

   ```bash
   npm run dev
   ```

4. Start the backend server by running the following command in the backend terminal:

   ```bash
   npm start
   ```

5. Open your browser and go to:

   ```
   http://localhost:5173/
   ```

The application should now be running successfully

 Overview:

AIMS (Academic Information Management System) is a role-based web application designed to manage academic processes in a college environment. It digitizes workflows such as course offering, student enrollment, approval management, grading, and academic record tracking.

The system supports four user roles — Student, Instructor, Faculty Advisor, and Admin — each having a dedicated dashboard with role-specific functionalities. A key feature of AIMS is its multi-level course enrollment process, where a student’s enrollment request must be approved by the course instructor and then by the faculty advisor before final enrollment.

Authentication is implemented using a secure OTP-based email login system, eliminating the need for passwords. The application follows a clean frontend–backend separation and uses a relational database with proper constraints to ensure data consistency and integrity.

✨ Features:
 Authentication

OTP-based email login (no passwords)

Secure session handling

Role-based redirection after login

 Student

View available courses

Search courses by course code

Request course enrollment

Track enrollment status

Drop courses (based on eligibility rules)

View academic record grouped by semester

 Instructor

View instructor dashboard

Add and manage courses

View enrollment requests

Approve or reject student enrollments

View enrolled students

Assign and update grades

 Faculty Advisor

View assigned students

Review enrollment requests

Approve or reject enrollments

View approval history

 Admin

Dedicated admin dashboard

Add students, instructors, and faculty advisors

Automatic user creation with UUID-based IDs

No manual database entry required

 Tech Stack :-
Frontend

React

React Router

JavaScript (ES6+)

CSS (Inline & Component-based)

Backend

Node.js

Express.js

RESTful APIs

Nodemailer (for OTP emails)

Database

Supabase (PostgreSQL)

UUID-based primary keys

Foreign key constraints

Relational schema design

 System Architecture :

Frontend communicates with backend using Fetch API

Backend handles authentication, business logic, and database operations

Supabase manages structured relational data and integrity constraints
