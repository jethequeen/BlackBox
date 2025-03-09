const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await new Promise((resolve, reject) => {
      global.db.get("SELECT * FROM Accounts WHERE Username = ? OR Email = ?", [username, email],
        (err, row) => {
          if (err) {
            console.error("Database Error (Checking User Exists):", err.message);
            return reject(err);
          }
          resolve(row);
        }
      );
    });

    if (existingUser) {
      console.warn("Signup Failed: Username or Email already exists");
      return res.status(400).json({ error: "Username or email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await new Promise((resolve, reject) => {
      global.db.run(
        "INSERT INTO Accounts (Username, Email, PasswordHash) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err) => {
          if (err) {
            console.error("Database Error (Inserting User):", err.message);
            return reject(err);
          }
          resolve();
        }
      );
    });

    res.json({ message: "Signup successful. Please log in." });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await new Promise((resolve, reject) => {
      global.db.get("SELECT * FROM Accounts WHERE Username = ?", [username],
        (err, row) => {
          if (err) {
            console.error("Database Error (Finding User):", err.message);
            return reject(err);
          }
          resolve(row);
        }
      );
    });

    if (!user) {
      console.warn("Login Failed: User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!(await bcrypt.compare(password, user.PasswordHash))) {
      console.warn("Login Failed: Incorrect Password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = crypto.randomBytes(64).toString("hex");
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await new Promise((resolve, reject) => {
      global.db.run(
        "INSERT INTO Sessions (SessionID, AccountID, Expiry) VALUES (?, ?, ?)",
        [token, user.AccountID, expiry.toISOString()],
        (err) => {
          if (err) {
            console.error("Database Error (Creating Session):", err.message);
            return reject(err);
          }
          resolve();
        }
      );
    });

    res.cookie("sessionToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ message: "Login successful", redirect: "/" });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies.sessionToken;

  if (token) {
    await new Promise((resolve, reject) => {
      global.db.run("DELETE FROM Sessions WHERE SessionID = ?", [token],
        (err) => {
          if (err) {
            console.error("Database Error (Logout):", err.message);
            return reject(err);
          }
          resolve();
        }
      );
    });
  }

  res.clearCookie("sessionToken");
  res.redirect("/login.html");
});

module.exports = router;
