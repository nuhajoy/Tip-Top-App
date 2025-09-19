// app/api/employees/verify-token/route.js
export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token)
    return new Response(JSON.stringify({ error: "Token missing" }), {
      status: 400,
    });
  // Verify token in DB
  return new Response(
    JSON.stringify({ message: "Employee verified successfully" }),
    { status: 200 }
  );
}
