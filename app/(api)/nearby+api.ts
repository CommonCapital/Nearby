import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    
    // In a real postGIS setup we'd use ST_DWithin. 
    // Here we'll do an approximate bounding box calculation for 100m, but since we are just returning all visible users for MVP, let's just fetch all visible other users and let client filter, OR do simple bounding box in SQL:
    // Approximately 100m is ~0.0009 degrees.
    
    // First get current user's location
    const [currentUser] = await sql`SELECT latitude, longitude FROM users WHERE clerk_id = ${userId}`;
    
    if (!currentUser || !currentUser.latitude || !currentUser.longitude) {
       return Response.json({ data: [] }); // User hasn't set location yet
    }

    const lat = currentUser.latitude;
    const lng = currentUser.longitude;
    
    // Simple bounding box for 100m (very rough approximation for MVP)
    const latOffset = 0.0009;
    const lngOffset = 0.0009;

    const nearbyUsers = await sql`
      SELECT id, clerk_id, name, latitude, longitude 
      FROM users 
      WHERE is_visible = true 
      AND clerk_id != ${userId}
      AND latitude BETWEEN ${lat - latOffset} AND ${lat + latOffset}
      AND longitude BETWEEN ${lng - lngOffset} AND ${lng + lngOffset}
    `;

    return Response.json({ data: nearbyUsers });
  } catch (error) {
    console.error("Error fetching nearby users:", error);
    return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { userId, latitude, longitude, isVisible } = await request.json();

    if (!userId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const visibilityValue = isVisible !== undefined ? isVisible : true;

    // Update the user's location
    const response = await sql`
      UPDATE users 
      SET 
        latitude = ${latitude}, 
        longitude = ${longitude},
        is_visible = ${visibilityValue}
      WHERE clerk_id = ${userId}
      RETURNING id, clerk_id, latitude, longitude, is_visible;
    `;

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error) {
    console.error("Error updating location:", error);
    return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
