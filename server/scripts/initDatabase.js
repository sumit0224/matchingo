const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

/**
 * Initializes the database by running the init_db.sql script.
 * This is designed to be safe to run multiple times (idempotent)
 * thanks to 'IF NOT EXISTS' in the SQL file.
 */
const initializeDatabase = async () => {
    console.log('🔄 Checking database initialization...');

    // 1. Create a pool to connect to the database
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false } // Required for Render production DB
    });

    try {
        // 2. Read the SQL file
        const sqlPath = path.join(__dirname, '..', 'init_db.sql');
        if (!fs.existsSync(sqlPath)) {
            console.warn('⚠️ init_db.sql not found, skipping initialization.');
            return;
        }
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // 3. Execute the SQL
        console.log('⚡ Running database schema sync...');
        await pool.query(sql);
        console.log('✅ Database initialized and schema verified!');
    } catch (err) {
        console.error('❌ Error initializing database:', err);
        // On a critical DB init failure, you might want to exit the process
        // so Render tries to restart it, or just log it and continue if partial failure is acceptable.
        // For now, we log and re-throw so index.js can decide.
        throw err;
    } finally {
        // 4. Close the pool to release the connection
        await pool.end();
    }
};

module.exports = initializeDatabase;
