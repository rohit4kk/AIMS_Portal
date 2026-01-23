import { useState } from "react";
import "./public/AddStudentForm.css";

const initialState = {
  name: "",
  email: "",
  department: "",
  year: "",
  roll_no: "",
  fa_email: ""
};

export default function AddStudentForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.department || !form.year || !form.roll_no || !form.fa_email) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5001/admin/add-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: Number(form.year)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setForm(initialState);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to add student");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Add New Student</h2>
          <p className="form-subtitle">Fill in the student details below</p>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-content">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              type="text"
              name="name" 
              value={form.name} 
              placeholder="John Doe" 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email"
              name="email" 
              value={form.email} 
              placeholder="student@example.com" 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input 
              id="department"
              type="text"
              name="department" 
              value={form.department} 
              placeholder="Computer Science" 
              onChange={handleChange} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input 
                id="year"
                name="year" 
                value={form.year} 
                type="number" 
                placeholder="1" 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label htmlFor="roll_no">Roll No</label>
              <input 
                id="roll_no"
                type="text"
                name="roll_no" 
                value={form.roll_no} 
                placeholder="2024001" 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fa_email">Faculty Advisor Email</label>
            <input 
              id="fa_email"
              type="email"
              name="fa_email" 
              value={form.fa_email} 
              placeholder="advisor@example.com" 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}
