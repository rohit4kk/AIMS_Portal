import { useState } from "react";
import "./public/AddFAForm.css";

const initialState = {
  name: "",
  email: "",
  department: ""
};

export default function AddFAForm() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.department) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5001/admin/add-fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setForm(initialState);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to add faculty advisor");
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
          <h2>Add New Faculty Advisor</h2>
          <p className="form-subtitle">Fill in the faculty advisor details below</p>
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
              placeholder="Prof. Robert Johnson" 
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
              placeholder="fa@example.com" 
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
        </div>

        <div className="form-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Faculty Advisor"}
          </button>
        </div>
      </div>
    </div>
  );
}
