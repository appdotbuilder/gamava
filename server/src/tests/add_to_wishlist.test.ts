
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { wishlistTable, productsTable, categoriesTable, usersTable } from '../db/schema';
import { type AddToWishlistInput } from '../schema';
import { addToWishlist } from '../handlers/add_to_wishlist';
import { eq, and } from 'drizzle-orm';

describe('addToWishlist', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should add product to wishlist for authenticated user', async () => {
    // Create prerequisite data
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description'
      })
      .returning()
      .execute();

    const user = await db.insert(usersTable)
      .values({
        email: 'user@test.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      })
      .returning()
      .execute();

    const product = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: '19.99',
        category_id: category[0].id,
        stock_quantity: 10
      })
      .returning()
      .execute();

    const input: AddToWishlistInput = {
      user_id: user[0].id,
      product_id: product[0].id
    };

    const result = await addToWishlist(input);

    expect(result.id).toBeDefined();
    expect(result.user_id).toEqual(user[0].id);
    expect(result.session_id).toBeNull();
    expect(result.product_id).toEqual(product[0].id);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should add product to wishlist for guest session', async () => {
    // Create prerequisite data
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description'
      })
      .returning()
      .execute();

    const product = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: '19.99',
        category_id: category[0].id,
        stock_quantity: 10
      })
      .returning()
      .execute();

    const input: AddToWishlistInput = {
      session_id: 'guest-session-123',
      product_id: product[0].id
    };

    const result = await addToWishlist(input);

    expect(result.id).toBeDefined();
    expect(result.user_id).toBeNull();
    expect(result.session_id).toEqual('guest-session-123');
    expect(result.product_id).toEqual(product[0].id);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save wishlist item to database', async () => {
    // Create prerequisite data
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description'
      })
      .returning()
      .execute();

    const user = await db.insert(usersTable)
      .values({
        email: 'user@test.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      })
      .returning()
      .execute();

    const product = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: '19.99',
        category_id: category[0].id,
        stock_quantity: 10
      })
      .returning()
      .execute();

    const input: AddToWishlistInput = {
      user_id: user[0].id,
      product_id: product[0].id
    };

    const result = await addToWishlist(input);

    // Verify item was saved to database
    const savedItems = await db.select()
      .from(wishlistTable)
      .where(eq(wishlistTable.id, result.id))
      .execute();

    expect(savedItems).toHaveLength(1);
    expect(savedItems[0].user_id).toEqual(user[0].id);
    expect(savedItems[0].product_id).toEqual(product[0].id);
    expect(savedItems[0].created_at).toBeInstanceOf(Date);
  });

  it('should prevent duplicate wishlist items for same user', async () => {
    // Create prerequisite data
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description'
      })
      .returning()
      .execute();

    const user = await db.insert(usersTable)
      .values({
        email: 'user@test.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      })
      .returning()
      .execute();

    const product = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: '19.99',
        category_id: category[0].id,
        stock_quantity: 10
      })
      .returning()
      .execute();

    const input: AddToWishlistInput = {
      user_id: user[0].id,
      product_id: product[0].id
    };

    // Add item first time
    const firstResult = await addToWishlist(input);

    // Try to add same item again
    const secondResult = await addToWishlist(input);

    // Should return the same existing item
    expect(secondResult.id).toEqual(firstResult.id);
    expect(secondResult.user_id).toEqual(user[0].id);
    expect(secondResult.product_id).toEqual(product[0].id);

    // Verify only one item exists in database
    const allItems = await db.select()
      .from(wishlistTable)
      .where(
        and(
          eq(wishlistTable.user_id, user[0].id),
          eq(wishlistTable.product_id, product[0].id)
        )
      )
      .execute();

    expect(allItems).toHaveLength(1);
  });

  it('should prevent duplicate wishlist items for same session', async () => {
    // Create prerequisite data
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description'
      })
      .returning()
      .execute();

    const product = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: '19.99',
        category_id: category[0].id,
        stock_quantity: 10
      })
      .returning()
      .execute();

    const input: AddToWishlistInput = {
      session_id: 'guest-session-123',
      product_id: product[0].id
    };

    // Add item first time
    const firstResult = await addToWishlist(input);

    // Try to add same item again
    const secondResult = await addToWishlist(input);

    // Should return the same existing item
    expect(secondResult.id).toEqual(firstResult.id);
    expect(secondResult.session_id).toEqual('guest-session-123');
    expect(secondResult.product_id).toEqual(product[0].id);

    // Verify only one item exists in database
    const allItems = await db.select()
      .from(wishlistTable)
      .where(
        and(
          eq(wishlistTable.session_id, 'guest-session-123'),
          eq(wishlistTable.product_id, product[0].id)
        )
      )
      .execute();

    expect(allItems).toHaveLength(1);
  });

  it('should throw error when neither user_id nor session_id provided', async () => {
    const input: AddToWishlistInput = {
      product_id: 1
    };

    await expect(addToWishlist(input)).rejects.toThrow(/either user_id or session_id must be provided/i);
  });

  it('should throw error when product does not exist', async () => {
    const input: AddToWishlistInput = {
      user_id: 1,
      product_id: 999999 // Non-existent product
    };

    await expect(addToWishlist(input)).rejects.toThrow(/product not found/i);
  });
});
