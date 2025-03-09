const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const router = express.Router();

// ✅ Signup Route (With Debug Logs)
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  console.log("🔹 Received Signup Request:", { username, email });

  try {
    // ✅ Check if user exists
    const existingUser = await new Promise((resolve, reject) => {
      global.db.get("SELECT * FROM Accounts WHERE Username = ? OR Email = ?", [username, email],
        (err, row) => {
          if (err) {
            console.error("❌ Database Error (Checking User Exists):", err.message);
            return reject(err);
          }
          resolve(row);
        }
      );
    });

    if (existingUser) {
      console.warn("⚠️ Signup Failed: Username or Email already exists");
      return res.status(400).json({ error: "Username or email already taken" });
    }

    // ✅ Hash password
    console.log("🔹 Hashing Password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password Hashed Successfully");

    // ✅ Insert into database
    console.log("🔹 Inserting New User into Database...");
    await new Promise((resolve, reject) => {
      global.db.run(
        "INSERT INTO Accounts (Username, Email, PasswordHash) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err) => {
          if (err) {
            console.error("❌ Database Error (Inserting User):", err.message);
            return reject(err);
          }
          resolve();
        }
      );
    });

    console.log("✅ New User Created Successfully:", username);
    res.json({ message: "Signup successful. Please log in." });

  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Login Route (With Debug Logs)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("🔹 Received Login Request:", { username });

  try {
    // ✅ Find User
    const user = await new Promise((resolve, reject) => {
      global.db.get("SELECT * FROM Accounts WHERE Username = ?", [username],
        (err, row) => {
          if (err) {
            console.error("❌ Database Error (Finding User):", err.message);
            return reject(err);
          }
          resolve(row);
        }
      );
    });

    if (!user) {
      console.warn("⚠️ Login Failed: User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Verify Password
    console.log("🔹 Verifying Password...");
    if (!(await bcrypt.compare(password, user.PasswordHash))) {
      console.warn("⚠️ Login Failed: Incorrect Password");
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log("✅ Password Verified Successfully");

    // ✅ Generate Session Token
    const token = crypto.randomBytes(64).toString("hex");
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    console.log("🔹 Inserting New Session for User...");
    await new Promise((resolve, reject) => {
      global.db.run(
        "INSERT INTO Sessions (SessionID, AccountID, Expiry) VALUES (?, ?, ?)",
        [token, user.AccountID, expiry.toISOString()],
        (err) => {
          if (err) {
            console.error("❌ Database Error (Creating Session):", err.message);
            return reject(err);
          }
          resolve();
        }
      );
    });

    // ✅ Set Session Cookie
    res.cookie("sessionToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    console.log("✅ Login Successful for:", username);
    res.json({ message: "Login successful", redirect: "/" });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Logout Route
router.post("/logout", async (req, res) => {
  const token = req.cookies.sessionToken;
  console.log("🔹 Logout Request Received");

  if (token) {
    await new Promise((resolve, reject) => {
      global.db.run("DELETE FROM Sessions WHERE SessionID = ?", [token],
        (err) => {
          if (err) {
            console.error("❌ Database Error (Logout):", err.message);
            return reject(err);
          }
          resolve();
        }
      );
    });
  }

  res.clearCookie("sessionToken");
  console.log("✅ User Logged Out Successfully");
  res.redirect("/login.html");
});

module.exports = router;
