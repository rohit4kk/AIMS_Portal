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
    <div>
      <nav className="navbar">

        <div className="navbar-left">
          <div className="student-logo">AIMS</div>
          <button onClick={() => navigate("/instructor")}>Home</button>

          <button onClick={() => navigate("/instructor/courses-offered")}>
            Courses Offered
          </button>

          <button onClick={() => navigate("/instructor/add-course")}>
            Add Course
          </button>

          
        </div>
        <button className="logout-btn" style={{backgroundColor: "#FF2C2C"}} onClick={handleLogout}>
            Logout
        </button>
      </nav>
      <div className="instructor-container">
        {/* NAVBAR */}
        

        {/* COURSES LIST */}
        
          <h1 className="navbar-title" style={{color: "black"}}>
            {instructor ? `Welcome, ${instructor.name}` : "Loading..."}
          </h1>
        <h2 className="courses-heading">YOUR COURSES :</h2>

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
    </div>
  );
}
