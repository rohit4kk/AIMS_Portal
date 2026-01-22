import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddStudentForm from "./AddStudentForm";
import AddInstructorForm from "./AddInstructorForm";
import AddFAForm from "./AddFAForm";

export default function Admin() {
  const [view, setView] = useState(null);
  const navigate = useNavigate();

   const handleLogout = () => {
  localStorage.clear(); // or removeItem("userId")
  navigate("/", { replace: true });
  };


  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Dashboard</h2>

      <button onClick={() => setView("student")}>Add Student</button>
      <button onClick={() => setView("instructor")}>Add Instructor</button>
      <button onClick={() => setView("fa")}>Add Faculty Advisor</button>
      <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
      </button>

      <hr />

      {view === "student" && <AddStudentForm />}
      {view === "instructor" && <AddInstructorForm />}
      {view === "fa" && <AddFAForm />}
    </div>
  );
}
