const { neon } = require("@neondatabase/serverless");

async function inspectSchema() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'approach_requests'
    `;
    console.log("approach_requests columns:");
    console.table(columns);

    const userColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
    console.log("\nusers columns:");
    console.table(userColumns);

  } catch (e) {
    console.error("Schema Inspection Error:", e);
  }
}

inspectSchema();
