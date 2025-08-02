
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function loginUser(input: LoginInput): Promise<{ user: { id: number; email: string; first_name: string; last_name: string; is_admin: boolean } } | null> {
  try {
    // Find user by email
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .execute();

    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return null;
    }

    // In a real implementation, you would verify the password hash here
    // For now, we'll do a simple comparison (this is NOT secure for production)
    // Real implementation should use bcrypt.compare(input.password, user.password_hash)
    if (input.password !== user.password_hash) {
      return null;
    }

    // Update last_login timestamp
    await db.update(usersTable)
      .set({ 
        last_login: new Date(),
        updated_at: new Date()
      })
      .where(eq(usersTable.id, user.id))
      .execute();

    // Return user data without sensitive information
    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin
      }
    };
  } catch (error) {
    console.error('User login failed:', error);
    throw error;
  }
}
