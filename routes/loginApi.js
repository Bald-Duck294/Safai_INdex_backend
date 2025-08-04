import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient.mjs";
const loginRoute = express.Router();

// Register API - POST /api/auth/register
loginRoute.post("/register", async (req, res) => {
  const { name, email, phone, password, age } = req.body;

  if (!name || !email || !phone || !password || !age) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.cleaner_user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        age: parseInt(age, 10), // Ensure age is an integer
      },
    });

    // Convert BigInt to string for JSON serialization
    res
      .status(201)
      .json({ message: "User  registered", userId: user.id.toString() });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "User  registration failed." });
  }
});

// Login API - POST /api/auth/login
loginRoute.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required." });
  }

  try {
    const user = await prisma.cleaner_user.findUnique({ where: { phone } });

    if (!user) {
      return res.status(404).json({ error: "User  not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // For simplicity, return basic info (in production use JWT)
    res.json({
      message: "Login successful",
      user: {
        id: user.id.toString(), // Convert BigInt to string
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        role_id: user.role_id,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

export default loginRoute;
