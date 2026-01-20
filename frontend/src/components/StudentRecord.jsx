import { useEffect, useState } from "react";

export default function StudentRecord() {
  const studentId = localStorage.getItem("userId");
  const [record, setRecord] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecord() {
      const res = await fetch(
        `http://localhost:5000/student/${studentId}/record`
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

  if (loading) {
    return <div className="student-content">Loading...</div>;
  }

  return (
    <div className="student-content">
      <h2>Student Record</h2>

      {Object.keys(record).length === 0 && (
        <p>No courses taken yet.</p>
      )}

      {Object.entries(record).map(([semester, courses]) => (
        <div key={semester} style={{ marginTop: "30px" }} className="table-scroll">
          <h3>{semester}</h3>

          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Title</th>
                <th>Credits</th>
                <th>Department</th>
                <th>Status</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.course_id}>
                  <td>{course.course_id}</td>
                  <td>{course.title}</td>
                  <td>{course.credits}</td>
                  <td>{course.department}</td>
                  <td>{course.status}</td>
                  <td>{course.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
