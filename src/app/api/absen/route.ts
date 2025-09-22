import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendances } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = await db.insert(attendances).values({
    userId: body.userId,
    latitude: body.latitude,
    longitude: body.longitude,
    photoUrl: body.photoUrl,
  }).returning();

  return NextResponse.json(result);
}
