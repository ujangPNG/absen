'use server'

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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