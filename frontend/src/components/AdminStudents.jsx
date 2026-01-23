import { useEffect, useState } from "react";
import "./public/AdminStudents.css";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5001/admin/students");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  return (
    <div className="admin-table-page">
      <div className="page-header">
        <h2>Students Management</h2>
        <p className="students-count">Total Students: {students.length}</p>
      </div>

      {loading && <div className="loading-message">Loading students...</div>}
      {error && <div className="error-message">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="table-wrapper">
          {students.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.email || student.id}>
                    <td data-label="Name">{student.name}</td>
                    <td data-label="Email">{student.email}</td>
                    <td data-label="Roll No">{student.roll_no}</td>
                    <td data-label="Department">{student.department}</td>
                    <td data-label="Year">{student.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">No students found</div>
          )}
        </div>
      )}
    </div>
  );
}