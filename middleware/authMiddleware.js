

async function authenticateUser(req, res, next) {
  const token = req.cookies.sessionToken;

  // ✅ Allow access to public routes
  const publicRoutes = ["/login.html", "/signup.html", "/api/login", "/api/signup", "/logout"];
  if (publicRoutes.includes(req.path) || req.path.startsWith("/public")) {
    return next();
  }

  if (!token) {
    return res.redirect("/login.html");
  }

  try {
    // ✅ Verify session from database
    const session = await new Promise((resolve, reject) => {
      global.db.get("SELECT * FROM Sessions WHERE SessionID = ? AND Expiry > CURRENT_TIMESTAMP",
        [token], (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (!session) {
      return res.redirect("/login.html");
    }

    req.user = await new Promise((resolve, reject) => {
      global.db.get("SELECT * FROM Accounts WHERE AccountID = ?", [session.AccountID],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });

    next(); // ✅ Proceed to protected routes
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.redirect("/login.html");
  }
}

module.exports = { authenticateUser };
