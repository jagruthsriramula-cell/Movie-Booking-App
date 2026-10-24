const crypto = require("crypto");
const { ObjectId } = require("mongodb");

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body) {
        return resolve({});
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

function hashPassword(password) {
  return crypto
    .scryptSync(password, "movie-booking-salt", 64)
    .toString("hex");
}

function verifyPassword(password, storedHash) {
  return hashPassword(password) === storedHash;
}

function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
}

function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function validShowTimes(showTimes) {
  return (
    Array.isArray(showTimes) &&
    showTimes.length === 4 &&
    new Set(showTimes).size === 4 &&
    showTimes.every(
      time => typeof time === "string" && time.trim().length > 0
    )
  );
}

module.exports = {
  sendJSON,
  readBody,
  hashPassword,
  verifyPassword,
  toObjectId,
  isValidDate,
  validShowTimes
};
