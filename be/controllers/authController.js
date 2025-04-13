// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing

export const register = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ message: "Email, password, and username are required" });
  }

  try {
    // 1. Check if user already exists (by email or username)
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle(); // Returns one or null

    if (findError && findError.code !== "PGRST116") {
      // Ignore 'PGRST116' (No rows found)
      console.error("Error checking existing user:", findError);
      return res.status(500).json({ message: "Database error checking user" });
    }
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email or username already exists" });
    }

    // 2. Hash the password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{ email, password_hash, username }])
      .select("id, email, username, created_at") // Select the data to return
      .single(); // Expecting a single row inserted

    if (insertError) {
      console.error("Error inserting user:", insertError);
      return res.status(500).json({ message: "Error creating user" });
    }

    // Don't send password hash back
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during registration" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // 1. Find user by email
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, email, username, password_hash")
      .eq("email", email)
      .single(); // Expecting one user or null/error

    if (findError && findError.code !== "PGRST116") {
      console.error("Error finding user:", findError);
      return res.status(500).json({ message: "Database error during login" });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" }); // User not found
    }

    // 2. Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" }); // Password doesn't match
    }

    // 3. Generate JWT
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" }); // Token expires in 1 month

    // Remove password hash before sending user data
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      ...userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
};

export const me = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: "User id not found" });
  }

  try {
    // 1. Find user by id
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, email, username, password_hash")
      .eq("id", userId)
      .single(); // Expecting one user or null/error

    if (findError && findError.code !== "PGRST116") {
      console.error("Error finding user:", findError);
      return res.status(500).json({ message: "Database error" });
    }
    if (!user) {
      return res.status(401).json({ message: "User not found" }); // User not found
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(" error:", error);
    res.status(500).json({ message: "Internal server error during " });
  }
};
