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


📌 Project Overview

AIMS (Academic Information Management System) is a role-based web portal designed to manage academic workflows in a college environment.
The system digitizes and automates course enrollment, approvals, grading, and academic records, replacing manual and paper-based processes.

The application supports multiple user roles:

Student

Instructor

Faculty Advisor

Admin

Each role has a separate dashboard with controlled access to features relevant to their responsibilities.

 Core Objective

The main objective of this project is to implement a multi-step course enrollment workflow where:

A student requests enrollment in a course

The instructor approves or rejects the request

The faculty advisor gives final approval

Only after both approvals, the student is officially enrolled

This mirrors real academic processes used in universities.

 Authentication System

OTP-based login (no passwords)

User enters institutional email

A 6-digit OTP is generated and emailed

OTP is stored temporarily in the database with expiry

On successful verification:

User is logged in

Redirected based on role (Student / Instructor / FA / Admin)

This ensures secure and simple authentication.

 Student Features

View personal dashboard

Browse courses offered

Search courses by course code

Request enrollment in a course

Track enrollment status:

Pending Instructor Approval

Pending Advisor Approval

Enrolled / Rejected

Drop a course (only if allowed by rules)

View academic record, grouped semester-wise:

Courses taken

Credits

Grades

Status

 Instructor Features

View instructor dashboard

Add new courses offered

View courses they teach

See pending enrollment requests

Approve or reject student enrollment requests

View list of enrolled students

Assign and update grades for enrolled students

 Faculty Advisor Features

View students assigned to them

See enrollment requests pending advisor approval

Approve or reject enrollment after instructor approval

View decision history for academic transparency

 Admin Features

Dedicated Admin Dashboard

Create new users without manual database entry:

Students

Instructors

Faculty Advisors

Automatically inserts data into:

users table (authentication)

Corresponding role table (student / instructor / FA)

Admin does not manually enter IDs

System uses auto-generated UUIDs for consistency and safety

 Database Design (High Level)

The database is designed using relational modeling with foreign keys and constraints to ensure data integrity.

Main tables include:

users – authentication and role mapping

students

instructors

faculty_advisors

courses

teaches – instructor–course mapping

takes – enrollment, approval status, grades

All relationships enforce:

Referential integrity

Valid enrollment states

Controlled grade assignment

Tech Stack
Frontend

React

React Router

Hooks (useState, useEffect)

Modular components (dashboards, modals, forms)

Backend

Node.js

Express.js

REST APIs (GET, POST, DELETE)

Nodemailer for OTP emails

Database

Supabase (PostgreSQL)

UUID-based primary keys

Foreign key constraints

Role-based data separation

 Communication Flow

Frontend communicates with backend using Fetch API

Backend validates requests and interacts with Supabase

Responses are sent as JSON

Frontend updates UI dynamically without page reloads

 Main Highlights

Fully role-based system

Secure OTP authentication

Multi-level approval workflow

Real-world academic logic

Clean separation of frontend and backend

Scalable database design
