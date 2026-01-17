import { useState } from "react";

export default function Course_Form({ onClose,onCourseAdded }) {
  const [courseTitle, setCourseTitle] = useState("");
  const [credits, setCredits] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");

  const handleSubmit = async () => {
  const instructorId = localStorage.getItem("userId");

  if (!courseTitle || !credits || !semester || !department) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/instructor/add-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: courseTitle,
        credits,
        semester,
        department,
        instructorId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add course");
      return;
    }

    console.log("Course created with ID:", data.course_id);

    onCourseAdded();

    // Clear form
    setCourseTitle("");
    setCredits("");
    setSemester("");
    setDepartment("");

    // Close form
    onClose();
  } catch (err) {
    console.error("Error adding course:", err);
    alert("Server error");
  }
    };


  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        border: "1px solid #ccc",
        maxWidth: "400px"
      }}
    >
      <h3>Add New Course</h3>

      <input
        type="text"
        placeholder="Course Title"
        value={courseTitle}
        onChange={(e) => setCourseTitle(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <input
        type="number"
        placeholder="Credits"
        value={credits}
        onChange={(e) => setCredits(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <input
        type="text"
        placeholder="Semester (e.g. Sem 5)"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <input
        type="text"
        placeholder="Department Offering"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
