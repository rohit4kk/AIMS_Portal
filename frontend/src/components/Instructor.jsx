import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./public/Instructor.css";

export default function Instructor() {
  const [courses, setCourses] = useState([]);
  const [instructor, setInstructor] = useState(null);

  const navigate = useNavigate();
  const instructorId = localStorage.getItem("userId");

  const fetchCourses = async () => {
    const res = await fetch(
      `http://localhost:5001/instructor/${instructorId}/courses`
    );
    const data = await res.json();

    if (res.ok) {
      setCourses(data);
    } else {
      console.error(data.error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    async function fetchInstructor() {
      const res = await fetch(
        `http://localhost:5001/instructor/${instructorId}`
      );
      const data = await res.json();

      if (res.ok) {
        setInstructor(data);
      } else {
        console.error(data.error);
      }
    }

    if (instructorId) fetchInstructor();
  }, [instructorId]);

  useEffect(() => {
    if (instructorId) fetchCourses();
  }, [instructorId]);

  return (
    <div className="instructor-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-title">
            {instructor ? `Welcome, ${instructor.name}` : "Loading..."}
          </span>
        </div>

        <div className="navbar-right">
          <button onClick={() => navigate("/instructor")}>Home</button>

          <button onClick={() => navigate("/instructor/courses-offered")}>
            Courses Offered
          </button>

          <button onClick={() => navigate("/instructor/add-course")}>
            Add Course
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* COURSES LIST */}
      <h1 className="courses-heading">YOUR COURSES :</h1>

      <div className="courses-list">
        {courses.length === 0 && <p>No courses yet</p>}

        {courses.map((course, index) => (
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
  );
}
