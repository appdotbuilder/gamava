
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { wishlistTable, usersTable, productsTable, categoriesTable } from '../db/schema';
import { removeFromWishlist } from '../handlers/remove_from_wishlist';
import { eq } from 'drizzle-orm';

describe('removeFromWishlist', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should remove existing wishlist item', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();

    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        price: '19.99',
        category_id: categoryResult[0].id
      })
      .returning()
      .execute();

    // Create wishlist item
    const wishlistResult = await db.insert(wishlistTable)
      .values({
        user_id: userResult[0].id,
        product_id: productResult[0].id
      })
      .returning()
      .execute();

    const wishlistItemId = wishlistResult[0].id;

    // Remove the wishlist item
    const result = await removeFromWishlist(wishlistItemId);

    expect(result).toBe(true);

    // Verify item was removed from database
    const remainingItems = await db.select()
      .from(wishlistTable)
      .where(eq(wishlistTable.id, wishlistItemId))
      .execute();

    expect(remainingItems).toHaveLength(0);
  });

  it('should return false for non-existent wishlist item', async () => {
    const nonExistentId = 99999;

    const result = await removeFromWishlist(nonExistentId);

    expect(result).toBe(false);
  });

  it('should remove only the specified item', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category'
      })
      .returning()
      .execute();

    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values([
        {
          name: 'Product 1',
          slug: 'product-1',
          price: '19.99',
          category_id: categoryResult[0].id
        },
        {
          name: 'Product 2',
          slug: 'product-2',
          price: '29.99',
          category_id: categoryResult[0].id
        }
      ])
      .returning()
      .execute();

    // Create two wishlist items
    const wishlistResult = await db.insert(wishlistTable)
      .values([
        {
          user_id: userResult[0].id,
          product_id: productResult[0].id
        },
        {
          user_id: userResult[0].id,
          product_id: productResult[1].id
        }
      ])
      .returning()
      .execute();

    const firstItemId = wishlistResult[0].id;
    const secondItemId = wishlistResult[1].id;

    // Remove only the first item
    const result = await removeFromWishlist(firstItemId);

    expect(result).toBe(true);

    // Verify first item was removed
    const firstItemCheck = await db.select()
      .from(wishlistTable)
      .where(eq(wishlistTable.id, firstItemId))
      .execute();

    expect(firstItemCheck).toHaveLength(0);

    // Verify second item still exists
    const secondItemCheck = await db.select()
      .from(wishlistTable)
      .where(eq(wishlistTable.id, secondItemId))
      .execute();

    expect(secondItemCheck).toHaveLength(1);
    expect(secondItemCheck[0].id).toBe(secondItemId);
  });
});
