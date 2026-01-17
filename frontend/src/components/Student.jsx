import { Routes, Route, useNavigate } from "react-router-dom";
import StudentHome from "./StudentHome";
import CoursesOffered from "./CoursesOffered";
import StudentRecord from "./StudentRecord";

export default function Student() {
  const navigate = useNavigate();

  return (
    <div>
      {/* NAVBAR */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "20px",
          backgroundColor: "black"
        }}
      >
        <NavButton text="Home" onClick={() => navigate("/student")} />
        <NavButton
          text="Courses Offered"
          onClick={() => navigate("/student/courses")}
        />
        <NavButton
          text="Student Record"
          onClick={() => navigate("/student/record")}
        />
      </div>

      {/* PAGE CONTENT */}
      <Routes>
        <Route index element={<StudentHome />} />
        <Route path="courses" element={<CoursesOffered />} />
        <Route path="record" element={<StudentRecord />} />
      </Routes>
    </div>
  );
}

function NavButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "15px 30px",
        backgroundColor: "black",
        color: "white",
        border: "1px solid white",
        borderRadius: "6px",
        cursor: "pointer"
      }}
    >
      {text}
    </button>
  );
}
