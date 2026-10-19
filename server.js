
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware: allow the server to receive JSON
app.use(express.json());

// Student array (no database)
let students = [];
let nextId = 1;

// Check required student fields
function validateStudent(data) {
    const { email, name, age, course } = data;

    if (
        typeof email !== "string" || !email.trim() ||
        typeof name !== "string" || !name.trim() ||
        typeof age !== "number" || !Number.isInteger(age) || age < 1 ||
        typeof course !== "string" || !course.trim()
    ) {
        return "Provide email, name, a positive whole-number age, and course.";
    }

    return null;
}

// Check if an email already exists
function emailExists(email, excludeId = null) {
    return students.some(
        student =>
            student.email.toLowerCase() === email.trim().toLowerCase() &&
            student.id !== excludeId
    );
}

// 1. CREATE: Add a student
app.post("/students", (req, res) => {
    const error = validateStudent(req.body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    if (emailExists(req.body.email)) {
        return res.status(409).json({
            message: "This email is already registered."
        });
    }

    const student = {
        id: nextId++,
        email: req.body.email.trim().toLowerCase(),
        name: req.body.name.trim(),
        age: req.body.age,
        course: req.body.course.trim()
    };

    students.push(student);

    res.status(201).json({
        message: "Student created successfully",
        student
    });
});

// 2. READ: Get all students
app.get("/students", (req, res) => {
    res.status(200).json(students);
});

// 3a. READ ONE: Get student by email
app.get("/students/email/:email", (req, res) => {
    const email = req.params.email.toLowerCase();

    const student = students.find(
        item => item.email === email
    );

    if (!student) {
        return res.status(404).json({
            message: "Student with this email was not found."
        });
    }

    res.status(200).json(student);
});

// 6. READ ALL IN A CATEGORY: Get students by course
app.get("/students/course/:course", (req, res) => {
    const course = req.params.course.toLowerCase();

    const result = students.filter(
        student => student.course.toLowerCase() === course
    );

    res.status(200).json(result);
});

// 3b. READ ONE: Get student by ID
app.get("/students/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid student ID."
        });
    }

    const student = students.find(item => item.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Student not found."
        });
    }

    res.status(200).json(student);
});

// 4. UPDATE: Update student by ID
app.put("/students/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid student ID."
        });
    }

    const index = students.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Student not found."
        });
    }

    const error = validateStudent(req.body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    if (emailExists(req.body.email, id)) {
        return res.status(409).json({
            message: "Another student already uses this email."
        });
    }

    students[index] = {
        id,
        email: req.body.email.trim().toLowerCase(),
        name: req.body.name.trim(),
        age: req.body.age,
        course: req.body.course.trim()
    };

    res.status(200).json({
        message: "Student updated successfully",
        student: students[index]
    });
});

// 5. DELETE: Delete student by ID
app.delete("/students/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid student ID."
        });
    }

    const index = students.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Student not found."
        });
    }

    const deletedStudent = students.splice(index, 1)[0];

    res.status(200).json({
        message: "Student deleted successfully",
        student: deletedStudent
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
