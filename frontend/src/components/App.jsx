import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Student from "./Student";
import Instructor from "./Instructor";
import FacultyAdvisor from "./FacultyAdvisor";
import InstructorCourseDetails from "./InstructorCourseDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student/*" element={<Student />} />
        <Route path="/instructor/*" element={<Instructor />} />
        <Route
          path="/instructor/course/:courseId"
          element={<InstructorCourseDetails />}
        />
        <Route path="/fa/*" element={<FacultyAdvisor />} />
      </Routes>
    </BrowserRouter>
  );
}
