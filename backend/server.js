const http = require("http");

const {
  connectDB,
  getDB
} = require("./db ");

const {
  sendJSON,
  readBody,
  verifyPassword,
  toObjectId,
  isValidDate,
  validShowTimes
} = require("./utils");

const {
  createSession,
  requireAuth,
  requireRole,
  destroySession
} = require("./auth");

const PORT = 3000;

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const db = getDB();

  try {
    // ==================== ROOT ====================
    if (req.method === "GET" && path === "/") {
      return sendJSON(res, 200, { message: "Server running" });
    }
  } catch (error) {
    console.error(error);
    sendJSON(res, 500, { error: "Internal server error" });
  }



    // LOGIN
    if (req.method === "POST" && path === "/login") {
      const { email, password } = await readBody(req);

      const user = await db.collection("users").findOne({ email: email });

      // CHANGED: previously used verifyPassword; now simplified to plain text check
      if (!user || user.password !== verifyPassword(password,user.password)) {
        return sendJSON(res, 401, { error: "Invalid email or password" });
      }

      const token = createSession(user);

      // NEW: set cookie instead of returning token in JSON
      setSessionCookie(res, token);

      return sendJSON(res, 200, {
        message: "Login successful",
        role: user.role,
        name: user.name
      });
    }

    // LOGOUT
   if (req.method === "POST" && path === "/logout") {
      const session = requireAuth(req, res);
      if (!session) return;

      // NEW: delete session from memory
      deleteSession(session.token);

      // NEW: clear cookie instead of just returning JSON
      clearSessionCookie(res);

      return sendJSON(res, 200, { message: "Logout successful" });
    }
  }

async function startServer() {
  await connectDB();

  const server = http.createServer(handleRequest);

  server.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  });
}

startServer().catch(console.error);
