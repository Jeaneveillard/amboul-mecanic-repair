const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Convertit les ? SQLite en $1, $2... PostgreSQL
function toPg(sql) {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
}

const db = {
    get: async (sql, params = []) => {
        const result = await pool.query(toPg(sql), params);
        return result.rows[0] || null;
    },
    all: async (sql, params = []) => {
        const result = await pool.query(toPg(sql), params);
        return result.rows;
    },
    run: async (sql, params = []) => {
        let query = toPg(sql);
        // Ajoute RETURNING id aux INSERT pour récupérer l'ID créé
        if (sql.trim().toUpperCase().startsWith('INSERT') && !query.toUpperCase().includes('RETURNING')) {
            query += ' RETURNING id';
        }
        const result = await pool.query(query, params);
        return {
            changes: result.rowCount,
            lastID:  result.rows[0]?.id,
        };
    }
};

async function getDb() {
    return db;
}

async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id            SERIAL PRIMARY KEY,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at    TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    console.log('✅ Table users PostgreSQL prête');
}

module.exports = { getDb, initDb };
