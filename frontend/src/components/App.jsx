import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Student from "./Student";
import Instructor from "./Instructor";
import FacultyAdvisor from "./FacultyAdvisor";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student" element={<Student />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/fa" element={<FacultyAdvisor />} />
      </Routes>
    </BrowserRouter>
  );
}
