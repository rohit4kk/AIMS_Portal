import { useNavigate } from "react-router-dom";
import "./public/AdminHome.css";

export default function AdminHome() {
  const navigate = useNavigate();

  const adminMenuItems = [
    { label: "View Students", path: "/admin/students", icon: "👥" },
    { label: "View Instructors", path: "/admin/instructors", icon: "🎓" },
    { label: "View Faculty Advisors", path: "/admin/fas", icon: "👨‍🏫" },
    { label: "View All Courses", path: "/admin/courses", icon: "📚" },
    { label: "Add Student", path: "/admin/add-student", icon: "➕" },
    { label: "Create Course", path: "/admin/create-course", icon: "🆕" }
  ];

  return (
    <div className="admin-home-container">
      <div className="admin-home-header">
        <h1>Admin Dashboard</h1>
        <p className="admin-home-subtitle">Manage your system efficiently</p>
      </div>

      <div className="admin-cards">
        {adminMenuItems.map((item, index) => (
          <button
            key={index}
            className="admin-card-btn"
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="admin-card-btn-text">{item.label}</span>
            <p className="admin-card-btn-desc">Access now</p>
          </button>
        ))}
      </div>
    </div>
  );
}
