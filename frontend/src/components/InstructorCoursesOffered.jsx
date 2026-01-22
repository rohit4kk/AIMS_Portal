import { useNavigate } from "react-router-dom";
import CoursesOffered from "./CoursesOffered";
import "./public/Instructor.css";

export default function InstructorCoursesOffered() {
  const navigate = useNavigate();

  return (
    <div className="instructor-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-title">Courses Offered</span>
        </div>

        <div className="navbar-right">
          <button onClick={() => navigate("/instructor")}>
            Back
          </button>
        </div>
      </nav>

      
      <CoursesOffered />
    </div>
  );
}
