const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const run = async () => {
    console.log('Starting database deployment...');

    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false } // Required for Render
    });

    try {
        const sqlPath = path.join(__dirname, '..', 'init_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing init_db.sql...');
        await pool.query(sql);
        console.log('Database initialized successfully!');
    } catch (err) {
        console.error('Error deploying database:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

run();
