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

    const identities = ['Straight Man', 'Straight Woman', 'Gay', 'Lesbian', 'Bi-sexual', 'A-sexual'];
    const bios = [
      "Digital nomad exploring the signal mesh.",
      "Seeking a spark in the imperial pulse.",
      "Lover of art, technology, and good coffee.",
      "Just passing through, transmitted a pulse.",
      "Tech enthusiast and creative soul.",
      "Looking for interesting connections nearby."
    ];

    const mockLat = latitude + (Math.random() - 0.5) * 0.002;
    const mockLng = longitude + (Math.random() - 0.5) * 0.002;
    const mockClerkId = `mock_${Math.random().toString(36).substring(7)}`;
    const mockGender = identities[Math.floor(Math.random() * identities.length)];
    const mockBio = bios[Math.floor(Math.random() * bios.length)];
    const mockAge = Math.floor(Math.random() * 27) + 18;
    const mockInterest = identities[Math.floor(Math.random() * identities.length)];

    const response = await sql`
      INSERT INTO users (
        name, 
        email, 
        clerk_id,
        latitude,
        longitude,
        is_visible,
        gender,
        bio,
        age,
        interested_in,
        image_url
      ) 
      VALUES (
        ${`Mock ${mockClerkId.slice(-4)}`}, 
        ${mockClerkId + '@mock.com'},
        ${mockClerkId},
        ${mockLat},
        ${mockLng},
        true,
        ${mockGender},
        ${mockBio},
        ${mockAge},
        ${mockInterest},
        ${`https://avatar.iran.liara.run/username?username=Mock+${mockClerkId.slice(-4)}`}
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
