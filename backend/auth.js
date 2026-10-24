const crypto = require("crypto");
const { sendJSON } = require("./utils");

const sessions = new Map();
const SESSION_TIME = 30 * 60 * 1000;

function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");

  sessions.set(token, {
    userId: user._id.toString(),
    role: user.role,
    expiresAt: Date.now() + SESSION_TIME
  });

  return token;
}

function getToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7);
}

function requireAuth(req, res) {
  const token = getToken(req);

  if (!token) {
    sendJSON(res, 401, {
      message: "Login required"
    });
    return null;
  }

  const session = sessions.get(token);

  if (!session) {
    sendJSON(res, 401, {
      message: "Invalid session"
    });
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);

    sendJSON(res, 401, {
      message: "Session expired"
    });

    return null;
  }

  return {
    ...session,
    token
  };
}

function requireRole(req, res, role) {
  const session = requireAuth(req, res);

  if (!session) {
    return null;
  }

  if (session.role !== role) {
    sendJSON(res, 403, {
      message: "Access denied"
    });

    return null;
  }

  return session;
}

function destroySession(token) {
  sessions.delete(token);
}

module.exports = {
  createSession,
  requireAuth,
  requireRole,
  destroySession
};
