import { useState } from "react";

export default function Course_Form({ onClose,onCourseAdded }) {
  const [courseTitle, setCourseTitle] = useState("");
  const [credits, setCredits] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");
  const [course_id, setCourseId] = useState("");

  const handleSubmit = async () => {
  const instructorId = localStorage.getItem("userId");

  if (!courseTitle || !course_id||!credits || !semester || !department) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5001/instructor/add-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: courseTitle,
        course_id,
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
    setCourseId("");
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
        type="text"
        placeholder="Course Code"
        value={course_id}
        onChange={(e) => setCourseId(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <input
        type="number"
        placeholder="Credits"
        value={credits}
        onChange={(e) => setCredits(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <select
    value={semester}
    onChange={(e) => setSemester(e.target.value)}
    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
  >
    <option value="" disabled>Select Semester</option>
    <option value="2025-I">2025-I</option>
    <option value="2025-II">2025-II</option>
    <option value="2025-S">2025-S</option>
  </select>

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
