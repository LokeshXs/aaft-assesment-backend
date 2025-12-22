import pool from "../db";

async function seedUsers() {
  const users = [
    {
      name: "Amit",
      email: "amit@gmail.com",
    },
    {
      name: "Rahul",
      email: "rahul@gmail.com",
    },
    {
      name: "Priya",
      email: "priya@gmail.com",
    },
    {
      name: "Sneha",
      email: "sneha@gmail.com",
    },
    {
      name: "Rohit",
      email: "rohit@gmail.com",
    },
    {
      name: "Anjali",
      email: "anjali@gmail.com",
    },
    {
      name: "Vikram",
      email: "vikram@gmail.com",
    },
    {
      name: "Neha",
      email: "neha@gmail.com",
    },
    {
      name: "Arjun",
      email: "arjun@gmail.com",
    },
    {
      name: "Kavya",
      email: "kavya@gmail.com",
    },
  ];

  const tableCreationQuery = `
  CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
  );
  `;
  const insertQuery = `
  INSERT INTO users (name, email) VALUES ($1, $2);
  `;

  try {
    await pool.connect();
    await pool.query(tableCreationQuery);

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      await pool.query(insertQuery, [user?.name, user?.email]);
    }

    console.log("🌱 users seeded successfully!");
  } catch (err) {
    console.error(err);
    console.error("Seeding users failed!");
  } finally {
    process.exit(1);
  }
}

async function main() {
  await seedUsers();
}

main();
