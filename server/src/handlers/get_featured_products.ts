
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getFeaturedProducts(limit: number = 10): Promise<Product[]> {
  try {
    // Build the complete query in the correct order
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.featured, true))
      .orderBy(desc(productsTable.created_at))
      .limit(limit)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null
    }));
  } catch (error) {
    console.error('Featured products fetch failed:', error);
    throw error;
  }
}
