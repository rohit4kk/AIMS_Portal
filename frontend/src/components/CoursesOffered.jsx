import { useEffect, useState } from "react";
import CourseModal from "./CourseModal";

export default function CoursesOffered() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch all courses
  useEffect(() => {
    async function fetchCourses() {
      const res = await fetch("http://localhost:5000/courses");
      const data = await res.json();

      if (res.ok) {
        setCourses(data);
      } else {
        console.error(data.error);
      }
    }

    fetchCourses();
  }, []);

  // Filter by course code
  const filteredCourses = courses.filter(course =>
    course.course_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "40px" }}>
      <h2>Courses Offered</h2>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search by course code (e.g. CS101)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
          marginTop: "20px",
          marginBottom: "20px"
        }}
      />

      {/* COURSE LIST */}
      <div>
        {filteredCourses.length === 0 && (
          <p>No courses found.</p>
        )}

        {filteredCourses.map(course => (
          <div
            key={course.course_id}
            onClick={() => setSelectedCourse(course)}

            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "10px",
              cursor: "pointer"
            }}
          >
            <strong>{course.course_id}</strong> — {course.title}  
            <br />
            Department: {course.department} | Credits: {course.credits}
          </div>
        ))}
      </div>
        {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
        )}


    </div>
  );
}
