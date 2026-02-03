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


// GET /instructor/search-courses?prefix=CS
app.get("/instructor/search-courses", async (req, res) => {
  const { prefix } = req.query;

  console.log("PREFIX RECEIVED:", prefix);

  if (!prefix) {
    return res.status(400).json({ error: "Prefix required" });
  }

  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*") // TEMP: select everything to debug
      .ilike("course_id", `${prefix}%`)
      .limit(10);

    if (error) {
      console.error("🔥 SUPABASE ERROR OBJECT 🔥");
      console.error(error); // <-- THIS is key
      return res.status(500).json({ error: error.message });
    }

    console.log("DATA RETURNED:", data);
    res.json(data);
  } catch (err) {
    console.error("🔥 SERVER ERROR 🔥", err);
    res.status(500).json({ error: "Server crash" });
  }
});

// POST /instructor/add-course-eligibility
app.post("/instructor/add-course-eligibility", async (req, res) => {
  const { course_id, semester, eligibility } = req.body;

  if (!course_id || !semester || !eligibility?.length) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const rows = eligibility.map(e => ({
    course_id,
    semester,
    branch: e.branch,
    entry_year: e.entry_year
  }));

  const { error } = await supabase
    .from("course_eligibility")
    .insert(rows);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

// GET existing eligibility for a course offering
app.get("/instructor/course/:courseId/eligibility", async (req, res) => {
  const { courseId } = req.params;
  const { semester } = req.query; // pass semester as query

  if (!semester) {
    return res.status(400).json({ error: "Semester required" });
  }

  const { data, error } = await supabase
    .from("course_eligibility")
    .select("branch, entry_year")
    .eq("course_id", courseId)
    .eq("semester", semester);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});


// UPDATE eligibility (replace old with new)
app.put("/instructor/course/:courseId/eligibility", async (req, res) => {
  const { courseId } = req.params;
  const { semester, eligibility } = req.body;

  if (!semester || !eligibility?.length) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
   

    // Insert new eligibility
    const rows = eligibility.map(e => ({
      course_id: courseId,
      semester,
      branch: e.branch,
      entry_year: e.entry_year
    }));

    const { error: insertError } = await supabase
      .from("course_eligibility")
      .insert(rows);

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ error: insertError.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
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
  const { course_id, semester, instructorId, slot } = req.body;

  if (!course_id || !semester || !instructorId || !slot) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1️⃣ Check instructor slot clash
    const { data: clash, error: clashError } = await supabase
      .from("teaches")
      .select("course_id")
      .eq("instructor_id", instructorId)
      .eq("semester", semester)
      .eq("slot", slot);

    if (clashError) {
      console.error(clashError);
      return res.status(500).json({ error: "Failed to check slot clash" });
    }

    if (clash.length > 0) {
      return res.status(400).json({
        error: "You already have a course in this slot for this semester"
      });
    }

    // 2️⃣ Insert course offering
    const { error } = await supabase
      .from("teaches")
      .insert({
        instructor_id: instructorId,
        course_id,
        semester,
        slot
      });

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        return res.status(400).json({
          error: "Slot clash detected"
        });
      }

      if (error.code === "23503") {
        return res.status(400).json({
          error: "Invalid course or slot"
        });
      }

      return res.status(500).json({ error: "Failed to add course offering" });
    }

    res.json({
      message: "Course offering added successfully",
      course_id,
      semester,
      slot
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

// ================= INSTRUCTOR: PENDING APPROVAL REQUESTS =================
app.get("/instructor/course/:courseId/requests", async (req, res) => {
  const { courseId } = req.params;
  const { semester } = req.query;

  if (!semester) {
    return res.status(400).json({ error: "Semester is required" });
  }

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
    .eq("semester", semester)
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


//For bulk approval by instructor
app.post("/instructor/course/:courseId/approve-bulk", async (req, res) => {
  const { courseId } = req.params;
  const { studentIds, semester } = req.body;

  if (!studentIds || studentIds.length === 0 || !semester) {
    return res.status(400).json({ error: "Student IDs and semester required" });
  }

  const { error } = await supabase
    .from("takes")
    .update({ status: "ENROLLED" })
    .in("student_id", studentIds)
    .eq("course_id", courseId)
    .eq("semester", semester)
    .eq("status", "PENDING_INSTRUCTOR_APPROVAL");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Bulk approval failed" });
  }

  res.json({ message: "Students approved successfully" });
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


// Courses info 
app.get("/courses", async (req, res) => {
  try {
    // 1️⃣ Fetch course offerings
    const { data: teachesData, error: teachesError } = await supabase
      .from("teaches")
      .select(`
        semester,
        slot,
        courses (
          course_id,
          title,
          department,
          credits,
          "L-P-T-S-C"
        ),
        instructors (
          name
        )
      `);

    if (teachesError) {
      console.error(teachesError);
      return res.status(500).json({ error: "Failed to fetch courses" });
    }

    // 2️⃣ Fetch eligibility rules
    const { data: eligibilityData, error: eligibilityError } = await supabase
      .from("course_eligibility")
      .select(`
        course_id,
        semester,
        branch,
        entry_year
      `);

    if (eligibilityError) {
      console.error(eligibilityError);
      return res.status(500).json({ error: "Failed to fetch course eligibility" });
    }

    // 3️⃣ Merge data safely
    const formatted = teachesData
      .map(row => {
        if (!row.courses || !row.instructors) return null;

        const courseId = row.courses.course_id;
        const semester = row.semester;

        return {
          course_id: courseId,
          title: row.courses.title,
          department: row.courses.department,
          credits: row.courses.credits,
          semester,
          slot: row.slot,
          ltpsc: row.courses["L-P-T-S-C"],
          instructor_name: row.instructors.name,

          eligibility: eligibilityData.filter(
            e =>
              e.course_id === courseId &&
              e.semester === semester
          )
        };
      })
      .filter(Boolean);

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




app.post("/admin/import-students", async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students)) {
      return res.status(400).json({ error: "Students array required" });
    }

    const success = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      let userId = null;

      try {
        // 1️⃣ Validate required fields
        if (
          !s.name ||
          !s.email ||
          !s.department ||
          !s.year ||
          !s.roll_no ||
          !s.fa_email
        ) {
          throw new Error("Missing required fields");
        }

        // CHECK IF USER ALREADY EXISTS
const { data: existingUser } = await supabase
  .from("users")
  .select("id")
  .eq("email", s.email)
  .maybeSingle();

let userId;

if (existingUser) {
  userId = existingUser.id;
} else {
  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert({ email: s.email, role: "STUDENT" })
    .select("id")
    .single();

  if (userError || !userData) {
    throw new Error("Failed to create user");
  }

  userId = userData.id;
}


        // 3️⃣ Resolve FA email → fa_id
        const { data: fa, error: faError } = await supabase
          .from("faculty_advisors")
          .select("id")
          .eq("email", s.fa_email)
          .maybeSingle();

        if (faError || !fa) {
          throw new Error("Faculty Advisor not found");
        }

        // 4️⃣ Insert student using SAME ID as user
        const { error: studentError } = await supabase
          .from("students")
          .insert({
            id: userId,
            name: s.name,
            email: s.email,
            department: s.department,
            year: s.year,
            roll_no: s.roll_no,
            fa_id: fa.id
          });

        if (studentError) {
          throw new Error("Failed to create student");
        }

        // 5️⃣ Track success
        success.push({
          email: s.email,
          roll_no: s.roll_no
        });

      } catch (err) {
        // 🧹 Cleanup user if student insert failed
        if (userId) {
          await supabase.from("users").delete().eq("id", userId);
        }

        errors.push({
          row: i + 1,
          email: s.email || null,
          roll_no: s.roll_no || null,
          reason: err.message
        });
      }
    }

    // 6️⃣ Final response
    res.status(200).json({
      success,
      errors,
      summary: {
        total: students.length,
        inserted: success.length,
        failed: errors.length
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
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
  const { studentId, semester, role } = req.body;

  // ================= BASIC VALIDATION =================
  if (!studentId || !semester) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (role !== "STUDENT") {
    return res.status(400).json({
      error: "Only students can enroll in the course"
    });
  }

  // ================= DUPLICATE CHECK =================
  const { data: existing } = await supabase
    .from("takes")
    .select("student_id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("semester", semester)
    .limit(1);

  if (existing && existing.length > 0) {
    return res.status(400).json({
      error: "Already enrolled or request exists"
    });
  }

  // ================= FETCH STUDENT =================
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("department, year")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    return res.status(400).json({ error: "Student not found" });
  }

  // ================= CHECK ELIGIBILITY =================
  const { data: eligible } = await supabase
    .from("course_eligibility")
    .select("course_id")
    .eq("course_id", courseId)
    .eq("semester", semester)
    .eq("entry_year", student.year)
    .or(`branch.eq.${student.department},branch.eq.All`)
    .limit(1);

  if (!eligible || eligible.length === 0) {
    return res.status(403).json({
      error: "You are not eligible for this course"
    });
  }

  // ====================================================
  // 🔹 SLOT CLASH CHECK (NO FK, SAFE WITH YOUR SCHEMA)
  // ====================================================

  // 1️⃣ Fetch slot of the target course offering
  const { data: target, error: targetError } = await supabase
    .from("teaches")
    .select("slot")
    .eq("course_id", courseId)
    .eq("semester", semester)
    .limit(1)
    .single();

  if (targetError || !target) {
    return res.status(400).json({
      error: "Course offering not found"
    });
  }

  const targetSlot = target.slot;

  // 2️⃣ Fetch student's ACTIVE courses in same semester
  const { data: activeCourses, error: activeError } = await supabase
    .from("takes")
    .select("course_id")
    .eq("student_id", studentId)
    .eq("semester", semester)
    .in("status", [
      "ENROLLED",
      "PENDING_INSTRUCTOR_APPROVAL",
      "PENDING_ADVISOR_APPROVAL"
    ]);

  if (activeError) {
    console.error(activeError);
    return res.status(500).json({
      error: "Failed to check existing enrollments"
    });
  }

  // 3️⃣ If student has any active course, check their slots
  if (activeCourses.length > 0) {
    const courseIds = activeCourses.map(c => c.course_id);

    const { data: takenSlots, error: slotError } = await supabase
      .from("teaches")
      .select("course_id, slot")
      .eq("semester", semester)
      .in("course_id", courseIds);

    if (slotError) {
      console.error(slotError);
      return res.status(500).json({
        error: "Failed to check slot clash"
      });
    }

    const clash = takenSlots.some(t => t.slot === targetSlot);

    if (clash) {
      return res.status(400).json({
        error: "Slot clash: You already have a course in this slot"
      });
    }
  }

  // ================= INSERT ENROLLMENT =================
  const { error: insertError } = await supabase
    .from("takes")
    .insert({
      student_id: studentId,
      course_id: courseId,
      semester,
      status: "PENDING_INSTRUCTOR_APPROVAL"
    });

  if (insertError) {
    console.error(insertError);
    return res.status(500).json({
      error: "Failed to enroll"
    });
  }

  res.json({ message: "Enrollment request submitted" });
});




// approve enrollment request
app.post("/instructor/course/:courseId/approve", async (req, res) => {
  const { courseId } = req.params;
  const { studentId, semester } = req.body;

  if (!studentId || !semester) {
    return res.status(400).json({ error: "Missing studentId or semester" });
  }

  const { error } = await supabase
    .from("takes")
    .update({ status: "ENROLLED" })
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("semester", semester)
    .eq("status", "PENDING_INSTRUCTOR_APPROVAL");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to approve request" });
  }

  res.json({ message: "Student approved successfully" });
});


// reject enrollment request
app.post("/instructor/course/:courseId/reject", async (req, res) => {
  const { courseId } = req.params;
  const { studentId, semester } = req.body;

  if (!studentId || !semester) {
    return res.status(400).json({ error: "Missing studentId or semester" });
  }

  const { error } = await supabase
    .from("takes")
    .update({ status: "REJECTED_BY_INSTRUCTOR" })
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("semester", semester)
    .eq("status", "PENDING_INSTRUCTOR_APPROVAL");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to reject request" });
  }

  res.json({ message: "Student rejected successfully" });
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





// ================= ADMIN: LIST STUDENTS =================
app.get("/admin/students", async (req, res) => {
  const { department } = req.query;

  let query = supabase
    .from("students")
    .select("name, email, department, roll_no, year");

  if (department) {
    query = query.eq("department", department);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch students" });
  }

  res.json(data);
});




// ================= ADMIN: LIST INSTRUCTORS =================
app.get("/admin/instructors", async (req, res) => {
  const { department } = req.query;

  let query = supabase
    .from("instructors")
    .select("name, email, department");

  if (department) {
    query = query.eq("department", department);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch instructors" });
  }

  res.json(data);
});







// ================= ADMIN: LIST FACULTY ADVISORS =================
app.get("/admin/fas", async (req, res) => {
  const { department } = req.query;

  let query = supabase
    .from("faculty_advisors")
    .select("name, email, department");

  if (department) {
    query = query.eq("department", department);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch faculty advisors" });
  }

  res.json(data);
});



// ================= ADMIN: LIST ALL COURSES =================
app.get("/admin/courses", async (req, res) => {
  const { data, error } = await supabase
    .from("courses")
    .select("*");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch courses" });
  }
  console.log(data);
  res.json(data);
});





// ================= ADMIN: CREATE COURSE =================
app.post("/admin/create-course", async (req, res) => {
  const { course_id, title, credits, department,lpts } = req.body;

  if (!course_id || !title || !credits || !department||!lpts) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { error } = await supabase
    .from("courses")
    .insert([
  {
    course_id,
    title,
    credits: Number(credits),
    department,
    "L-P-T-S-C": lpts
  }
])

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: "Course created successfully" });
});





app.post("/admin/add-student", async (req, res) => {
  const { name, email, department, year, roll_no, fa_email } = req.body;

  if (!name || !email || !department || !year || !roll_no || !fa_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // create user first (already fixed earlier)
    const { data: userData } = await supabase
      .from("users")
      .insert({ email, role: "STUDENT" })
      .select("id")
      .single();

    const userId = userData.id;

    // 🔍 RESOLVE FA EMAIL → ID
    const { data: fa, error: faError } = await supabase
      .from("faculty_advisors")
      .select("id")
      .eq("email", fa_email)
      .single();

    if (faError || !fa) {
      await supabase.from("users").delete().eq("id", userId);
      return res.status(400).json({ error: "Faculty Advisor not found" });
    }

    // INSERT STUDENT
    const { error: studentError } = await supabase.from("students").insert({
      id: userId,
      name,
      email,
      department,
      year,
      roll_no,
      fa_id: fa.id
    });

    if (studentError) {
      await supabase.from("users").delete().eq("id", userId);
      return res.status(500).json({ error: "Failed to create student" });
    }

    res.json({ message: "Student added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ADD INSTRUCTOR
app.post("/admin/add-instructor", async (req, res) => {
  const { name, email, department } = req.body;

  // 🔹 Validation (NO id)
  if (!name || !email || !department) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // 1️⃣ CHECK IF USER ALREADY EXISTS (EMAIL)
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (checkError) {
      console.error(checkError);
      return res.status(500).json({ error: "Database error" });
    }

    if (existingUser?.length) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2️⃣ INSERT USER (AUTO UUID)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        email,
        role: "INSTRUCTOR"
      })
      .select("id")
      .single();

    if (userError) {
      console.error(userError);
      return res.status(500).json({ error: "Failed to create user" });
    }

    const userId = userData.id; // ✅ GENERATED UUID

    // 3️⃣ INSERT INTO INSTRUCTORS USING SAME UUID
    const { error: instructorError } = await supabase
      .from("instructors")
      .insert({
        id: userId,
        name,
        email,
        department
      });

    if (instructorError) {
      console.error(instructorError);

      // 🔁 ROLLBACK USER
      await supabase.from("users").delete().eq("id", userId);

      return res.status(500).json({
        error: "Instructor creation failed, rollback completed"
      });
    }

    // ✅ SUCCESS
    res.json({
      message: "Instructor added successfully",
      id: userId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ADD FACULTY ADVISOR
app.post("/admin/add-fa", async (req, res) => {
  const { name, email, department } = req.body;

  // 🔹 Validation (NO id)
  if (!name || !email || !department) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // 1️⃣ CHECK IF USER EXISTS (EMAIL)
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (checkError) {
      console.error(checkError);
      return res.status(500).json({ error: "Database error" });
    }

    if (existingUser?.length) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2️⃣ INSERT USER (AUTO UUID)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        email,
        role: "FACULTY_ADVISOR"
      })
      .select("id")
      .single();

    if (userError) {
      console.error(userError);
      return res.status(500).json({ error: "Failed to create user" });
    }

    const userId = userData.id; // ✅ GENERATED UUID

    // 3️⃣ INSERT INTO FACULTY_ADVISORS USING SAME UUID
    const { error: faError } = await supabase
      .from("faculty_advisors")
      .insert({
        id: userId,
        name,
        email,
        department
      });

    if (faError) {
      console.error(faError);

      // 🔁 ROLLBACK USER
      await supabase.from("users").delete().eq("id", userId);

      return res.status(500).json({
        error: "Faculty Advisor creation failed, rollback completed"
      });
    }

    // ✅ SUCCESS
    res.json({
      message: "Faculty Advisor added successfully",
      id: userId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ================= FA BULK APPROVE / REJECT =================
app.post("/fa/decision-bulk", async (req, res) => {
  const { requests, decision } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({ error: "No requests provided" });
  }

  const newStatus =
    decision === "APPROVE"
      ? "ENROLLED"
      : "REJECTED_BY_ADVISOR";

  try {
    await Promise.all(
      requests.map(r =>
        supabase
          .from("takes")
          .update({ status: newStatus })
          .match({
            student_id: r.student_id,
            course_id: r.course_id,
            semester: r.semester
          })
      )
    );

    res.json({ message: "Bulk decision completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bulk decision failed" });
  }
});


// ================= FETCH ALL SLOTS =================
app.get("/slots", async (req, res) => {
  const { data, error } = await supabase
    .from("slots")
    .select("slot_code, description");

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch slots" });
  }

  res.json(data);
});



app.listen(5001, () => {
  console.log("AIMS backend running on port 5001");
});




