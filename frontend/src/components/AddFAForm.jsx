import { useState } from "react";

export default function AddFAForm() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    department: ""
  });

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5001/admin/add-fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <div>
      <h3>Add Faculty Advisor</h3>
      {Object.keys(form).map(key => (
        <input
          key={key}
          placeholder={key}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
        />
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
