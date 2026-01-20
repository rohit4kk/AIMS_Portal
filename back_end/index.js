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
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

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
    console.log("Stored OTP:", user.otp, typeof user.otp);
    console.log("Received OTP:", otp, typeof otp);
    console.log("Expires at:", user.otp_expires_at);
    console.log("Now:", new Date().toISOString());

    // 🔥 FIXED CHECKS
    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (
      !user.otp_expires_at ||
      user.otp_expires_at+"Z" <= new Date().toISOString()
    ) {
      return res.status(400).json({ error: "OTP expired" });
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


//for instructor details
app.get("/instructor/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("instructors")
    .select("name, email, department")
    .eq("id", id)
    .limit(1);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Instructor not found" });
  }

  res.json(data[0]);
});

app.post("/instructor/add-course", async (req, res) => {
  const { title, course_id,credits, semester, department, instructorId } = req.body;

  // Basic validation
  if (!title || !course_id || !credits || !semester || !department || !instructorId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
   

    // 2️ Insert into COURSES table
    const { error: courseError } = await supabase
      .from("courses")
      .insert({
        course_id,
        title,
        department,
        credits,
        semester
      });

    if (courseError) {
      console.error(courseError);
      return res.status(500).json({ error: "Failed to create course" });
    }

    // 3️⃣ Insert into TEACHES table
    const { error: teachesError } = await supabase
      .from("teaches")
      .insert({
        instructor_id: instructorId,
        course_id,
        semester
      });

    if (teachesError) {
      console.error(teachesError);
      return res.status(500).json({ error: "Failed to assign course" });
    }

    res.json({
      message: "Course added successfully",
      course_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/instructor/:id/courses", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("teaches")
    .select(`
      semester,
      courses (
        course_id,
        title,
        credits,
        department
      )
    `)
    .eq("instructor_id", id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch courses" });
  }

  // Format response for frontend
  const formatted = data.map((row) => ({
    course_id: row.courses.course_id,
    title: row.courses.title,
    credits: row.courses.credits,
    department: row.courses.department,
    semester: row.semester
  }));

  res.json(formatted);
});

//For bulk approval by instructor
app.post("/instructor/course/:courseId/approve-bulk", async (req, res) => {
  const { courseId } = req.params;
  const { studentIds } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ error: "No students selected" });
  }

  const { error } = await supabase
    .from("takes")
    .update({ status: "PENDING_ADVISOR_APPROVAL" })
    .eq("course_id", courseId)
    .in("student_id", studentIds)
    .eq("status", "PENDING_INSTRUCTOR_APPROVAL");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to approve requests" });
  }

  res.json({ message: "Selected requests approved" });
});

// Student information
app.get("/student/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("students")
    .select("name, email, department, year")
    .eq("id", id)
    .limit(1);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.json(data[0]);
});


//Courses info
app.get("/courses", async (req, res) => {
  const { data, error } = await supabase
    .from("teaches")
    .select(`
      semester,
      courses (
        course_id,
        title,
        department,
        credits
      )
    `);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch courses" });
  }

  // flatten response
  const formatted = data.map(row => ({
    course_id: row.courses.course_id,
    title: row.courses.title,
    department: row.courses.department,
    credits: row.courses.credits,
    semester: row.semester
  }));

  res.json(formatted);
});


// Enrollment requests for a course
app.get("/courses/:courseId/requests", async (req, res) => {
  const { courseId } = req.params;

  const { data, error } = await supabase
    .from("takes")
    .select(`
      status,
      students (
        id,
        name,
        email,
        roll_no
      )
    `)
    .eq("course_id", courseId);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }

  // Format response
  const formatted = data.map(row => ({
    student_id: row.students.id,
    name: row.students.name,
    email: row.students.email,
    roll_no: row.students.roll_no,
    status: row.status
  }));

  res.json(formatted);
});

// Enroll in a course
app.post("/courses/:courseId/enroll", async (req, res) => {
  const { courseId } = req.params;
  const { studentId, semester } = req.body;

  if (!studentId || !semester) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if already enrolled/requested
  const { data: existing } = await supabase
    .from("takes")
    .select("student_id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("semester", semester)
    .limit(1);

  if (existing && existing.length > 0) {
    return res
      .status(400)
      .json({ error: "Already enrolled or request exists" });
  }

  // Insert enrollment request
  const { error } = await supabase.from("takes").insert({
    student_id: studentId,
    course_id: courseId,
    semester,
    status: "PENDING_INSTRUCTOR_APPROVAL"
  });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to enroll" });
  }

  res.json({ message: "Enrollment request submitted" });
});

// fetch course enrollment requests for instructor approval
app.get("/instructor/course/:courseId/requests", async (req, res) => {
  const { courseId } = req.params;

  const { data, error } = await supabase
    .from("takes")
    .select(`
      student_id,
      status,
      students (
        name,
        email,
        department,
        roll_no
      )
    `)
    .eq("course_id", courseId)
    .eq("status", "PENDING_INSTRUCTOR_APPROVAL");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }

  const formatted = data.map(row => ({
    student_id: row.student_id,
    name: row.students.name,
    email: row.students.email,
    department: row.students.department,
    roll_no: row.students.roll_no,
    status: row.status
  }));

  res.json(formatted);
});


// approve enrollment request
app.post("/instructor/course/:courseId/approve", async (req, res) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "Student ID required" });
  }

  const { error } = await supabase
    .from("takes")
    .update({ status: "PENDING_ADVISOR_APPROVAL" })
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .eq("status", "PENDING_INSTRUCTOR_APPROVAL");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to approve request" });
  }

  res.json({ message: "Request approved" });
});

// reject enrollment request
app.post("/instructor/course/:courseId/reject", async (req, res) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "Student ID required" });
  }

  const { error } = await supabase
    .from("takes")
    .update({ status: "REJECTED_BY_INSTRUCTOR" })
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .eq("status", "PENDING_INSTRUCTOR_APPROVAL");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to reject request" });
  }

  res.json({ message: "Request rejected" });
});


//FOR FACULTY ADVISOR 

// ================= FACULTY ADVISOR DETAILS =================
app.get("/fa/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("faculty_advisors")
    .select("name, email, department")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Faculty Advisor not found" });
  }

  res.json(data);
});


// ================= FA PENDING APPROVAL REQUESTS =================
app.get("/fa/:faId/requests", async (req, res) => {
  const { faId } = req.params;

  const { data, error } = await supabase
    .from("takes")
    .select(`
      student_id,
      course_id,
      semester,
      students!inner (
        name,
        email,
        fa_id,
        roll_no
      ),
      courses!inner (
        title,
        credits
      )
    `)
    .eq("status", "PENDING_ADVISOR_APPROVAL")
    .eq("students.fa_id", faId);

  if (error) {
    return res.status(500).json({ error: "Failed to fetch requests" });
  }

  res.json(data);
});
// ================= FA STUDENTS LIST =================
app.get("/fa/:faId/students", async (req, res) => {
  const { faId } = req.params;

  const { data, error } = await supabase
    .from("students")
    .select("id, name, email, roll_no, department, year")
    .eq("fa_id", faId);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch students" });
  }

  res.json(data);
});

// ================= FA DECISION HISTORY =================
app.get("/fa/:faId/history", async (req, res) => {
  const { faId } = req.params;

  const { data, error } = await supabase
    .from("takes")
    .select(`
      status,
      semester,
      students!inner (
        name,
        roll_no,
        email,
        fa_id
      ),
      courses!inner (
        title
      )
    `)
    .in("status", ["ENROLLED", "REJECTED_BY_ADVISOR"])
    .eq("students.fa_id", faId)
    .order("semester", { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch history" });
  }

  res.json(data);
});


// ================= FA APPROVE / REJECT =================
app.post("/fa/decision", async (req, res) => {
  const { student_id, course_id, semester, decision } = req.body;

  const newStatus =
    decision === "APPROVE"
      ? "ENROLLED"
      : "REJECTED_BY_ADVISOR";

  const { error } = await supabase
    .from("takes")
    .update({ status: newStatus })
    .match({ student_id, course_id, semester });

  if (error) {
    return res.status(500).json({ error: "Failed to update status" });
  }

  res.json({ message: "Decision recorded" });
});

// ================= FETCH ENROLLED STUDENTS =================
app.get("/instructor/course/:courseId/enrolled", async (req, res) => {
  const { courseId } = req.params;

  const { data, error } = await supabase
    .from("takes")
    .select(`
      student_id,
      grade,
      students (
        name,
        email,
        roll_no
      )
    `)
    .eq("course_id", courseId)
    .eq("status", "ENROLLED");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch enrolled students" });
  }

  const formatted = data.map(row => ({
    student_id: row.student_id,
    name: row.students.name,
    email: row.students.email,
    roll_no: row.students.roll_no,
    grade: row.grade
  }));

  res.json(formatted);
});

// ================= SUBMIT GRADE =================
app.post("/instructor/course/:courseId/grade", async (req, res) => {
  const { courseId } = req.params;
  const { studentId, grade } = req.body;

  if (!studentId || !grade) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const { error } = await supabase
    .from("takes")
    .update({ grade })
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .eq("status", "ENROLLED");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to submit grade" });
  }

  res.json({ message: "Grade updated" });
});

// ================= STUDENT ACADEMIC RECORD =================
app.get("/student/:studentId/record", async (req, res) => {
  const { studentId } = req.params;
  console.log("Fetching record for student ID:", studentId);
  const { data, error } = await supabase
    .from("takes")
    .select(`
      semester,
      status,
      grade,
      courses (
        course_id,
        title,
        credits,
        department
      )
    `)
    .eq("student_id", studentId)
    .order("semester", { ascending: false });

  // 🔍 LOG RAW QUERY RESULT
  console.log("Raw takes query result:", data);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to fetch student record" });
  }

  // Group by semester
  const grouped = {};
  data.forEach(row => {
    if (!grouped[row.semester]) {
      grouped[row.semester] = [];
    }

    console.log("Processing row:", row); // optional per-row debug

    grouped[row.semester].push({
      course_id: row.courses?.course_id,
      title: row.courses?.title,
      credits: row.courses?.credits,
      department: row.courses?.department,
      status: row.status,
      grade: row.grade || "NA"
    });
  });

  // 🔍 LOG FINAL GROUPED RESULT
  console.log("Grouped student record:", grouped);

  res.json(grouped);
});

// ================= DROP COURSE =================
app.delete("/courses/:courseId/drop", async (req, res) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "Student ID required" });
  }

  // Check if record exists
  const { data: existing, error } = await supabase
    .from("takes")
    .select("status")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .limit(1);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }

  if (!existing || existing.length === 0) {
    return res.status(400).json({
      error: "You are not enrolled in this course"
    });
  }

  const allowedStatuses = [
    "ENROLLED",
    "PENDING_INSTRUCTOR_APPROVAL",
    "PENDING_ADVISOR_APPROVAL"
  ];

  if (!allowedStatuses.includes(existing[0].status)) {
    return res.status(400).json({
      error: "Course cannot be dropped at this stage"
    });
  }

  // Delete the record
  const { error: deleteError } = await supabase
    .from("takes")
    .delete()
    .eq("student_id", studentId)
    .eq("course_id", courseId);

  if (deleteError) {
    console.error(deleteError);
    return res.status(500).json({ error: "Failed to drop course" });
  }

  res.json({ message: "Course dropped successfully" });
});

app.listen(5001, () => {
  console.log("AIMS backend running on port 5001");
});