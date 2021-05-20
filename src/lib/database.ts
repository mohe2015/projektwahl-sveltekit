import postgres from 'postgres'

export async function setup() {
    const sql = postgres("postgres://projektwahl:changeme@localhost/projektwahl")

    return await sql`SELECT 1`
}
