import { useEffect, useState } from "react";

const gradePoints = {
  "A": 10,
  "A-": 9,
  "B": 8,
  "B-": 7,
  "C": 6,
  "C-": 5,
  "D": 4,
  "E": 2,
  "F": 0
};

export default function StudentRecord() {
  const studentId = localStorage.getItem("userId");
  const [record, setRecord] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecord() {
      try {
        const res = await fetch(
          `http://localhost:5001/student/${studentId}/record`
        );
        const data = await res.json();

        if (res.ok) setRecord(data);
        else console.error(data.error);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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

      {Object.entries(record).map(([semester, courses]) => {
        let totalCredits = 0;
        let weightedSum = 0;

        courses.forEach(c => {
          if (gradePoints[c.grade] !== undefined) {
            totalCredits += c.credits;
            weightedSum += gradePoints[c.grade] * c.credits;
          }
        });

        const sgpa =
          totalCredits > 0
            ? (weightedSum / totalCredits).toFixed(2)
            : "NA";

        return (
          <div key={semester} className="semester-block">
            {/* SEMESTER HEADER */}
            <div className="semester-header">
              <h3>{semester}</h3>

              <div className="semester-stats">
                <span>Total Credits: {totalCredits}</span>
                <span>SGPA: {sgpa}</span>
              </div>
            </div>

            {/* TABLE */}
            <div className="table-scroll">
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
                      <td className="course-code">{course.course_id}</td>
                      <td className="course-title">{course.title}</td>
                      <td>{course.credits}</td>
                      <td>{course.department}</td>

                      <td
                        className={`status ${course.status.toLowerCase()}`}
                      >
                        {course.status}
                      </td>

                      <td className="grade">{course.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
