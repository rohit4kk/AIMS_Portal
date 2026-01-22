import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./public/FacultyAdvisor.css";

export default function FacultyAdvisor() {
  const faId = localStorage.getItem("userId");

  const [advisor, setAdvisor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("APPROVALS");
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.clear(); // or removeItem("userId")
  navigate("/", { replace: true });
  };

  if (!faId) {
  return <p>Unauthorized</p>;
}

  // APPROVALS | STUDENTS | HISTORY

  // ================= FETCH ADVISOR =================
  const fetchAdvisor = async () => {
    const res = await fetch(`http://localhost:5001/fa/${faId}`);
    const data = await res.json();
    if (res.ok) setAdvisor(data);
  };

  const fetchRequests = async () => {
    const res = await fetch(`http://localhost:5001/fa/${faId}/requests`);
    const data = await res.json();
    if (res.ok) setRequests(data);
  };

  const fetchStudents = async () => {
    const res = await fetch(`http://localhost:5001/fa/${faId}/students`);
    const data = await res.json();
    if (res.ok) setStudents(data);
  };

  const fetchHistory = async () => {
    const res = await fetch(`http://localhost:5001/fa/${faId}/history`);
    const data = await res.json();
    if (res.ok) setHistory(data);
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    if (!faId) return;

    fetchAdvisor();

    if (view === "APPROVALS") fetchRequests();
    if (view === "STUDENTS") fetchStudents();
    if (view === "HISTORY") fetchHistory();
  }, [faId, view]);

  // ================= DECISION =================
  const handleDecision = async (req, decision) => {
    await fetch("http://localhost:5001/fa/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: req.student_id,
        course_id: req.course_id,
        semester: req.semester,
        decision
      })
    });

    fetchRequests();
  };


  const handleBulkDecision = async (decision) => {
  if (requests.length === 0) return;

  await fetch("http://localhost:5001/fa/decision-bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      decision,
      requests: requests.map(r => ({
        student_id: r.student_id,
        course_id: r.course_id,
        semester: r.semester
      }))
    })
  });

  fetchRequests();
};


  return (
    <div style={{ padding: "40px" }}>
      <h2>{advisor ? `Welcome ${advisor.name}` : "Loading..."}</h2>

      {/* BUTTONS */}
      <div style={{ margin: "20px 0" }}>
        <button className="view-btn" style={btn(view === "APPROVALS")} onClick={() => setView("APPROVALS")}>
          Pending Approvals
        </button>
        <button className="view-btn" style={btn(view === "STUDENTS")} onClick={() => setView("STUDENTS")}>
          My Students
        </button>
        <button className="view-btn" style={btn(view === "HISTORY")} onClick={() => setView("HISTORY")}>
          History
        </button>
        <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
        </button>
      </div>

      {view === "APPROVALS" && (
  <>
    {/* BULK BUTTONS */}
    <div className="bulk-actions">
      <button
        className="approve-btn"
        disabled={requests.length === 0}
        onClick={() => handleBulkDecision("APPROVE")}
      >
        Accept All
      </button>

      <button
        className="reject-btn"
        disabled={requests.length === 0}
        onClick={() => handleBulkDecision("REJECT")}
      >
        Reject All
      </button>
    </div>

    {/* TABLE */}
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Roll No</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {requests.map(req => (
            <tr key={`${req.student_id}-${req.course_id}`}>
              <td>{req.students.name}</td>
              <td>{req.students.roll_no}</td>
              <td>{req.courses.title}</td>
              <td>{req.semester}</td>
              <td>
                <button onClick={() => handleDecision(req, "APPROVE")}>
                  Approve
                </button>
                <button onClick={() => handleDecision(req, "REJECT")}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}



      {/* STUDENTS */}
      {view === "STUDENTS" && (
        <table style={table}>
          <thead>
            <tr><th>Name</th><th>Roll</th><th>Email</th></tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.roll_no}</td>
                <td>{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* HISTORY */}
      {view === "HISTORY" && (
        <table style={table}>
          <thead>
            <tr><th>Student</th><th>Course</th><th>Semester</th><th>Decision</th></tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td>{h.students?.name}</td>
                <td>{h.courses?.title}</td>
                <td>{h.semester}</td>
                <td style={{ color: h.status === "ENROLLED" ? "green" : "red" }}>
                  {h.status === "ENROLLED" ? "APPROVED" : "REJECTED"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const btn = active => ({
  marginRight: "10px",
  padding: "10px",
  background: active ? "black" : "grey",
  color: "white",
  border: "none"
});

const card = { border: "1px solid #ccc", padding: "10px", marginBottom: "10px" };
const table = { width: "100%", borderCollapse: "collapse" };