const path = require('path')
const envPath = path.resolve(process.cwd(), '.env.local')

console.log({ envPath })

require('dotenv').config({ path: envPath })

const mysql = require('serverless-mysql')

const db = mysql({
    config: {
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port:  process.env.DB_PORT,
    },
})

async function query(q) {
    try {
        const results = await db.query(q)
        await db.end()
        return results
    } catch (e) {
        throw Error(e.message)
    }
}

async function migrate() {
    try {
        await query(`
    CREATE TABLE IF NOT EXISTS SEMAINIERS (
     id INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID VARCHAR(200) NOT NULL,
    ORDER_ID VARCHAR(200) NOT NULL,
    FIRST_NAME VARCHAR(200),
    NAME VARCHAR(200),
    MEALS JSON,
    PRIMARY KEY(id)
    )
    `)
        console.log('migration ran successfully')
    } catch (e) {
        console.error('could not run migration, double check your credentials.')
        process.exit(1)
    }
}

// Create "entries" table if doesn't exist


migrate().then(() => process.exit())
