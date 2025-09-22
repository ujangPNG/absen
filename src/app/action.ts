// app/actions.ts
"use server";
import { neon } from "@neondatabase/serverless";
import 'dotenv/config';

export async function getData() {
    const url= process.env.DATABASE_URL;
    const sql = neon(url!);
    const data = await sql`...`;
    return data;
}