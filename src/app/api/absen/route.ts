import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendances } from "@/lib/db/schema";
import { put } from "@vercel/blob";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("attendance_token");
  if (cookie) {
    return NextResponse.json(
      { error: "absen double ngapain jir" },
      { status: 409 }
    );
  }
  try {
    const body = await req.json();

    let blobUrl = '';
    
    // Upload foto ke Vercel Blob jika ada photoUrl (base64)
    if (body.photoUrl && body.photoUrl.startsWith('data:image/')) {
      // Convert base64 to buffer
      const base64Data = body.photoUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate filename dengan timestamp dan userId
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const date = new Date().toISOString().split('T')[0];
      const filename = `date-${date}/user-${body.userId}/${body.userId}|${timestamp}.jpg`;
      
      // Upload ke Vercel Blob
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: 'image/jpeg'
      });
      blobUrl = blob.url;
    }
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const jakartaTime = dayjs.utc(Date.now()).tz('Asia/Jakarta').format();

    // Simpan ke database
    const result = await db.insert(attendances).values({
      userId: body.userId,
      latitude: body.latitude,
      longitude: body.longitude,
      timestamp:jakartaTime,
      // photoUrl: body.photoUrl, // base64 string
      photoBlobUrl: blobUrl,   // blob URL
      accuracy: body.accuracy,
      address: body.address
    }).returning();

      const now = dayjs().tz("Asia/Jakarta");
      const expire = now.endOf("day"); 

      const res = NextResponse.json({
        success: true,
        data: result,
        blobUrl,
      });

      // Set cookie absen
      res.cookies.set("attendance_token", "1", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        expires: expire.toDate(),
      });

      return res;
    
  } catch (error) {
    console.error('Error in absen API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process attendance',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}