const { connectDB, closeDB } = require("./db");
const { hashPassword } = require("./utils");

async function seed() {
  const db = await connectDB();

  await db.collection("bookings").deleteMany({});
  await db.collection("movies").deleteMany({});
  await db.collection("users").deleteMany({});

  const result = await db.collection("users").insertMany([
    {
      name: "Demo User",
      email: "user@test.com",
      passwordHash: hashPassword("user123"),
      role: "user"
    },
    {
      name: "ABC Theater",
      email: "theater@test.com",
      passwordHash: hashPassword("theater123"),
      role: "theater"
    }
  ]);

  const theaterId = result.insertedIds[1];

  await db.collection("movies").insertMany([
    {
      theaterId,
      title: "Interstellar",
      language: "English",
      duration: 169,
      showTimes: ["10:00", "13:30", "17:00", "20:30"]
    },
    {
      theaterId,
      title: "Inception",
      language: "English",
      duration: 148,
      showTimes: ["09:30", "12:30", "16:00", "19:30"]
    }
  ]);

  console.log("Database seeded");
  console.log("User: user@test.com / user123");
  console.log("Theater: theater@test.com / theater123");
}

seed()
  .catch(console.error)
  .finally(closeDB);
