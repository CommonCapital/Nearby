const { neon } = require("@neondatabase/serverless");

async function checkDb() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC LIMIT 5`;
    console.log("Recent users:");
    console.table(users.map(u => ({
      name: u.name,
      clerk_id: u.clerk_id,
    })));

    const requests = await sql`SELECT * FROM approach_requests ORDER BY created_at DESC LIMIT 5`;
    console.log("\nRecent approach_requests:");
    console.table(requests.map(r => ({
      id: r.id,
      sender: r.sender_clerk_id,
      receiver: r.receiver_clerk_id,
      status: r.status,
      note: r.note
    })));
  } catch (e) {
    console.error("DB Error:", e);
  }
}

checkDb();
