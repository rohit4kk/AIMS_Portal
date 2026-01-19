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


    const handleEnroll = async () => {
    const res = await fetch(
        `http://localhost:5001/courses/${course.course_id}/enroll`,
        {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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

    // Refresh requests list
    fetchRequests();
    };


    useEffect(() => {
    

    if (course) fetchRequests();
  }, [course]);

  if (!course) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>{course.course_id} – {course.title}</h2>
          <button onClick={onClose}>X</button>
          
        </div>

        {/* COURSE DETAILS */}
        <p><strong>Credits:</strong> {course.credits}</p>
        <p><strong>Department:</strong> {course.department}</p>

        <button onClick={handleEnroll} style={{ marginTop: "10px" }}>
         Enroll
        </button>


        <hr style={{ margin: "20px 0" }} />

        {/* REQUESTS TABLE */}
        <h3>Enrollment Requests</h3>

        {loading && <p>Loading requests...</p>}

        {!loading && requests.length === 0 && (
          <p>No enrollment requests yet.</p>
        )}

        {!loading && requests.length > 0 && (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Student Name</th>
                <th style={th}>Roll Number</th>
                <th style={th}>Email</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
                <tr key={index}>
                  <td style={td}>{req.name}</td>
                  <td style={td}>{req.roll_no}</td>
                  <td style={td}>{req.email}</td>
                  <td style={td}>{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* STYLES */
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modal = {
  backgroundColor: "grey",
  padding: "30px",
  width: "700px",
  maxHeight: "80vh",
  overflowY: "auto",
  borderRadius: "8px"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px"
};

const th = {
  border: "1px solid #ccc",
  padding: "8px",
  backgroundColor: "black"
};

const td = {
  border: "1px solid #ccc",
  padding: "8px"
};
