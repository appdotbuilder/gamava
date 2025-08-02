
import { db } from '../db';
import { wishlistTable, productsTable } from '../db/schema';
import { type AddToWishlistInput, type WishlistItem } from '../schema';
import { eq, and, isNull } from 'drizzle-orm';

export const addToWishlist = async (input: AddToWishlistInput): Promise<WishlistItem> => {
  try {
    // Validate that either user_id or session_id is provided
    if (!input.user_id && !input.session_id) {
      throw new Error('Either user_id or session_id must be provided');
    }

    // Verify product exists
    const product = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, input.product_id))
      .execute();

    if (product.length === 0) {
      throw new Error('Product not found');
    }

    // Check for existing wishlist item to prevent duplicates
    const conditions = [];
    conditions.push(eq(wishlistTable.product_id, input.product_id));

    if (input.user_id) {
      conditions.push(eq(wishlistTable.user_id, input.user_id));
    } else {
      conditions.push(
        and(
          eq(wishlistTable.session_id, input.session_id!),
          isNull(wishlistTable.user_id)
        )
      );
    }

    const existingItem = await db.select()
      .from(wishlistTable)
      .where(and(...conditions))
      .execute();

    if (existingItem.length > 0) {
      // Return existing item instead of creating duplicate
      return existingItem[0];
    }

    // Insert new wishlist item
    const result = await db.insert(wishlistTable)
      .values({
        user_id: input.user_id || null,
        session_id: input.session_id || null,
        product_id: input.product_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Add to wishlist failed:', error);
    throw error;
  }
};
