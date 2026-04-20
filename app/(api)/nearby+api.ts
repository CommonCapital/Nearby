import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const queryLat = url.searchParams.get("lat");
    const queryLng = url.searchParams.get("lng");
    const filter = url.searchParams.get("filter"); 
    
    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    
    // Auto-Migration: Identity Mesh Expansion
    try {
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_id_idx ON users (clerk_id)`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS orientation TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS interested_in TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url TEXT`;
    } catch (migErr) {
      console.error("Migration warning (safe to ignore):", migErr);
    }
    
    let lat: number;
    let lng: number;

    if (queryLat && queryLng) {
      lat = parseFloat(queryLat);
      lng = parseFloat(queryLng);
    } else {
      const [currentUser] = await sql`SELECT latitude, longitude FROM users WHERE clerk_id = ${userId}`;
      if (!currentUser || !currentUser.latitude || !currentUser.longitude) {
         return Response.json({ data: [] }); 
      }
      lat = currentUser.latitude;
      lng = currentUser.longitude;
    }

    // Search radius: ~150-200m (0.0015 degrees)
    const latOffset = 0.0015;
    const lngOffset = 0.0015;

    // Filter Logic: Matches either gender OR orientation to be inclusive
    let nearbyUsers;
    if (filter && filter !== 'Everyone') {
      nearbyUsers = await sql`
        SELECT id, clerk_id, name, bio, gender, orientation, age, interested_in, image_url, latitude, longitude 
        FROM users 
        WHERE is_visible = true 
        AND clerk_id != ${userId}
        AND (gender = ${filter} OR orientation = ${filter})
        AND latitude BETWEEN ${lat - latOffset} AND ${lat + latOffset}
        AND longitude BETWEEN ${lng - lngOffset} AND ${lng + lngOffset}
      `;
    } else {
      nearbyUsers = await sql`
        SELECT id, clerk_id, name, bio, gender, orientation, age, interested_in, image_url, latitude, longitude 
        FROM users 
        WHERE is_visible = true 
        AND clerk_id != ${userId}
        AND latitude BETWEEN ${lat - latOffset} AND ${lat + latOffset}
        AND longitude BETWEEN ${lng - lngOffset} AND ${lng + lngOffset}
      `;
    }

    return Response.json({ data: nearbyUsers });
  } catch (error) {
    console.error("Error fetching nearby users:", error);
    return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    // Auto-Migration / Schema Validation
    try {
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_id_idx ON users (clerk_id)`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS orientation TEXT`;
      await sql`
        CREATE TABLE IF NOT EXISTS approach_requests (
          id SERIAL PRIMARY KEY,
          sender_clerk_id TEXT NOT NULL,
          receiver_clerk_id TEXT NOT NULL,
          note TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } catch (migErr) {
      console.error("Migration warning (safe to ignore if schema exists):", migErr);
    }

    const { userId, name, email, latitude, longitude, isVisible, bio, gender, orientation, age, interestedIn, imageUrl } = await request.json();

    if (!userId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const visibilityValue = isVisible !== undefined ? isVisible : true;

    // Upsert Identity Profile
    const response = await sql`
      INSERT INTO users (
        name, 
        email, 
        clerk_id, 
        latitude, 
        longitude, 
        is_visible,
        bio,
        gender,
        orientation,
        age,
        interested_in,
        image_url
      ) 
      VALUES (
        ${name || 'Nearby User'}, 
        ${email || ''}, 
        ${userId}, 
        ${latitude}, 
        ${longitude}, 
        ${visibilityValue},
        ${bio || ''},
        ${gender || ''},
        ${orientation || ''},
        ${age || null},
        ${interestedIn || ''},
        ${imageUrl || ''}
      )
      ON CONFLICT (clerk_id) 
      DO UPDATE SET 
        latitude = EXCLUDED.latitude, 
        longitude = EXCLUDED.longitude,
        is_visible = EXCLUDED.is_visible,
        name = COALESCE(EXCLUDED.name, users.name),
        email = COALESCE(EXCLUDED.email, users.email),
        bio = COALESCE(EXCLUDED.bio, users.bio),
        gender = COALESCE(EXCLUDED.gender, users.gender),
        orientation = COALESCE(EXCLUDED.orientation, users.orientation),
        age = COALESCE(EXCLUDED.age, users.age),
        interested_in = COALESCE(EXCLUDED.interested_in, users.interested_in),
        image_url = COALESCE(EXCLUDED.image_url, users.image_url)
      RETURNING id, clerk_id;
    `;

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error) {
    console.error("Error updating location:", error);
    return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
