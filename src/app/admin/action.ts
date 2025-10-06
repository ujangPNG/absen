'use server'

import { db } from '@/lib/db';
import { users, attendances } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { s3Client as minioClient } from '@/lib/s3';

export async function addUser(data: { name: string }) {
  await db.insert(users).values({ name: data.name });
}

export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id));
}

export async function updateUser(id: number, data: { name: string }) {
  await db.update(users).set({ name: data.name }).where(eq(users.id, id));
}

export async function getUsers() {
  const allUsers = await db.select().from(users);
  return allUsers;
}

export async function getAttendances(date: string) {
  const allAttendances = await db
    .select({
      id: attendances.id,
      userName: users.name,
      timestamp: attendances.timestamp,
      photoBlobUrl: attendances.photoBlobUrl,
    })
    .from(attendances)
    .leftJoin(users, eq(attendances.userId, users.id))
    .where(sql`DATE(attendances.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') = ${date}`)
    .orderBy(attendances.id);
  return allAttendances;
}

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function getPresignedUrl(objectName: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.MINIO_BUCKET!,
      Key: objectName,
    });
    const presignedUrl = await getSignedUrl(minioClient, command, { expiresIn: 3600 });
    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
}