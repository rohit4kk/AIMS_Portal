import { useEffect, useState } from "react";

export default function StudentHome() {
  const [studentName, setStudentName] = useState("Student");
  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    async function fetchStudent() {
      const res = await fetch(
        `http://localhost:5000/student/${studentId}`
      );
      const data = await res.json();

      if (res.ok) {
        setStudentName(data.name);
      }
    }

    if (studentId) fetchStudent();
  }, [studentId]);

  return (
    <div style={{ padding: "40px" }}>
      <h3>Hi {studentName}</h3>

      <div style={{ marginTop: "40px", maxWidth: "800px" }}>
        <h2>Academic Information Management System.</h2>

        <p style={{ color: "red", fontWeight: "bold" }}>
          Please DO NOT edit or manipulate the URLs or requests when using
          this application. Doing so may lock your account.
        </p>

        <p>
          Please proceed by choosing a menu item from the top bar.
        </p>

        <p>
          Before contacting @aims_help for any issues, please check the{" "}
          <a href="#">User Guide</a> for solution.
        </p>

        <p><strong>NOTE:</strong></p>
        <ul>
          <li>
            Please directly contact the course instructor for any changes to
            your enrolment requests.
          </li>
          <li>
            We have not yet fully imported your past enrolments data into
            this system. You may not get to see grades for some of your past
            courses.
          </li>
        </ul>
      </div>
    </div>
  );
}
