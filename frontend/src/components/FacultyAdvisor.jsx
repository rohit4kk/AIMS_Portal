import { useEffect, useState } from "react";

export default function FacultyAdvisor() {
  const faId = localStorage.getItem("userId");

  const [advisor, setAdvisor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("APPROVALS");
  // APPROVALS | STUDENTS | HISTORY

  // ================= FETCH ADVISOR =================
  const fetchAdvisor = async () => {
    const res = await fetch(`http://localhost:5000/fa/${faId}`);
    const data = await res.json();
    if (res.ok) setAdvisor(data);
  };

  const fetchRequests = async () => {
    const res = await fetch(`http://localhost:5000/fa/${faId}/requests`);
    const data = await res.json();
    if (res.ok) setRequests(data);
  };

  const fetchStudents = async () => {
    const res = await fetch(`http://localhost:5000/fa/${faId}/students`);
    const data = await res.json();
    if (res.ok) setStudents(data);
  };

  const fetchHistory = async () => {
    const res = await fetch(`http://localhost:5000/fa/${faId}/history`);
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
    await fetch("http://localhost:5000/fa/decision", {
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

  return (
    <div style={{ padding: "40px" }}>
      <h2>{advisor ? `Welcome ${advisor.name}` : "Loading..."}</h2>

      {/* BUTTONS */}
      <div style={{ margin: "20px 0" }}>
        <button style={btn(view === "APPROVALS")} onClick={() => setView("APPROVALS")}>
          Pending Approvals
        </button>
        <button style={btn(view === "STUDENTS")} onClick={() => setView("STUDENTS")}>
          My Students
        </button>
        <button style={btn(view === "HISTORY")} onClick={() => setView("HISTORY")}>
          History
        </button>
      </div>

      {/* APPROVALS */}
      {view === "APPROVALS" &&
        requests.map(req => (
          <div key={`${req.student_id}-${req.course_id}`} style={card}>
            <p><b>{req.students.name}</b> ({req.students.roll_no})</p>
            <p>{req.courses.title} – {req.semester}</p>
            <button onClick={() => handleDecision(req, "APPROVE")}>Approve</button>
            <button onClick={() => handleDecision(req, "REJECT")}>Reject</button>
          </div>
        ))}

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
                <td>{h.students.name}</td>
                <td>{h.courses.title}</td>
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
