import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./public/Instructor.css";

export default function Instructor() {
  const [courses, setCourses] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ NEW

  const navigate = useNavigate();
  const instructorId = localStorage.getItem("userId");

  const fetchCourses = async () => {
    const res = await fetch(
      `http://localhost:5001/instructor/${instructorId}/courses`
    );
    const data = await res.json();

    if (res.ok) setCourses(data);
    else console.error(data.error);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const go = (path) => {
    navigate(path);
    setMenuOpen(false); // close mobile menu
  };

  useEffect(() => {
    async function fetchInstructor() {
      const res = await fetch(
        `http://localhost:5001/instructor/${instructorId}`
      );
      const data = await res.json();

      if (res.ok) setInstructor(data);
      else console.error(data.error);
    }

    if (instructorId) fetchInstructor();
  }, [instructorId]);

  useEffect(() => {
    if (instructorId) fetchCourses();
  }, [instructorId]);

  return (
    <div className="instructor-page">
      {/* NAVBAR */}
      <div className="navbar">
        {/* LEFT */}
        <div className="combined">
          <div className="student-logo">AIMS</div>

          {/* DESKTOP NAV */}
          <div className="navbar-left desktop-only">
            <NavButton text="Home" onClick={() => go("/instructor")} />
            <NavButton
              text="Courses Offered"
              onClick={() => go("/instructor/courses-offered")}
            />
            <NavButton
              text="Add Course"
              onClick={() => go("/instructor/add-course")}
            />
          </div>
        </div>

        {/* DESKTOP LOGOUT */}
        <button
          className="logout-btn desktop-only"
          style={{ backgroundColor: "#FF2C2C" }}
          onClick={handleLogout}
        >
          Logout
        </button>

        {/* MOBILE HAMBURGER */}
        <div
          className="hamburger mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="mobile-menu">
            <button onClick={() => go("/instructor")}>Home</button>
            <button onClick={() => go("/instructor/courses-offered")}>
              Courses Offered
            </button>
            <button onClick={() => go("/instructor/add-course")}>
              Add Course
            </button>
            <hr />
            <button className="logout-mobile" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="instructor-container">
        <h1 className="navbar-title" style={{ color: "black" }}>
          {instructor ? `Welcome, ${instructor.name}` : "Loading..."}
        </h1>

        <h2 className="courses-heading">YOUR COURSES :</h2>

        <div className="courses-list">
          {courses.length === 0 && <p>No courses yet</p>}

          {courses.map((course) => (
            <button
              key={course.course_id}
              className="course-card"
              onClick={() =>
                navigate(`/instructor/course/${course.course_id}`, {
                  state: course,
                })
              }
            >
              <strong>
                {course.course_id} | {course.title}
              </strong>
              <br />
              Credits: {course.credits}
              <br />
              Semester: {course.semester}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Reusable Nav Button */
function NavButton({ text, onClick }) {
  return (
    <button onClick={onClick} className="student-nav-btn">
      {text}
    </button>
  );
}
