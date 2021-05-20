import postgres from 'postgres'
import path from 'path'

export async function setup() {
    const sql = postgres("postgres://projektwahl:changeme@localhost/projektwahl")
    
    await sql.begin(async sql => {
        await sql.file('src/lib/setup.sql', null, {
            cache: false
        })
        await sql`INSERT INTO users (name, password_hash, type) VALUES ('admin', ${"hi"}, 'admin') ON CONFLICT DO NOTHING;`
    })

    return {
        
    }
}
