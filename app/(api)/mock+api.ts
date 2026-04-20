import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Add a slight offset to simulate a nearby user (~50 meters)
    const latOffset = (Math.random() - 0.5) * 0.0008;
    const lngOffset = (Math.random() - 0.5) * 0.0008;

    const mockLat = latitude + latOffset;
    const mockLng = longitude + lngOffset;
    const mockClerkId = `mock_${Math.random().toString(36).substring(7)}`;

    const response = await sql`
      INSERT INTO users (
        name, 
        email, 
        clerk_id,
        latitude,
        longitude,
        is_visible
      ) 
      VALUES (
        'Mock User', 
        ${mockClerkId + '@mock.com'},
        ${mockClerkId},
        ${mockLat},
        ${mockLng},
        true
     ) RETURNING *;`;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });
  } catch (error: any) {
    console.error("Error creating mock user:", error);
    return Response.json({ 
      error: "Internal Server Error", 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
