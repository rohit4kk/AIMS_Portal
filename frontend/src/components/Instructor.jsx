import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Course_Form from "./Course_Form";

// Dummy data (later this will come from backend)



export default function Instructor() {
  const [showForm, setShowForm] = useState(false);

  const [courses, setCourses] = useState([]);

  const [instructor, setInstructor] = useState(null);
  const navigate = useNavigate();

  const instructorId = localStorage.getItem("userId");

  const fetchCourses = async () => {
  const res = await fetch(
    `http://localhost:5000/instructor/${instructorId}/courses`
  );
  const data = await res.json();

  if (res.ok) {
    setCourses(data);
  } else {
    console.error(data.error);
  }
};


  useEffect(() => {
    async function fetchInstructor() {
      const res = await fetch(
        `http://localhost:5000/instructor/${instructorId}`
      );

      const data = await res.json();

      if (res.ok) {
        setInstructor(data);
      } else {
        console.error(data.error);
      }
    }

    fetchInstructor();
  }, [instructorId]);

  // 🔹 Fetch instructor courses
  useEffect(() => {
   
    if (instructorId) fetchCourses();
  }, [instructorId]);

  return (
    <div style={{ padding: "40px" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>
          {instructor
            ? `Welcome ${instructor.name}`
            : "Loading..."}
        </h2>
        <button style={{ padding: "10px 20px" }} onClick={() => setShowForm(true)}>Add Course</button>
        {showForm && (
        <Course_Form onClose={() => setShowForm(false)} onCourseAdded={fetchCourses} />
        )}

      </div>

      {/* Your Courses */}
      <h1 style={{ marginTop: "40px" }}>YOUR COURSES :</h1>

      <div style={{ marginTop: "20px" }}>
        {courses.length === 0 && <p>No courses yet</p>}

        {courses.map((course, index) => (
          <button
            key={course.course_id}
            onClick={() =>
              navigate(`/instructor/course/${course.course_id}`, {
                state: course
              })
            }
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "15px",
              marginBottom: "10px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            {index + 1}. {course.title} | {course.credits} Credits |{" "}
            {course.semester}
          </button>
        ))}
      </div>
    </div>
  );
}

