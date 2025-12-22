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

  const query = `
  INSERT INTO users (name, email) VALUES ($1, $2);
  `;
  try {
    await pool.connect();

    users.forEach(async (user) => {
      await pool.query(query, [user.name, user.email]);
    });

    console.log("🌱 users seeded successfully!");
   
  } catch {
    console.error("Seeding users failed!");
  }finally{
     process.exit(1);
  }
}



async function main(){

    await seedUsers();
}

main();
