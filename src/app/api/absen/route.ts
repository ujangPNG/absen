import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendances, users } from "@/lib/db/schema";
import { s3Client, bucketName } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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
    
    if (body.photoUrl && body.photoUrl.startsWith('data:image/')) {
      const base64Data = body.photoUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const date = new Date().toISOString().split('T')[0];
      const filename = `date-${date}/user-${body.userId}/${body.userId}|${timestamp}.jpg`;
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      });

      await s3Client.send(command);

      const endpoint = process.env.MINIO_ENDPOINT;
      const port = process.env.MINIO_PORT;
      const useSsl = process.env.MINIO_USE_SSL === 'true';
      const protocol = useSsl ? 'https' : 'http';
      blobUrl = `${protocol}://${endpoint}:${port}/${bucketName}/${filename}`;
    }

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const jakartaTime = dayjs.utc(Date.now()).tz('Asia/Jakarta').format();

    const result = await db.insert(attendances).values({
      userId: body.userId,
      latitude: body.latitude,
      longitude: body.longitude,
      timestamp:jakartaTime,
      photoBlobUrl: blobUrl,
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

import { sql, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }
    
    const allAttendances = await db
    .select({
      id: attendances.id,
      userName: users.name,
      timestamp: attendances.timestamp,
      photoBlobUrl: attendances.photoBlobUrl,
      address: attendances.address,
    })
    .from(attendances)
    .leftJoin(users, eq(attendances.userId, users.id))
    .where(sql`DATE(attendances.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = ${date}`)
    .orderBy(attendances.id);

    return NextResponse.json(allAttendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch attendance',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}