import { useState, useEffect } from "react";
import "./public/Course_Form.css";

export default function Course_Form({ onClose, onCourseAdded }) {
  const [courseId, setCourseId] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [semester, setSemester] = useState("");

  // 🔹 SLOT STATES (NEW)
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState("");

  // ELIGIBILITY STATES
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [eligibility, setEligibility] = useState([]);

  const instructorId = localStorage.getItem("userId");

  /* =======================
     FETCH SLOTS (NEW)
     ======================= */
  useEffect(() => {
    fetch("http://localhost:5001/slots")
      .then(res => res.json())
      .then(data => setSlots(data))
      .catch(err => {
        console.error(err);
        alert("Failed to load slots");
      });
  }, []);

  /* =======================
     COURSE AUTOCOMPLETE
     ======================= */
  const searchCourses = async (prefix) => {
    setCourseId(prefix);

    if (prefix.length < 2) {
      setSuggestions([]);
      return;
    }

    const res = await fetch(
      `http://localhost:5001/instructor/search-courses?prefix=${prefix}`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setCourseId(course.course_id);
    setSuggestions([]);
  };

  /* =======================
     ELIGIBILITY HANDLERS
     ======================= */
  const addEligibility = () => {
    if (!branch || !year) {
      alert("Select branch and year");
      return;
    }

    const exists = eligibility.some(
      (e) => e.branch === branch && e.entry_year === Number(year)
    );

    if (exists) {
      alert("This eligibility already exists");
      return;
    }

    setEligibility([
      ...eligibility,
      { branch, entry_year: Number(year) }
    ]);

    setBranch("");
    setYear("");
  };

  const removeEligibility = (index) => {
    setEligibility(eligibility.filter((_, i) => i !== index));
  };

  /* =======================
     SUBMIT
     ======================= */
  const handleSubmit = async () => {
    if (!selectedCourse || !semester || !slot || eligibility.length === 0) {
      alert("Please select course, semester, slot and eligibility");
      return;
    }

    // 1️⃣ ADD COURSE OFFERING (slot added)
    const res = await fetch("http://localhost:5001/instructor/add-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: selectedCourse.course_id,
        instructorId,
        semester,
        slot
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add course");
      return;
    }

    // 2️⃣ ADD ELIGIBILITY
    await fetch("http://localhost:5001/instructor/add-course-eligibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: selectedCourse.course_id,
        semester,
        eligibility
      })
    });

    onCourseAdded();
    onClose();
  };

  return (
    <div className="course-form">
      <h3>Add Course Offering</h3>

      {/* COURSE SEARCH */}
      <div className="course-search-wrapper">
        <input
          type="text"
          placeholder="Enter Course Code"
          value={courseId}
          onChange={(e) => searchCourses(e.target.value)}
          className="course-input"
        />

        {suggestions.length > 0 && (
          <ul className="course-suggestions">
            {suggestions.map((c) => (
              <li
                key={c.course_id}
                onClick={() => handleSelectCourse(c)}
                className="course-suggestion-item"
              >
                <strong>{c.course_id}</strong> — {c.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* SEMESTER */}
      <select
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        className="semester-select"
      >
        <option value="">Select Semester</option>
        <option value="2025-I">2025-I</option>
        <option value="2025-II">2025-II</option>
        <option value="2025-S">2025-S</option>
      </select>

      {/* SLOT (NEW) */}
      <select
        value={slot}
        onChange={(e) => setSlot(e.target.value)}
        className="slot-select"
      >
        <option value="">Select Slot</option>
        {slots.map(s => (
          <option key={s.slot_code} value={s.slot_code}>
            {s.slot_code} — {s.description}
          </option>
        ))}
      </select>

      {/* ELIGIBILITY SECTION */}
      <div className="eligibility-section">
        <h4>Course Eligibility</h4>

        <div className="eligibility-inputs">
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">Branch</option>
            <option value="All">All</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>

          <input
            type="number"
            placeholder="Year (e.g. 2023)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="1"
          />

          <button className="add-btn" onClick={addEligibility}>✓</button>
        </div>

        {eligibility.length > 0 && (
          <table className="eligibility-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Year</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {eligibility.map((e, index) => (
                <tr key={index}>
                  <td>{e.branch}</td>
                  <td>{e.entry_year}</td>
                  <td>
                    <button onClick={() => removeEligibility(index)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ACTIONS */}
      <div className="course-form-actions">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
