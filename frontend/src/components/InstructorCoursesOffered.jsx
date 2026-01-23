import { useNavigate } from "react-router-dom";
import CoursesOffered from "./CoursesOffered";
import "./public/Instructor.css";

export default function InstructorCoursesOffered() {
  const navigate = useNavigate();

  return (
    <div className="instructor-container" style={{padding:"0"}}>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-title" style={{color: "white"}}>Courses Offered</span>
        </div>

        <div className="navbar-right">
          <button style={{backgroundColor:"grey"}} onClick={() => navigate("/instructor")}>
            Back
          </button>
        </div>
      </nav>

      
      <CoursesOffered />
    </div>
  );
}
