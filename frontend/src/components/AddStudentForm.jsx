import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  department: "",
  year: "",
  roll_no: "",
  fa_email: ""
};

export default function AddStudentForm() {
  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5001/admin/add-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        year: Number(form.year)
      })
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
      <h3>Add Student</h3>

      <input name="name" value={form.name} placeholder="Name" onChange={handleChange} />
      <input name="email" value={form.email} placeholder="Student Email" onChange={handleChange} />
      <input name="department" value={form.department} placeholder="Department" onChange={handleChange} />
      <input name="year" value={form.year} type="number" placeholder="Year" onChange={handleChange} />
      <input name="roll_no" value={form.roll_no} placeholder="Roll No" onChange={handleChange} />
      <input name="fa_email" value={form.fa_email} placeholder="Faculty Advisor Email" onChange={handleChange} />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
