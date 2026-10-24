const { MongoClient } = require("mongodb");

const MONGO_URL = "mongodb://127.0.0.1:27017";
const DB_NAME = "movie_booking_db";

let client;
let db;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(MONGO_URL);
  await client.connect();

  db = client.db(DB_NAME);

  await db.collection("users").createIndex(
    { email: 1 },
    { unique: true }
  );

  await db.collection("bookings").createIndex(
    { movieId: 1, date: 1, showTime: 1, seatNo: 1 },
    { unique: true }
  );

  console.log("MongoDB connected");
  return db;
}

function getDB() {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
  }
}

module.exports = {
  connectDB,
  getDB,
  closeDB
};
