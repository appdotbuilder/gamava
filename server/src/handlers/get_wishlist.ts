
import { db } from '../db';
import { wishlistTable } from '../db/schema';
import { type WishlistItem } from '../schema';
import { eq, or, desc } from 'drizzle-orm';

export async function getWishlist(userId?: number, sessionId?: string): Promise<WishlistItem[]> {
  try {
    let results;

    if (userId !== undefined && sessionId !== undefined) {
      // Both provided - use OR condition
      results = await db.select()
        .from(wishlistTable)
        .where(
          or(
            eq(wishlistTable.user_id, userId),
            eq(wishlistTable.session_id, sessionId)
          )
        )
        .orderBy(desc(wishlistTable.created_at))
        .execute();
    } else if (userId !== undefined) {
      // Only user_id provided
      results = await db.select()
        .from(wishlistTable)
        .where(eq(wishlistTable.user_id, userId))
        .orderBy(desc(wishlistTable.created_at))
        .execute();
    } else if (sessionId !== undefined) {
      // Only session_id provided
      results = await db.select()
        .from(wishlistTable)
        .where(eq(wishlistTable.session_id, sessionId))
        .orderBy(desc(wishlistTable.created_at))
        .execute();
    } else {
      // Neither provided - return all
      results = await db.select()
        .from(wishlistTable)
        .orderBy(desc(wishlistTable.created_at))
        .execute();
    }

    // Map results to WishlistItem schema
    return results.map(result => ({
      id: result.id,
      user_id: result.user_id,
      session_id: result.session_id,
      product_id: result.product_id,
      created_at: result.created_at,
    }));
  } catch (error) {
    console.error('Get wishlist failed:', error);
    throw error;
  }
}
