import { useEffect, useState } from "react";

export default function StudentRecord() {
  const studentId = localStorage.getItem("userId");
  const [record, setRecord] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecord() {
      const res = await fetch(
        `http://localhost:5001/student/${studentId}/record`
      );
      const data = await res.json();

      if (res.ok) {
        setRecord(data);
      } else {
        console.error(data.error);
      }

      setLoading(false);
    }

    if (studentId) fetchRecord();
  }, [studentId]);

  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Student Record</h2>

      {Object.keys(record).length === 0 && (
        <p>No courses taken yet.</p>
      )}

      {Object.entries(record).map(([semester, courses]) => (
        <div key={semester} style={{ marginTop: "30px" }}>
          <h3>{semester}</h3>

          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Course Code</th>
                <th style={th}>Title</th>
                <th style={th}>Credits</th>
                <th style={th}>Department</th>
                <th style={th}>Status</th>
                <th style={th}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.course_id}>
                  <td style={td}>{course.course_id}</td>
                  <td style={td}>{course.title}</td>
                  <td style={td}>{course.credits}</td>
                  <td style={td}>{course.department}</td>
                  <td style={td}>{course.status}</td>
                  <td style={td}>{course.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px"
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
