import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const generateOtp = async () => {
    setMessage("");

    const res = await fetch("http://localhost:5001/generate-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to generate OTP");
      return;
    }

    setMessage("OTP sent to your email");
    setStep(2);
  };

  const verifyOtp = async () => {
  setMessage("");

  const res = await fetch("http://localhost:5001/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, otp })
  });

  const data = await res.json();

  if (!res.ok) {
    setMessage(data.error || "Invalid OTP");
    return;
  }

  // ✅ STORE USER ID AFTER SUCCESSFUL LOGIN
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("role", data.role);

  // Redirect based on role
  if (data.role === "STUDENT") window.location.href = "/student";
  if (data.role === "INSTRUCTOR") window.location.href = "/instructor";
  if (data.role === "FACULTY_ADVISOR") window.location.href = "/fa";
};

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>AIMS Login</h2>

      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Enter institute email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
          />
          <br /><br />
          <button onClick={generateOtp} style={{ width: "100%" }}>
            Generate OTP
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
          />
          <br /><br />
          <button onClick={verifyOtp} style={{ width: "100%" }}>
            Login
          </button>
        </>
      )}

      {message && (
        <p style={{ marginTop: "20px", color: "red" }}>{message}</p>
      )}
    </div>
  );
}
