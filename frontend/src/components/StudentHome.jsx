import { useEffect, useState } from "react";

export default function StudentHome() {
  const [studentName, setStudentName] = useState("Student");
  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    async function fetchStudent() {
      const res = await fetch(
        `http://localhost:5001/student/${studentId}`
      );
      const data = await res.json();

      if (res.ok) {
        setStudentName(data.name);
      }
    }

    if (studentId) fetchStudent();
  }, [studentId]);

  return (
    <div className="student-content">
      <h3>Hi {studentName}</h3>

      <h2>Academic Information Management System.</h2>

      <div className="student-warning">
        Please DO NOT edit or manipulate the URLs or requests when using
        this application. Doing so may lock your account.
      </div>

      <p className="student-text">
        Please proceed by choosing a menu item from the top bar.
      </p>

      <p className="student-text">
        Before contacting @aims_help for any issues, please check the{" "}
        <a href="#">User Guide</a> for solution.
      </p>

      <div className="student-note">
        <strong>NOTE:</strong>
        <ul>
          <li>
            Please directly contact the course instructor for any changes
            to your enrolment requests.
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