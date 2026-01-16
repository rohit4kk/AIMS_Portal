import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* ================= EMAIL SETUP ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



/* ================= GENERATE OTP ================= */
app.post("/generate-otp", async (req, res) => {
    const { email } = req.body;
    console.log(email);
    const { data: users, error } = await supabase
  .from("users")
  .select("id")
  .eq("email", email)
  .limit(1);

// Supabase / DB error
if (error) {
  console.error("Supabase error:", error.message);
  return res.status(500).json({ error: "Database error" });
}
console.log(users)
// Email not found
if (!users || users.length === 0) {
  return res.status(400).json({ error: "Email not registered" });
}



  // 2. Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 3. Store OTP in users table
  await supabase
    .from("users")
    .update({
      otp: otp,
      otp_expires_at: expiresAt
    })
    .eq("email", email);

  // 4. Send OTP email
  await transporter.sendMail({
    from: `"AIMS Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "AIMS Login OTP",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`
  });

  res.json({ message: "OTP sent to email" });
});

/* ================= VERIFY OTP ================= */
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  // 1. Fetch user with OTP
  const { data: user } = await supabase
    .from("users")
    .select("id, role, otp, otp_expires_at")
    .eq("email", email)
    .single();

  if (
    !user ||
    user.otp !== otp ||
    !user.otp_expires_at ||
    new Date(user.otp_expires_at) < new Date()
  ) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // 2. Clear OTP after login
  await supabase
    .from("users")
    .update({
      otp: null,
      otp_expires_at: null
    })
    .eq("email", email);

  // 3. Login success
  res.json({
    userId: user.id,
    role: user.role
  });
});

app.listen(5000, () => {
  console.log("AIMS backend running on port 5000");
});
