import type { User } from "@shared/schema";
import { randomUUID } from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return Buffer.from(password).toString("base64");
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

export function createUser(username: string, email: string, password: string, hashedPassword: string): User {
  return {
    id: randomUUID(),
    username,
    email,
    createdAt: new Date().toISOString(),
  };
}
