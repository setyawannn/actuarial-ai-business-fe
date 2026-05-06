import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear the cookies
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  // Optionally call backend /auth/logout if required by API

  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
