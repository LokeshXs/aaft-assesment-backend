import pool from "../db";

async function createUsersTable() {
  await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
            );
        
        `);
}

async function createLeadsTable() {
  await pool.query(`
            CREATE TABLE IF NOT EXISTS leads(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL,
            phone VARCHAR(20) NOT  NULL,
            source VARCHAR(50) NOT NULL,
            status VARCHAR(20) NOT NULL,
            assigned_to INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT NOW()
            );
        `);
}

async function createActivitiesTable() {
  await pool.query(`
        
        CREATE TABLE IF NOT EXISTS lead_activities(
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        description TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
        );
        
        `);
}

export async function initializeDB() {
  try {
    await createUsersTable();
    await createLeadsTable();
    await createActivitiesTable();
  } catch {
    throw new Error("Tables creation failed!");
  }
}
