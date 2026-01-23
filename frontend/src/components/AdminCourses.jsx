import { useEffect, useState } from "react";
import "./public/AdminCourses.css";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/admin/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-table-page">
      <div className="page-header">
        <h2>Courses Management</h2>
        <p className="count-badge">Total Courses: {courses.length}</p>
      </div>

      {loading && <div className="loading-message">Loading courses...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <div className="table-wrapper">
          {courses.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Title</th>
                  <th>Credits</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.course_id}>
                    <td data-label="Course Code">{c.course_id}</td>
                    <td data-label="Title">{c.title}</td>
                    <td data-label="Credits">{c.credits}</td>
                    <td data-label="Department">{c.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">No courses found</div>
          )}
        </div>
      )}
    </div>
  );
}
