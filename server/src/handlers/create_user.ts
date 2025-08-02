
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type User } from '../schema';
import { eq } from 'drizzle-orm';

export const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    // Check if email already exists
    const existingEmail = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .execute();

    if (existingEmail.length > 0) {
      throw new Error('Email already exists');
    }

    // Check if username already exists (if provided)
    if (input.username) {
      const existingUsername = await db.select()
        .from(usersTable)
        .where(eq(usersTable.username, input.username))
        .execute();

      if (existingUsername.length > 0) {
        throw new Error('Username already exists');
      }
    }

    // Hash password (simple hash for demo - in production use bcrypt/scrypt)
    const password_hash = `hashed_${input.password}`;

    // Insert user record
    const result = await db.insert(usersTable)
      .values({
        email: input.email,
        password_hash: password_hash,
        first_name: input.first_name,
        last_name: input.last_name,
        username: input.username || null,
        avatar_url: input.avatar_url || null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
};
