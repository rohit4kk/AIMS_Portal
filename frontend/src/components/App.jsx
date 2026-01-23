import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Student from "./Student";
import Instructor from "./Instructor";
import FacultyAdvisor from "./FacultyAdvisor";
import InstructorCourseDetails from "./InstructorCourseDetails";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "./AdminLayout";
import AddCourse from "./AddCourse";
import InstructorCoursesOffered from "./InstructorCoursesOffered";
import EditCourse from "./EditCourse";

import AdminHome from "./AdminHome";
import AdminStudents from "./AdminStudents";
import AdminInstructors from "./AdminInstructors";
import AdminFAs from "./AdminFAs";
import AdminCourses from "./AdminCourses";
import AdminCreateCourse from "./AdminCreateCourse";

import AdminAddStudent from "./AdminAddStudent";
import AdminAddInstructor from "./AdminAddInstructor";
import AdminAddFA from "./AdminAddFA";

export default function App() {
  useEffect(() => {
    const syncLogout = () => {
      if (!localStorage.getItem("role")) {
        window.location.href = "/";
      }
    };

    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* STUDENT */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Student />
            </ProtectedRoute>
          }
        />

        {/* INSTRUCTOR */}
        <Route
          path="/instructor/*"
          element={
            <ProtectedRoute allowedRole="INSTRUCTOR">
              <Instructor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/add-course"
          element={
            <ProtectedRoute allowedRole="INSTRUCTOR">
              <AddCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/courses-offered"
          element={
            <ProtectedRoute allowedRole="INSTRUCTOR">
              <InstructorCoursesOffered />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/course/:courseId"
          element={
            <ProtectedRoute allowedRole="INSTRUCTOR">
              <InstructorCourseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/course/:courseId/edit"
          element={
            <ProtectedRoute allowedRole="INSTRUCTOR">
              <EditCourse />
            </ProtectedRoute>
          }
        />

        {/* FACULTY ADVISOR */}
        <Route
          path="/fa/*"
          element={
            <ProtectedRoute allowedRole="FACULTY_ADVISOR">
              <FacultyAdvisor />
            </ProtectedRoute>
          }
        />

        {/* ✅ ADMIN (SINGLE, CORRECT DEFINITION) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* HOME */}
          <Route index element={<AdminHome />} />

          {/* ADD ACTIONS */}
          <Route path="add-student" element={<AdminAddStudent />} />
          <Route path="add-instructor" element={<AdminAddInstructor />} />
          <Route path="add-fa" element={<AdminAddFA />} />

          {/* VIEWS */}
          <Route path="students" element={<AdminStudents />} />
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="fas" element={<AdminFAs />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="create-course" element={<AdminCreateCourse />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
