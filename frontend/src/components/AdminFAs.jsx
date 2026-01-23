import { useEffect, useState } from "react";
import "./public/AdminFAs.css";

export default function AdminFAs() {
  const [fas, setFAs] = useState([]);
  const [dept, setDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFAs();
  }, [dept]);

  const fetchFAs = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5001/admin/fas?department=${dept}`
      );
      if (!res.ok) throw new Error("Failed to fetch faculty advisors");
      const data = await res.json();
      setFAs(data);
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
        <h2>Faculty Advisors Management</h2>
        <p className="count-badge">Total Faculty Advisors: {fas.length}</p>
      </div>

      <div className="filter-section">
        <input
          className="filter-input"
          placeholder="🔍 Filter by Department"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        />
      </div>

      {loading && <div className="loading-message">Loading faculty advisors...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <div className="table-wrapper">
          {fas.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {fas.map((f) => (
                  <tr key={f.email}>
                    <td data-label="Name">{f.name}</td>
                    <td data-label="Email">{f.email}</td>
                    <td data-label="Department">{f.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">
              No faculty advisors found {dept && `in ${dept} department`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
