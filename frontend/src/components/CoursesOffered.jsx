import { useEffect, useState } from "react";
import CourseModal from "./CourseModal";

export default function CoursesOffered() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  // 🔎 filters
  const [codeSearch, setCodeSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      const res = await fetch("http://localhost:5001/courses");
      const data = await res.json();

      if (res.ok) {
        setCourses(data);
        setFilteredCourses(data);
      } else {
        console.error(data.error);
      }
    }

    fetchCourses();
  }, []);

  // 🔍 SEARCH HANDLER
  const handleSearch = () => {
    let result = courses;

    if (codeSearch) {
      result = result.filter(c =>
        c.course_id.toLowerCase().includes(codeSearch.toLowerCase())
      );
    }

    if (deptFilter) {
      result = result.filter(c =>
        c.department.toLowerCase() === deptFilter.toLowerCase()
      );
    }

    if (titleFilter) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (semesterFilter) {
      result = result.filter(c => c.semester === semesterFilter);
    }

    setFilteredCourses(result);
  };

  return (
    <div className="student-content">
      <h2>Courses Offered</h2>

      {/* ================= SEARCH & FILTER BAR ================= */}
      <div className="course-filter-bar">
        <input
          className="course-filter-input"
          type="text"
          placeholder="Course Code (e.g. CS101)"
          value={codeSearch}
          onChange={(e) => setCodeSearch(e.target.value)}
        />

        <select
            className="course-filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ backgroundColor: "rgb(156,148,148)" }}
          >

          <option value="">Offering Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
        </select>

        <input
          className="course-filter-input"
          type="text"
          placeholder="Course Title"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
        />

        <select
          className="course-filter-select"
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          style={{ backgroundColor: "rgb(156,148,148)" }}
        >
          <option value="">Semester</option>
          <option value="2025-I">2025-I</option>
          <option value="2025-II">2025-II</option>
          <option value="2025-S">2025-S</option>
        </select>

        <button
          className="course-search-btn"
          onClick={handleSearch}
          title="Search"
          style={{backgroundColor:"#3EBB9E"}}
        >
          🔍
        </button>
      </div>

      {/* ================= COURSE LIST ================= */}
      <div className="courses-list">
        {filteredCourses.length === 0 && <p>No courses found.</p>}

        {filteredCourses.map(course => (
          <div
            key={`${course.course_id}-${course.semester}-${course.instructor_name}`}
            className="course-card"
            onClick={() => setSelectedCourse(course)}
          >
            <strong>{course.course_id}</strong> — {course.title}

            <div className="course-meta">
              <div><b>Semester:</b> {course.semester}</div>
              <div><b>Instructor:</b> {course.instructor_name}</div>
              <div><b>Department:</b> {course.department}</div>
              <div><b>L-P-T-S-C:</b> {course.ltpsc ?? "NA"}</div>

              {/* 🔹 ELIGIBILITY */}
              <div>
                <b>Eligibility:</b>{" "}
                {course.eligibility && course.eligibility.length > 0 ? (
                  course.eligibility.map((e, idx) => (
                    <span key={idx} className="eligibility-badge">
                      {e.branch} ({e.entry_year})
                    </span>
                  ))
                ) : (
                  <span className="eligibility-none">Not specified</span>
                )}
              </div>
            </div>
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