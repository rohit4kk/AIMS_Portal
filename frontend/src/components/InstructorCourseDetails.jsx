import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

export default function InstructorCourseDetails() {
  const { courseId } = useParams();
  const location = useLocation();
  const course = location.state;

  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await fetch(
      `http://localhost:5000/instructor/course/${courseId}/requests`
    );
    const data = await res.json();

    if (res.ok) {
      setRequests(data);
    } else {
      console.error(data.error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [courseId]);

  const handleApprove = async (studentId) => {
    const res = await fetch(
      `http://localhost:5000/instructor/course/${courseId}/approve`,
      {
        method: "POST",
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

    // refresh pending list
    fetchRequests();
  };

  const handleReject = async (studentId) => {
  const res = await fetch(
    `http://localhost:5000/instructor/course/${courseId}/reject`,
    {
      method: "POST",
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

  // refresh pending list
  fetchRequests();
};


  return (
    <div style={{ padding: "40px" }}>
      <h2>
        {course.course_id} – {course.title}
      </h2>

      <p><strong>Credits:</strong> {course.credits}</p>
      <p><strong>Semester:</strong> {course.semester}</p>

      <hr />

      <h3>Pending Enrollment Requests</h3>

      {requests.length === 0 && <p>No pending requests</p>}

      {requests.length > 0 && (
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Student Name</th>
              <th style={th}>Email</th>
              <th style={th}>Department</th>
              <th style={th}>Year</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.student_id}>
                <td style={td}>{req.name}</td>
                <td style={td}>{req.email}</td>
                <td style={td}>{req.department}</td>
                <td style={td}>{req.email.substring(0, 4)}</td>
                <td style={td}>
                <button
                    onClick={() => handleApprove(req.student_id)}
                    style={{ marginRight: "10px" }}
                >
                    Approve
                </button>

                <button
                    onClick={() => handleReject(req.student_id)}
                    style={{ backgroundColor: "#ff4d4d", color: "white" }}
                >
                    Reject
                </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "15px"
};

const th = {
  border: "1px solid #ccc",
  padding: "10px",
  backgroundColor: "grey"
};

const td = {
  border: "1px solid #ccc",
  padding: "10px"
};
