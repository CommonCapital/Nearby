import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const user1 = url.searchParams.get("userId");
    const user2 = url.searchParams.get("otherId");
    
    if (!user1 || !user2) {
      return Response.json({ error: "Missing user IDs" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    
    // Fetch messages between these two users
    const messages = await sql`
      SELECT * FROM messages 
      WHERE (sender_clerk_id = ${user1} AND receiver_clerk_id = ${user2})
         OR (sender_clerk_id = ${user2} AND receiver_clerk_id = ${user1})
      ORDER BY created_at ASC
    `;

    return Response.json({ data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { senderId, receiverId, content } = await request.json();

    if (!senderId || !receiverId || !content) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check total messages to enforce the 3 messages maximum restriction
    const messageCountResult = await sql`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE (sender_clerk_id = ${senderId} AND receiver_clerk_id = ${receiverId})
         OR (sender_clerk_id = ${receiverId} AND receiver_clerk_id = ${senderId})
    `;
    
    if (parseInt(messageCountResult[0].count) >= 3) {
      return Response.json({ error: "Maximum limit of 3 messages reached for this chat." }, { status: 403 });
    }

    const response = await sql`
      INSERT INTO messages (sender_clerk_id, receiver_clerk_id, content) 
      VALUES (${senderId}, ${receiverId}, ${content})
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
