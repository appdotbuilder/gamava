
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { wishlistTable, usersTable, productsTable, categoriesTable } from '../db/schema';
import { getWishlist } from '../handlers/get_wishlist';

describe('getWishlist', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no wishlist items exist', async () => {
    const result = await getWishlist(1, 'session123');
    expect(result).toEqual([]);
  });

  it('should get wishlist items by user_id', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        price: '19.99',
        category_id: categoryId,
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    // Create wishlist item
    const wishlistResult = await db.insert(wishlistTable)
      .values({
        user_id: userId,
        product_id: productId,
      })
      .returning()
      .execute();

    const result = await getWishlist(userId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(wishlistResult[0].id);
    expect(result[0].user_id).toEqual(userId);
    expect(result[0].product_id).toEqual(productId);
    expect(result[0].session_id).toBeNull();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should get wishlist items by session_id', async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        price: '19.99',
        category_id: categoryId,
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    const sessionId = 'guest-session-123';

    // Create wishlist item for guest session
    const wishlistResult = await db.insert(wishlistTable)
      .values({
        session_id: sessionId,
        product_id: productId,
      })
      .returning()
      .execute();

    const result = await getWishlist(undefined, sessionId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(wishlistResult[0].id);
    expect(result[0].user_id).toBeNull();
    expect(result[0].session_id).toEqual(sessionId);
    expect(result[0].product_id).toEqual(productId);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should get wishlist items for both user_id and session_id when both provided', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test products
    const product1Result = await db.insert(productsTable)
      .values({
        name: 'Test Product 1',
        slug: 'test-product-1',
        price: '19.99',
        category_id: categoryId,
      })
      .returning()
      .execute();

    const product2Result = await db.insert(productsTable)
      .values({
        name: 'Test Product 2',
        slug: 'test-product-2',
        price: '29.99',
        category_id: categoryId,
      })
      .returning()
      .execute();

    const sessionId = 'guest-session-123';

    // Create wishlist items - one for user, one for session
    await db.insert(wishlistTable)
      .values({
        user_id: userId,
        product_id: product1Result[0].id,
      })
      .execute();

    await db.insert(wishlistTable)
      .values({
        session_id: sessionId,
        product_id: product2Result[0].id,
      })
      .execute();

    const result = await getWishlist(userId, sessionId);

    expect(result).toHaveLength(2);
    expect(result.some(item => item.user_id === userId)).toBe(true);
    expect(result.some(item => item.session_id === sessionId)).toBe(true);
  });

  it('should return empty array when user has no wishlist items', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    const result = await getWishlist(userId);
    expect(result).toEqual([]);
  });

  it('should only return items for the specified user', async () => {
    // Create two test users
    const user1Result = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        password_hash: 'hashedpassword',
        first_name: 'User',
        last_name: 'One',
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        password_hash: 'hashedpassword',
        first_name: 'User',
        last_name: 'Two',
      })
      .returning()
      .execute();

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        price: '19.99',
        category_id: categoryId,
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    // Create wishlist items for both users
    await db.insert(wishlistTable)
      .values({
        user_id: user1Result[0].id,
        product_id: productId,
      })
      .execute();

    await db.insert(wishlistTable)
      .values({
        user_id: user2Result[0].id,
        product_id: productId,
      })
      .execute();

    // Get wishlist for user1 only
    const result = await getWishlist(user1Result[0].id);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(user1Result[0].id);
  });

  it('should return items ordered by created_at descending', async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test products
    const product1Result = await db.insert(productsTable)
      .values({
        name: 'Test Product 1',
        slug: 'test-product-1',
        price: '19.99',
        category_id: categoryId,
      })
      .returning()
      .execute();

    const product2Result = await db.insert(productsTable)
      .values({
        name: 'Test Product 2',
        slug: 'test-product-2',
        price: '29.99',
        category_id: categoryId,
      })
      .returning()
      .execute();

    const sessionId = 'test-session';

    // Create first wishlist item
    await db.insert(wishlistTable)
      .values({
        session_id: sessionId,
        product_id: product1Result[0].id,
      })
      .execute();

    // Wait a bit and create second item
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(wishlistTable)
      .values({
        session_id: sessionId,
        product_id: product2Result[0].id,
      })
      .execute();

    const result = await getWishlist(undefined, sessionId);

    expect(result).toHaveLength(2);
    // Should be ordered by created_at descending (newest first)
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return all items when neither userId nor sessionId provided', async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
      })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        price: '19.99',
        category_id: categoryId,
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    // Create wishlist item
    await db.insert(wishlistTable)
      .values({
        session_id: 'some-session',
        product_id: productId,
      })
      .execute();

    const result = await getWishlist();

    expect(result).toHaveLength(1);
    expect(result[0].session_id).toEqual('some-session');
    expect(result[0].product_id).toEqual(productId);
  });
});
