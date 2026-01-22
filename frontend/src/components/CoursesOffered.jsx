import { useEffect, useState } from "react";
import CourseModal from "./CourseModal";

export default function CoursesOffered() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      const res = await fetch("http://localhost:5001/courses");
      const data = await res.json();

      if (res.ok) {
        setCourses(data);
      } else {
        console.error(data.error);
      }
    }

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.course_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="student-content">
      <h2>Courses Offered</h2>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search by course code (e.g. CS101)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "320px",
          padding: "10px",
          margin: "20px 0"
        }}
      />

      {/* COURSE LIST */}
      <div className="courses-list">
        {filteredCourses.length === 0 && (
          <p>No courses found.</p>
        )}

        {filteredCourses.map(course => (
          <div
            key={`${course.course_id}-${course.semester}-${course.instructor_name}`}
            onClick={() => setSelectedCourse(course)}
            className="course-card"
          >
            <strong>{course.course_id}</strong> — {course.title}
            <br />
            Professor: {course.instructor_name}
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