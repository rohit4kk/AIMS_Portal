import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./public/FacultyAdvisor.css";

export default function FacultyAdvisor() {
  const faId = localStorage.getItem("userId");

  const [advisor, setAdvisor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentRecord, setStudentRecord] = useState(null);

  const [view, setView] = useState("APPROVALS");

  // 🔽 BULK STATES
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkDecision, setBulkDecision] = useState(null);
  const [selected, setSelected] = useState({});

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  if (!faId) return <p>Unauthorized</p>;

  /* ================= FETCH ================= */

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
  const fetchStudentRecord = async (studentId) => {
    const res = await fetch(
      `http://localhost:5001/student/${studentId}/record`
    );
    const data = await res.json();
    if (res.ok) setStudentRecord(data);
  };


  useEffect(() => {
    fetchAdvisor();
    if (view === "APPROVALS") fetchRequests();
    if (view === "STUDENTS") fetchStudents();
    if (view === "HISTORY") fetchHistory();
  }, [view]);

  /* ================= SINGLE DECISION ================= */

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

  /* ================= BULK START ================= */

  const startBulk = (decision) => {
  // If already in bulk mode with SAME decision → close it
  if (bulkMode && bulkDecision === decision) {
    setBulkMode(false);
    setBulkDecision(null);
    setSelected({});
    return;
  }

  // Otherwise open bulk mode
  const init = {};
  requests.forEach(r => {
    init[`${r.student_id}-${r.course_id}`] = true;
  });

  setSelected(init);
  setBulkDecision(decision);
  setBulkMode(true);
};

  /* ================= BULK SUBMIT ================= */

  const submitBulk = async () => {
    const chosen = requests.filter(
      r => selected[`${r.student_id}-${r.course_id}`]
    );

    if (chosen.length === 0) {
      alert("No entries selected");
      return;
    }

    await fetch("http://localhost:5001/fa/decision-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: bulkDecision,
        requests: chosen.map(r => ({
          student_id: r.student_id,
          course_id: r.course_id,
          semester: r.semester
        }))
      })
    });

    setBulkMode(false);
    setBulkDecision(null);
    setSelected({});
    fetchRequests();
  };

  return (
    <div className="fa-scope">

      {/* ===== NAV BAR ===== */}
      <nav className="fa-nav-bar">
        {/* LEFT */}
        <div className="fa-left">
          <h2>AIMS</h2>

          {/* DESKTOP NAV */}
          <div className="desktop-only">
            <button className="view-btn" onClick={() => setView("APPROVALS")}>
              Home
            </button>
            <button className="view-btn" onClick={() => setView("STUDENTS")}>
              My Students
            </button>
            <button className="view-btn" onClick={() => setView("HISTORY")}>
              History
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="fa-right">
          <button className="logout-btn desktop-only" onClick={handleLogout}>
            Logout
          </button>

          <div
            className="hamburger mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="mobile-menu">
            <button onClick={() => { setView("APPROVALS"); setMenuOpen(false); }}>
              Home
            </button>
            <button onClick={() => { setView("STUDENTS"); setMenuOpen(false); }}>
              My Students
            </button>
            <button onClick={() => { setView("HISTORY"); setMenuOpen(false); }}>
              History
            </button>
            <hr />
            <button className="logout-mobile" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>


      <div style={{padding:"15px"}}>
        {/* ===== APPROVALS ===== */}
        {view === "APPROVALS" && (
          <>
            <h2>{advisor ? `Welcome ${advisor.name}` : "Loading..."}</h2>

            <div className="bulk-actions">
              <button
                className="approve-btn"
                disabled={requests.length === 0}
                onClick={() => startBulk("APPROVE")}
              >
                Accept All
              </button>

              <button
                className="reject-btn"
                disabled={requests.length === 0}
                onClick={() => startBulk("REJECT")}
              >
                Reject All
              </button>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {bulkMode && <th>Select</th>}
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map(req => {
                    const key = `${req.student_id}-${req.course_id}`;
                    return (
                      <tr key={key}>
                        {bulkMode && (
                          <td>
                            <input
                              type="checkbox"
                              checked={!!selected[key]}
                              onChange={() =>
                                setSelected(prev => ({
                                  ...prev,
                                  [key]: !prev[key]
                                }))
                              }
                            />
                          </td>
                        )}

                        <td>{req.students.name}</td>
                        <td>{req.students.roll_no}</td>
                        <td>{req.courses.title}</td>
                        <td>{req.semester}</td>

                        <td>
                          {!bulkMode && (
                            <>
                              <button onClick={() => handleDecision(req, "APPROVE")} style={{backgroundColor:"#2e7d32"}}>
                                Approve
                              </button>
                              <button onClick={() => handleDecision(req, "REJECT")} style={{backgroundColor: "#c62828"}}>
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {bulkMode && (
              <button
                className="approve-btn"
                style={{ marginTop: "16px" }}
                onClick={submitBulk}
              >
                Submit
              </button>
            )}
          </>
        )}

        {/* ===== STUDENTS ===== */}
        {view === "STUDENTS" && (
          <>
            <div className="students-scroll-container">
            {!selectedStudent && (
              <table style={table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr
                      key={s.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedStudent(s);
                        fetchStudentRecord(s.id);
                      }}
                    >
                      <td>{s.name}</td>
                      <td>{s.roll_no}</td>
                      <td>{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedStudent && (
              <>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentRecord(null);
                  }}
                >
                  ← Back
                </button>

                <h3>{selectedStudent.name} – Course Record</h3>

                {!studentRecord && <p>Loading...</p>}

                {studentRecord &&
                  Object.entries(studentRecord).map(([semester, courses]) => (
                    <div key={semester} style={{ marginBottom: "20px" }}>
                      <h4>{semester}</h4>

                      <table style={table}>
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Credits</th>
                            <th>Status</th>
                            <th>Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map(c => (
                            <tr key={c.course_id}>
                              <td>{c.course_id} – {c.title}</td>
                              <td>{c.credits}</td>
                              <td>{c.status}</td>
                              <td>{c.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
              </>
            )}
            </div>
          </>
        )}


        {/* ===== HISTORY ===== */}
        {view === "HISTORY" && (
          <table style={table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Decision</th>
              </tr>
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
    </div>
  );
}

const table = { width: "100%", borderCollapse: "collapse" };
