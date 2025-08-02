
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput } from '../schema';
import { loginUser } from '../handlers/login_user';
import { eq } from 'drizzle-orm';

const testUser = {
  email: 'test@example.com',
  password_hash: 'test123', // In real app, this would be a hashed password
  first_name: 'John',
  last_name: 'Doe',
  username: 'johndoe',
  avatar_url: null,
  is_admin: false,
  is_active: true
};

const testInput: LoginInput = {
  email: 'test@example.com',
  password: 'test123'
};

describe('loginUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should login user with correct credentials', async () => {
    // Create test user
    await db.insert(usersTable).values(testUser).execute();

    const result = await loginUser(testInput);

    expect(result).not.toBeNull();
    expect(result!.user.email).toEqual('test@example.com');
    expect(result!.user.first_name).toEqual('John');
    expect(result!.user.last_name).toEqual('Doe');
    expect(result!.user.is_admin).toEqual(false);
    expect(result!.user.id).toBeDefined();
    expect(typeof result!.user.id).toBe('number');
  });

  it('should return null for non-existent user', async () => {
    const result = await loginUser(testInput);

    expect(result).toBeNull();
  });

  it('should return null for incorrect password', async () => {
    // Create test user
    await db.insert(usersTable).values(testUser).execute();

    const wrongPasswordInput: LoginInput = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const result = await loginUser(wrongPasswordInput);

    expect(result).toBeNull();
  });

  it('should return null for inactive user', async () => {
    // Create inactive test user
    await db.insert(usersTable).values({
      ...testUser,
      is_active: false
    }).execute();

    const result = await loginUser(testInput);

    expect(result).toBeNull();
  });

  it('should update last_login timestamp on successful login', async () => {
    // Create test user
    const insertResult = await db.insert(usersTable).values(testUser).returning().execute();
    const userId = insertResult[0].id;

    // Record time before login
    const beforeLogin = new Date();

    await loginUser(testInput);

    // Check that last_login was updated
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].last_login).toBeInstanceOf(Date);
    expect(users[0].last_login!.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    expect(users[0].updated_at.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
  });

  it('should not return sensitive user information', async () => {
    // Create test user
    await db.insert(usersTable).values(testUser).execute();

    const result = await loginUser(testInput);

    expect(result).not.toBeNull();
    // Should not contain password_hash or other sensitive fields
    expect((result!.user as any).password_hash).toBeUndefined();
    expect((result!.user as any).username).toBeUndefined();
    expect((result!.user as any).avatar_url).toBeUndefined();
    expect((result!.user as any).last_login).toBeUndefined();
    expect((result!.user as any).created_at).toBeUndefined();
    expect((result!.user as any).updated_at).toBeUndefined();
  });

  it('should login admin user correctly', async () => {
    // Create admin user
    await db.insert(usersTable).values({
      ...testUser,
      email: 'admin@example.com',
      is_admin: true
    }).execute();

    const adminInput: LoginInput = {
      email: 'admin@example.com',
      password: 'test123'
    };

    const result = await loginUser(adminInput);

    expect(result).not.toBeNull();
    expect(result!.user.is_admin).toEqual(true);
    expect(result!.user.email).toEqual('admin@example.com');
  });
});
