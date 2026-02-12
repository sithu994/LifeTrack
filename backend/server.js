
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

// Models
const Task = require('./models/Task');
const User = require('./models/User');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/test', (req, res) => res.send("System is Online!"));

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LifeTrackDB')
    .then(() => console.log('✅ MongoDB Connected Locally'))
    .catch(err => console.log('❌ DB Connection Error:', err));

// --- Email Config (Nodemailer) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email 
const sendAlertEmail = (contactEmail, userName, taskName) => {
    const mailOptions = {
        from: `LifeTrack <${process.env.EMAIL_USER}>`,
        to: contactEmail,
        subject: `LifeTrack Alert: ${userName} Completed a Task`,
        text: `Hello, \n\n${userName} has successfully completed the task: "${taskName}".`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log("❌ Email Error:", error);
        else console.log("📧 Email Sent: " + info.response);
    });
};

// --- Validation Helpers ---
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// --- AUTH ROUTES ---

// 1. User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, emergencyContact } = req.body;

        // Basic Validation
        if (!name || !email || !password || !emergencyContact) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        if (!isValidEmail(emergencyContact)) {
            return res.status(400).json({ error: "Invalid emergency contact email" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        const newUser = new User({ name, email, password, emergencyContact });
        await newUser.save();
        res.status(201).json({ message: "User Registered Successfully!", userId: newUser._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        res.json({ message: "Login Successful", userId: user._id, name: user.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- TASK ROUTES ---

// 3. Add Task
app.post('/api/tasks', async (req, res) => {
    try {
        const { userId, title, category, time } = req.body;
        const newTask = new Task({ userId, title, category, time });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get User Tasks
app.get('/api/tasks/:userId', async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.params.userId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Mark Task as Done & Send Email
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { isCompleted: true },
            { new: true }
        );

        if (!updatedTask) return res.status(404).json({ message: "Task not found" });

        // User ge emergency contact eka hoyagena email ekak yawamu
        const user = await User.findById(updatedTask.userId);
        if (user && user.emergencyContact) {
            sendAlertEmail(user.emergencyContact, user.name, updatedTask.title);
        }

        res.json({ message: "Task completed and email sent!", task: updatedTask });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Delete Task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Server Start
const PORT = 5001; // 5000 nathiwa 5001 danna
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});