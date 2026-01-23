import { useEffect, useState } from "react";
import "./public/AdminInstructors.css";

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [dept, setDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstructors();
  }, [dept]);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5001/admin/instructors?department=${dept}`
      );
      if (!res.ok) throw new Error("Failed to fetch instructors");
      const data = await res.json();
      setInstructors(data);
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
        <h2>Instructors Management</h2>
        <p className="count-badge">Total Instructors: {instructors.length}</p>
      </div>

      <div className="filter-section">
        <input
          className="filter-input"
          placeholder="🔍 Filter by Department"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        />
      </div>

      {loading && <div className="loading-message">Loading instructors...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <div className="table-wrapper">
          {instructors.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((i) => (
                  <tr key={i.email}>
                    <td data-label="Name">{i.name}</td>
                    <td data-label="Email">{i.email}</td>
                    <td data-label="Department">{i.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">
              No instructors found {dept && `in ${dept} department`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
