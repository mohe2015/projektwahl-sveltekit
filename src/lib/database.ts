import postgres from 'postgres'
import path from 'path'

export async function setup() {
    const sql = postgres("postgres://projektwahl:changeme@localhost/projektwahl")
    
    return await sql.file('src/lib/setup.sql', ["test"], {
        cache: false
    })
}
