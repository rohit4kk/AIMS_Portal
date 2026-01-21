import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import StudentHome from "./StudentHome";
import CoursesOffered from "./CoursesOffered";
import StudentRecord from "./StudentRecord";
import "./public/Student.css";

export default function Student() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();          // remove userId, role
    navigate("/");                 // back to login
  };

  const go = (path) => {
    navigate(path);
    setMenuOpen(false); // close menu on mobile after click
  };

  return (
    <div className="student-page">
      {/* NAVBAR */}
      <div className="student-navbar">
        {/* LEFT: LOGO / TITLE */}
        <div className="combined">
          <div className="student-logo">AIMS</div>

          {/* DESKTOP NAV */}
          <div className="student-nav-left desktop-only">
            <NavButton text="Home" onClick={() => go("/student")} />
            <NavButton text="Courses Offered" onClick={() => go("/student/courses")} />
            <NavButton text="Student Record" onClick={() => go("/student/record")} />
          </div>

          
        </div>
        {/* DESKTOP LOGOUT */}
          <button className="logout-btn desktop-only" onClick={handleLogout}>
            Logout
          </button>

        {/*(MOBILE) */}
        <div
          className="hamburger mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="mobile-menu">
            <button onClick={() => go("/student")}>Home</button>
            <button onClick={() => go("/student/courses")}>Courses Offered</button>
            <button onClick={() => go("/student/record")}>Student Record</button>
            <hr />
            <button className="logout-mobile" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* PAGE CONTENT */}
      <Routes>
        <Route index element={<StudentHome />} />
        <Route path="courses" element={<CoursesOffered />} />
        <Route path="record" element={<StudentRecord />} />
      </Routes>
    </div>
  );
}

function NavButton({ text, onClick }) {
  return (
    <button onClick={onClick} className="student-nav-btn">
      {text}
    </button>
  );
}