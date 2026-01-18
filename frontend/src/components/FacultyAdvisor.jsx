import { useEffect, useState } from "react";

export default function FacultyAdvisor() {
  const [advisor, setAdvisor] = useState(null);
  const [requests, setRequests] = useState([]);

  const faId = localStorage.getItem("userId");

  // Fetch Faculty Advisor details
  useEffect(() => {
    async function fetchAdvisor() {
      const res = await fetch(`http://localhost:5000/fa/${faId}`);
      const data = await res.json();

      if (res.ok) setAdvisor(data);
      else console.error(data.error);
    }

    if (faId) fetchAdvisor();
  }, [faId]);

  // Fetch pending requests
  const fetchRequests = async () => {
    const res = await fetch(
      `http://localhost:5000/fa/${faId}/requests`
    );
    const data = await res.json();

    if (res.ok) setRequests(data);
    else console.error(data.error);
  };

  useEffect(() => {
    if (faId) fetchRequests();
  }, [faId]);

  // Handle approve/reject
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

    fetchRequests(); // refresh list
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>
        {advisor ? `Welcome ${advisor.name}` : "Loading..."}
      </h2>

      <h1 style={{ marginTop: "40px" }}>
        Pending Enrollment Approvals
      </h1>

      {requests.length === 0 && <p>No pending requests</p>}

      {requests.map((req, index) => (
        <div
          key={`${req.student_id}-${req.course_id}`}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px"
          }}
        >
          <p><b>Student:</b> {req.students.name}</p>
          <p><b>Roll Number:</b> {req.students.roll_no}</p>
          <p><b>Course:</b> {req.courses.title}</p>
          <p><b>Semester:</b> {req.semester}</p>

          <button
            onClick={() => handleDecision(req, "APPROVE")}
            style={{ marginRight: "10px" }}
          >
            Approve
          </button>

          <button
            onClick={() => handleDecision(req, "REJECT")}
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}