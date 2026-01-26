import { useState, useRef } from "react";
import Papa from "papaparse";
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

  // CSV states
  const [csvData, setCsvData] = useState([]);
  const [csvSuccess, setCsvSuccess] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     SINGLE STUDENT SUBMIT
     ========================= */
  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.department ||
      !form.year ||
      !form.roll_no ||
      !form.fa_email
    ) {
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
        setSuccess(data.message || "Student added successfully");
        setForm(initialState);
      } else {
        setError(data.error || "Failed to add student");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CSV FILE SELECT
     ========================= */
  const handleCSVSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvErrors([]);
    setCsvSuccess([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((s) => ({
          name: s.name?.trim(),
          email: s.email?.trim(),
          department: s.department?.trim(),
          year: Number(s.year),
          roll_no: s.roll_no?.trim(),
          fa_email: s.fa_email?.trim()
        }));

        setCsvData(parsed);
      }
    });
  };

  /* =========================
     CSV IMPORT CLICK
     ========================= */
  const handleCSVImport = async () => {
    if (csvData.length === 0) {
      setError("No CSV data to import");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5001/admin/import-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: csvData })
      });

      const data = await res.json();

      if (res.ok) {
        setCsvSuccess(data.success || []);
        setCsvErrors(data.errors || []);

        // ✅ CLEAR CSV PREVIEW + FILE INPUT
        setCsvData([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError("CSV import failed");
      }
    } catch {
      setError("Network error during CSV import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Add New Student</h2>
          <p className="form-subtitle">
            Add students manually or import from CSV
          </p>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* ================= CSV IMPORT ================= */}
        <div className="form-group">
          <label>Import Students from CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVSelect}
            ref={fileInputRef}
          />
        </div>

        {csvData.length > 0 && (
          <>
            <div className="form-group">
              <p>Preview ({csvData.length} students)</p>
            </div>

            <div className="form-group">
              <button
                className="btn btn-primary"
                onClick={handleCSVImport}
                disabled={loading}
              >
                {loading ? "Importing..." : "Import Students"}
              </button>
            </div>
          </>
        )}

        {csvSuccess.length > 0 && (
          <div className="alert alert-success">
            Successfully inserted: {csvSuccess.length}
          </div>
        )}

        {csvErrors.length > 0 && (
          <div className="alert alert-error">
            <strong>Failed entries:</strong>
            <ul>
              {csvErrors.map((e, i) => (
                <li key={i}>
                  Row {e.row}: {e.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ================= SINGLE STUDENT FORM ================= */}
        <div className="form-content">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              value={form.department}
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
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="roll_no">Roll No</label>
              <input
                id="roll_no"
                name="roll_no"
                value={form.roll_no}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fa_email">Faculty Advisor Email</label>
            <input
              id="fa_email"
              name="fa_email"
              value={form.fa_email}
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
