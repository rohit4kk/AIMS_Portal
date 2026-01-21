import { useState,useEffect } from "react";
import "./public/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
  const role = localStorage.getItem("role");

  if (role === "STUDENT") window.location.href = "/student";
  if (role === "INSTRUCTOR") window.location.href = "/instructor";
  if (role === "FACULTY_ADVISOR") window.location.href = "/fa";
}, []);


  const startResendTimer = (seconds = 30) => {
    setResendTimer(seconds);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateOtp = async () => {
    if (!email) {
      setMessage("Please enter email first");
      return;
    }

    setMessage("");
    setLoadingOtp(true);

    try {
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
      startResendTimer(30);
    } catch (err) {
      setMessage("Server not reachable");
    } finally {
      setLoadingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter OTP");
      return;
    }

    setMessage("");
    setLoadingLogin(true);

    try {
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

      // ✅ STORE USER DATA
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("role", data.role);

      if (data.role === "STUDENT") window.location.href = "/student";
      if (data.role === "INSTRUCTOR") window.location.href = "/instructor";
      if (data.role === "FACULTY_ADVISOR") window.location.href = "/fa";
    } catch (err) {
      setMessage("Server not reachable");
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>AIMS Login</h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter institute email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="login-input"
              disabled={loadingOtp}
            />

            <button
              onClick={generateOtp}
              className="login-btn"
              disabled={loadingOtp}
            >
              {loadingOtp ? "Sending OTP..." : "Generate OTP"}
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
              className="login-input"
              disabled={loadingLogin}
            />

            <button
              onClick={verifyOtp}
              className="login-btn"
              disabled={loadingLogin}
            >
              {loadingLogin ? "Logging in..." : "Login"}
            </button>

            <button
              onClick={generateOtp}
              className="login-btn resend-btn"
              disabled={resendTimer > 0 || loadingOtp}
              style={{ marginTop: "10px" }}
            >
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : loadingOtp
                ? "Sending OTP..."
                : "Resend OTP"}
            </button>
          </>
        )}

        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
}