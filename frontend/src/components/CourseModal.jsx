import { useEffect, useState } from "react";

export default function CourseModal({ course, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = localStorage.getItem("userId");


  const fetchRequests = async () => {
    setLoading(true);

    const res = await fetch(
      `http://localhost:5001/courses/${course.course_id}/requests`
    );
    const data = await res.json();

    if (res.ok) {
      setRequests(data);
    } else {
      console.error(data.error);
    }

    setLoading(false);
  };

  console.log("studentId from localStorage:", studentId, typeof studentId);

requests.forEach((req, i) => {
  console.log(
    `req[${i}].student_id:`,
    req.student_id,
    typeof req.student_id
  );
});

  const myRequest = requests.find(
  (req) => req.student_id === studentId);

  const handleEnroll = async () => {
    const res = await fetch(
      `http://localhost:5001/courses/${course.course_id}/enroll`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          semester: course.semester
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    fetchRequests();
  };

  const handleDrop = async () => {
  const res = await fetch(
    `http://localhost:5001/courses/${course.course_id}/drop`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ studentId })
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  // Refresh requests list
  fetchRequests();
};


  useEffect(() => {
    if (course) fetchRequests();
  }, [course]);

  if (!course) return null;

  const canDrop =
  myRequest && 
  ["ENROLLED", "PENDING_INSTRUCTOR_APPROVAL", "PENDING_ADVISOR_APPROVAL"]
    .includes(myRequest.status);

  


  return (
    <div className="course-modal-overlay">
      <div className="course-modal">
        {/* HEADER */}
        <div className="course-modal-header">
          <h2>
            {course.course_id} – {course.title}
          </h2>
          <button className="course-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* DETAILS */}
        <p><strong>Credits:</strong> {course.credits}</p>
        <p><strong>Department:</strong> {course.department}</p>

        {canDrop ? (
          <button
            onClick={handleDrop}
            style={{
              marginTop: "10px",
              backgroundColor: "#ff4d4d",
              color: "white"
            }}
          >
            Drop
          </button>
        ) : (
          <button onClick={handleEnroll} style={{ marginTop: "10px" }}>
            Enroll
          </button>
        )}
        

        <hr style={{ margin: "20px 0", borderColor: "#333" }} />

        {/* REQUESTS */}
        <h3>Enrollment Requests</h3>

        {loading && <p>Loading requests...</p>}

        {!loading && requests.length === 0 && (
          <p>No enrollment requests yet.</p>
        )}

        {!loading && requests.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
                <tr key={index}>
                  <td>{req.name}</td>
                  <td>{req.roll_no}</td>
                  <td>{req.email}</td>
                  <td>{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}