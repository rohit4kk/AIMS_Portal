import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

import "./public/Admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/admin";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="admin-navbar">
        <div className="navbar-brand">AIMS</div>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="hamburger-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Desktop Navigation */}
        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <button onClick={() => handleNavigation("/admin")}>Home</button>
          <button onClick={() => handleNavigation("/admin/add-student")}>
            Add Student
          </button>
          <button onClick={() => handleNavigation("/admin/add-instructor")}>
            Add Instructor
          </button>
          <button onClick={() => handleNavigation("/admin/add-fa")}>
            Add Faculty Advisor
          </button>
          <button onClick={() => handleNavigation("/admin/courses")}>
            All Courses
          </button>
          <button onClick={() => handleNavigation("/admin/create-course")}>
            Create Course
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* PAGE CONTENT WRAPPER */}
      <div className="admin-page-wrapper">
        {/* 🔙 SIDE BACK BUTTON */}
        {!isHome && (
          <button
            className="side-back-btn"
            onClick={() => navigate("/admin")}
          >
            ← Back
          </button>
        )}

        {/* ACTUAL PAGE CONTENT */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
