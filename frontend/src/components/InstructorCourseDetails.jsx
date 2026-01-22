import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import GiveGrade from "./GiveGrade";
import "./public/InstructorCourseDetails.css"

export default function InstructorCourseDetails() {
  const { courseId } = useParams();
  const location = useLocation();
  const course = location.state;
  const navigate = useNavigate();


  const [requests, setRequests] = useState([]);
  const [showGrade, setShowGrade] = useState(false);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState({});

  const handleApproveAllClick = () => {
  const initialSelection = {};
  requests.forEach(req => {
    initialSelection[req.student_id] = true;
  });
  setSelectedStudents(initialSelection);
  setBulkMode(true);
  };

  const toggleStudent = (studentId) => {
  setSelectedStudents(prev => ({
    ...prev,
    [studentId]: !prev[studentId]
  }));
};

const submitBulkApprove = async () => {
  const approvedIds = Object.keys(selectedStudents).filter(
    id => selectedStudents[id]
  );

  if (approvedIds.length === 0) {
    alert("No students selected");
    return;
  }

  const res = await fetch(
    `http://localhost:5001/instructor/course/${courseId}/approve-bulk`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds: approvedIds })
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  setBulkMode(false);
  setSelectedStudents({});
  fetchRequests();
};



  const fetchRequests = async () => {
    const res = await fetch(
      `http://localhost:5001/instructor/course/${courseId}/requests`
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
      `http://localhost:5001/instructor/course/${courseId}/approve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }

    fetchRequests();
  };

  const handleReject = async (studentId) => {
    const res = await fetch(
      `http://localhost:5001/instructor/course/${courseId}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }

    fetchRequests();
  };

  return (
    <div className="course-details-container">
      <div className="top-actions">
        <button
          className="give-grade-btn"
          onClick={() => navigate("/instructor")}
        >
          Home
        </button>
        <button
          className="give-grade-btn"
          onClick={() =>
            navigate(`/instructor/course/${courseId}/edit`, {
              state: course
            })
          }
        >
          Edit Course
        </button>

        <button
          className="give-grade-btn"
          onClick={() => setShowGrade(true)}
        >
          Give Grade
        </button>
        <button
          className="give-grade-btn"
          onClick={handleApproveAllClick}
          disabled={requests.length === 0}
        >
          Approve All
        </button>

        {bulkMode && (
          <button
            className="give-grade-btn"
            onClick={submitBulkApprove}
          >
            Submit Approval
          </button>
        )}

      </div>

      <h2>
        {course.course_id} – {course.title}
      </h2>

      <p><strong>Credits:</strong> {course.credits}</p>
      <p><strong>Semester:</strong> {course.semester}</p>

      {showGrade && (
        <GiveGrade
          courseId={courseId}
          onClose={() => setShowGrade(false)}
        />
      )}

      <hr />

      <h3>Pending Enrollment Requests</h3>

      {requests.length === 0 && <p>No pending requests</p>}

      {requests.length > 0 && (
        <table className="requests-table">
          <thead>
            <tr>
              {bulkMode && <th>Select</th>}
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Email</th>
              <th>Department</th>
              <th>Year</th>
              {!bulkMode && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {requests.map(req => (
              <tr key={req.student_id}>
                {bulkMode && (
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedStudents[req.student_id]}
                      onChange={() => toggleStudent(req.student_id)}
                    />
                  </td>
                )}

                <td>{req.name}</td>
                <td>{req.roll_no}</td>
                <td>{req.email}</td>
                <td>{req.department}</td>
                <td>{req.email.substring(0, 4)}</td>

                {!bulkMode && (
                  <td className="action-cell">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(req.student_id)}
                    >
                      Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => handleReject(req.student_id)}
                    >
                      Reject
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
}
