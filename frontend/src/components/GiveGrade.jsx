import { useEffect, useState } from "react";

const grades = ["A", "A-", "B", "B-", "C", "C-", "D", "E", "F"];

export default function GiveGrade({ courseId, onClose }) {
  const [students, setStudents] = useState([]);

  const fetchEnrolled = async () => {
    const res = await fetch(
      `http://localhost:5000/instructor/course/${courseId}/enrolled`
    );
    const data = await res.json();

    if (res.ok) setStudents(data);
    else console.error(data.error);
  };

  useEffect(() => {
    fetchEnrolled();
  }, [courseId]);

  const submitGrade = async (studentId, grade) => {
    const res = await fetch(
      `http://localhost:5000/instructor/course/${courseId}/grade`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, grade })
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }

    fetchEnrolled();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Grade Assignment</h3>
      <button onClick={onClose}>Close</button>

      <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roll Number</th>
            <th>Grade</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students.map(s => (
            <GradeRow
              key={s.student_id}
              student={s}
              onSubmit={submitGrade}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
function GradeRow({ student, onSubmit }) {
  const [grade, setGrade] = useState(student.grade || "");
  const [isEditing, setIsEditing] = useState(!student.grade);

  const handleSubmit = () => {
    if (!grade) {
      alert("Please select a grade");
      return;
    }

    onSubmit(student.student_id, grade);
    setIsEditing(false);
  };

  return (
    <tr>
      <td>{student.name}</td>
      <td>{student.email}</td>
        <td>{student.roll_no}</td>

      {/* GRADE COLUMN */}
      <td>
        {isEditing ? (
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option value="">Select</option>
            {["A", "A-", "B", "B-", "C", "C-", "D", "E", "F"].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        ) : (
          grade
        )}
      </td>

      {/* ACTION COLUMN */}
      <td>
        {isEditing ? (
          <button onClick={handleSubmit}>
            Submit
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)}>
            Update
          </button>
        )}
      </td>
    </tr>
  );
}
