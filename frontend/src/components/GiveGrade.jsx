import { useEffect, useState } from "react";
import "./public/GiveGrade.css";
import Papa from "papaparse";


const grades = ["A", "A-", "B", "B-", "C", "C-", "D", "E", "F"];

export default function GiveGrade({ courseId, onClose }) {
  const [students, setStudents] = useState([]);

  const fetchEnrolled = async () => {
    const res = await fetch(
      `http://localhost:5001/instructor/course/${courseId}/enrolled`
    );
    const data = await res.json();

    if (res.ok) setStudents(data);
    else console.error(data.error);
  };


  const handleCSVUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (result) => {
      const rows = result.data;

      const res = await fetch(
        `http://localhost:5001/instructor/course/${courseId}/upload-grades-csv`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("Grades uploaded successfully");
      fetchEnrolled(); // refresh table
    }
  });
};


  useEffect(() => {
    fetchEnrolled();
  }, [courseId]);

  const submitGrade = async (studentId, grade) => {
    const res = await fetch(
      `http://localhost:5001/instructor/course/${courseId}/grade`,
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
    <div className="give-grade-container">
      <div className="give-grade-header">
        <h3>Grade Assignment</h3>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
        <div className="csv-upload">
      <label>
        Upload Grades (CSV):
        <input type="file" accept=".csv" onChange={handleCSVUpload} />
      </label>
    </div>

      <table className="grade-table">
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

  useEffect(() => {
  setGrade(student.grade || "");
  setIsEditing(!student.grade);
}, [student.grade]);


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

      <td>
        {isEditing ? (
          <select
            className="grade-select"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option value="">Select</option>
            {grades.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        ) : (
          grade
        )}
      </td>

      <td>
        {isEditing ? (
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        ) : (
          <button
            className="update-btn"
            onClick={() => setIsEditing(true)}
          >
            Update
          </button>
        )}
      </td>
    </tr>
  );
}
