import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrGenerateMovieFact } from "@/lib/facts";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId, favoriteMovie } = session.user;

  if (!favoriteMovie) {
    return NextResponse.json({ error: "No favorite movie set." }, { status: 400 });
  }

  try {
    const fact = await getOrGenerateMovieFact(userId, favoriteMovie);
    return NextResponse.json({ fact });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch fact." }, { status: 500 });
  }
}
