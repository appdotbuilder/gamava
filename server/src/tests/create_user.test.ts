
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateUserInput = {
  email: 'test@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  username: 'johndoe',
  avatar_url: 'https://example.com/avatar.jpg'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with all fields', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.first_name).toEqual('John');
    expect(result.last_name).toEqual('Doe');
    expect(result.username).toEqual('johndoe');
    expect(result.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.password_hash).toEqual('hashed_password123');
    expect(result.is_admin).toEqual(false);
    expect(result.is_active).toEqual(true);
    expect(result.last_login).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a user with minimal fields', async () => {
    const minimalInput: CreateUserInput = {
      email: 'minimal@example.com',
      password: 'password123',
      first_name: 'Jane',
      last_name: 'Smith'
    };

    const result = await createUser(minimalInput);

    expect(result.email).toEqual('minimal@example.com');
    expect(result.first_name).toEqual('Jane');
    expect(result.last_name).toEqual('Smith');
    expect(result.username).toBeNull();
    expect(result.avatar_url).toBeNull();
    expect(result.password_hash).toEqual('hashed_password123');
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query database to verify user was saved
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].first_name).toEqual('John');
    expect(users[0].last_name).toEqual('Doe');
    expect(users[0].username).toEqual('johndoe');
    expect(users[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error for duplicate email', async () => {
    // Create first user
    await createUser(testInput);

    // Try to create another user with same email
    const duplicateEmailInput: CreateUserInput = {
      email: 'test@example.com', // Same email
      password: 'different123',
      first_name: 'Jane',
      last_name: 'Smith'
    };

    await expect(createUser(duplicateEmailInput)).rejects.toThrow(/email already exists/i);
  });

  it('should throw error for duplicate username', async () => {
    // Create first user
    await createUser(testInput);

    // Try to create another user with same username
    const duplicateUsernameInput: CreateUserInput = {
      email: 'different@example.com',
      password: 'password123',
      first_name: 'Jane',
      last_name: 'Smith',
      username: 'johndoe' // Same username
    };

    await expect(createUser(duplicateUsernameInput)).rejects.toThrow(/username already exists/i);
  });

  it('should allow users without username', async () => {
    const user1Input: CreateUserInput = {
      email: 'user1@example.com',
      password: 'password123',
      first_name: 'User',
      last_name: 'One'
    };

    const user2Input: CreateUserInput = {
      email: 'user2@example.com',
      password: 'password123',
      first_name: 'User',
      last_name: 'Two'
    };

    // Both should succeed since neither has username
    const result1 = await createUser(user1Input);
    const result2 = await createUser(user2Input);

    expect(result1.username).toBeNull();
    expect(result2.username).toBeNull();
    expect(result1.id).not.toEqual(result2.id);
  });
});
