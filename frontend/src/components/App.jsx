import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Student from "./Student";
import Instructor from "./Instructor";
import FacultyAdvisor from "./FacultyAdvisor";
import InstructorCourseDetails from "./InstructorCourseDetails";
import ProtectedRoute from "./ProtectedRoute";

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
        <Route path="/" element={<Login />} />

        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <Student />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/*"
          element={
            <ProtectedRoute allowedRole="INSTRUCTOR">
              <Instructor />
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
          path="/fa/*"
          element={
            <ProtectedRoute allowedRole="FACULTY_ADVISOR">
              <FacultyAdvisor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
