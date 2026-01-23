import { useNavigate } from "react-router-dom";
import "./public/AddCourse.css";
import Course_Form from "./Course_Form"


export default function AddCourse() {
  const navigate = useNavigate();

  return (
    <div className="instructor-container" style={{padding:"0"}}>
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-title">Add Course</span>
        </div>

        <div className="navbar-right">
          <button onClick={() => navigate("/instructor")}>Back</button>
        </div>
      </nav>

      <Course_Form
        onClose={() => navigate("/instructor")}
        onCourseAdded={() => navigate("/instructor")}
      />
    </div>
  );
}
