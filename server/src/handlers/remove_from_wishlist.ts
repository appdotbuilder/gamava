
import { db } from '../db';
import { wishlistTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function removeFromWishlist(wishlistItemId: number): Promise<boolean> {
  try {
    const result = await db.delete(wishlistTable)
      .where(eq(wishlistTable.id, wishlistItemId))
      .execute();

    // Check if any rows were deleted (rowCount can be null)
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Remove from wishlist failed:', error);
    throw error;
  }
}
