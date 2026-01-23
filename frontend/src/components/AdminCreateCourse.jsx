import { useState } from "react";
import "./public/AdminCreateCourse.css";

export default function AdminCreateCourse() {
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    credits: "",
    department: "",
    lpts: ""
  });

  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.course_id || !form.title || !form.credits || !form.department || !form.lpts) {
      setAlert({ type: "error", message: "Please fill in all fields" });
      return;
    }

    console.log("FORM BEING SENT:", form);
    const res = await fetch("http://localhost:5001/admin/create-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (res.ok) {
      setAlert({ type: "success", message: "Course created successfully" });
      setForm({ course_id: "", title: "", credits: "", department: "", lpts: "" });
    } else {
      setAlert({ type: "error", message: data.error || "Error creating course" });
    }
  };

  const handleCancel = () => {
    setForm({ course_id: "", title: "", credits: "", department: "", lpts: "" });
    setAlert(null);
  };

  return (
    <div className="admin-create-course-wrapper">
      <div className="admin-create-course-container">
        <div className="admin-create-course-header">
          <h3>Create New Course</h3>
          <p className="admin-create-course-subtitle">Add a new course to the system</p>
        </div>

        {alert && (
          <div className={`alert-box alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <form className="admin-create-course-form">
          <div className="form-group">
            <label>Course Code</label>
            <input
              type="text"
              name="course_id"
              placeholder="E.g. CS101"
              value={form.course_id}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Course Title</label>
            <input
              type="text"
              name="title"
              placeholder="E.g. Data Structures"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Credits</label>
            <input
              type="number"
              name="credits"
              placeholder="E.g. 4"
              value={form.credits}
              onChange={handleChange}
              min="0"
              max="12"
            />
          </div>

          <div className="form-group">
            <label>L-P-T-S-C</label>
            <input
              type="text"
              name="lpts"
              placeholder="E.g. 3-0-0-2-4"
              value={form.lpts}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              placeholder="E.g. Computer Science"
              value={form.department}
              onChange={handleChange}
            />
          </div>

          <div className="admin-create-course-actions">
            <button type="button" className="submit-btn" onClick={handleSubmit}>
              Create Course
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
