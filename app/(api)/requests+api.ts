import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    
    // Fetch pending requests where the current user is the receiver
    const pendingRequests = await sql`
      SELECT r.*, u.name as sender_name 
      FROM approach_requests r
      JOIN users u ON r.sender_clerk_id = u.clerk_id
      WHERE r.receiver_clerk_id = ${userId} AND r.status = 'pending'
      ORDER BY r.created_at DESC
    `;

    // Fetch accepted friendships (both ways)
    const friends = await sql`
      SELECT DISTINCT 
        u.clerk_id, u.name, u.latitude, u.longitude
      FROM approach_requests r
      JOIN users u ON (u.clerk_id = r.sender_clerk_id OR u.clerk_id = r.receiver_clerk_id)
      WHERE 
        (r.sender_clerk_id = ${userId} OR r.receiver_clerk_id = ${userId})
        AND r.status = 'accepted'
        AND u.clerk_id != ${userId}
    `;

    return Response.json({ pending: pendingRequests, friends });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { senderId, receiverId, note } = await request.json();

    if (!senderId || !receiverId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await sql`
      INSERT INTO approach_requests (sender_clerk_id, receiver_clerk_id, note, status) 
      VALUES (${senderId}, ${receiverId}, ${note}, 'pending')
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { requestId, status } = await request.json(); // status: 'accepted', 'declined', 'blocked'

    if (!requestId || !status) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const response = await sql`
      UPDATE approach_requests 
      SET status = ${status}
      WHERE id = ${requestId}
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error) {
    console.error("Error updating request:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
