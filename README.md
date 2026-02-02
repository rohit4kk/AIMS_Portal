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

 🎓 AIMS – Academic Information Management System
📌 Overview

AIMS (Academic Information Management System) is a role-based web application designed to manage academic workflows in a college environment. It digitizes key processes such as course offering, student enrollment, approval handling, grading, and academic record management.

The system supports four user roles — Student, Instructor, Faculty Advisor, and Admin — each with a dedicated dashboard and role-specific permissions.

AIMS follows a multi-level course enrollment workflow, where a student’s enrollment request must first be approved by the course instructor and then by the faculty advisor before the student is officially enrolled. This closely reflects real-world academic approval processes used in universities.

Authentication is implemented using a secure OTP-based email login system, eliminating the need for passwords and improving usability and security.

✨ Features
🔐 Authentication

OTP-based email login (no passwords)

Role-based access control

Automatic redirection based on user role

🧑‍🎓 Student Module

View courses offered

Search courses by course code

Request course enrollment

Track enrollment status

Drop courses based on eligibility rules

View academic record grouped semester-wise

👨‍🏫 Instructor Module

Instructor dashboard

Add and manage courses

View pending enrollment requests

Approve or reject student requests

View enrolled students

Assign and update grades

🧑‍💼 Faculty Advisor Module

View assigned students

Review enrollment requests

Approve or reject enrollments

View approval history

🛠 Admin Module

Dedicated admin dashboard

Add new students, instructors, and faculty advisors

Automatic UUID-based user creation

No manual database insertion required

🧰 Tech Stack
Frontend

React

React Router

JavaScript (ES6+)

CSS (component-based styling)

Backend

Node.js

Express.js

RESTful API architecture

Nodemailer (for OTP email delivery)

Database

Supabase (PostgreSQL)

UUID-based primary keys

Foreign key constraints

Relational database design

🔄 System Architecture

Frontend communicates with backend using the Fetch API

Backend handles authentication, business logic, and database operations

Supabase manages persistent data storage and enforces data integrit
