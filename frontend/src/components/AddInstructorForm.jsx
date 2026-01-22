import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  department: ""
};

export default function AddInstructorForm() {
  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5001/admin/add-instructor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      setForm(initialState); // ✅ RESET
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h3>Add Instructor</h3>

      <input name="name" value={form.name} placeholder="Name" onChange={handleChange} />
      <input name="email" value={form.email} placeholder="Email" onChange={handleChange} />
      <input name="department" value={form.department} placeholder="Department" onChange={handleChange} />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
