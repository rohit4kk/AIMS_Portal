import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./public/Course_Form.css";

export default function EditCourse() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const course = location.state;

  const [semester, setSemester] = useState(course.semester);

  // eligibility
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [eligibility, setEligibility] = useState([]);

  /* ======================
     FETCH EXISTING ELIGIBILITY
     ====================== */
  useEffect(() => {
    async function fetchEligibility() {
      const res = await fetch(
        `http://localhost:5001/instructor/course/${courseId}/eligibility`
      );
      const data = await res.json();

      if (res.ok) {
        setEligibility(data);
      } else {
        console.error(data.error);
      }
    }

    fetchEligibility();
  }, [courseId]);

  /* ======================
     ELIGIBILITY HANDLERS
     ====================== */
  const addEligibility = () => {
    if (!branch || !year) {
      alert("Enter branch and year");
      return;
    }

    const exists = eligibility.some(
      e => e.branch === branch && e.entry_year === Number(year)
    );

    if (exists) {
      alert("Already exists");
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

  /* ======================
     SAVE CHANGES
     ====================== */
  const handleSave = async () => {
    if (eligibility.length === 0) {
      alert("Eligibility cannot be empty");
      return;
    }

    const res = await fetch(
      `http://localhost:5001/instructor/course/${courseId}/eligibility`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: course.course_id,
          semester,
          eligibility
        })
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }

    navigate(-1); // go back to course details
  };

  return (
    <div className="course-form">
      <h3>Edit Course Offering</h3>

      {/* READ-ONLY COURSE */}
      <input
        value={`${course.course_id} - ${course.title}`}
        disabled
        className="course-input"
        style={{backgroundColor:"black",color:"white",marginBottom:"10px"}}
      />

      {/* SEMESTER (read-only for now) */}
      <input value={semester} disabled className="course-input" style={{backgroundColor:"black",color:"white"}} />

      {/* ELIGIBILITY */}
      <div className="eligibility-section">
        <h4>Course Eligibility</h4>

        <div className="eligibility-inputs">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">Branch</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>

          <input
            className="custom-input"
            type="number"
            placeholder="Year(eg. 2023)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="1"
          />
          <style>
            {`
              .custom-input::placeholder {
                color: white;
                opacity: 1;
              }
            `}
          </style>

          <button onClick={addEligibility}>✓</button>
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
                    <button onClick={() => removeEligibility(index)}>
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="course-form-actions">
        <button onClick={handleSave}>Save Changes</button>
        <button onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
}
