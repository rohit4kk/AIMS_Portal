import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Course_Form from "./Course_Form";
import "./public/Instructor.css";

export default function Instructor() {
  const [showForm, setShowForm] = useState(false);
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
  localStorage.clear(); // or removeItem("userId")
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
      {/* Top Bar */}
      <div className="top-bar">
        <h2>
          {instructor ? `Welcome ${instructor.name}` : "Loading..."}
        </h2>
        <div className="course-form">
          <div className="top-bar-actions">
            <button
              className="add-course-btn"
              onClick={() => setShowForm(true)}
            >
              Add Course
            </button>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {showForm && (
            <Course_Form
              onClose={() => setShowForm(false)}
              onCourseAdded={fetchCourses}
            />
          )}
        </div>
        
      </div>

      {/* Courses */}
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
            {index + 1}. {course.title} | {course.credits} Credits |{" "}
            {course.semester}
          </button>
        ))}
      </div>
    </div>
  );
}
