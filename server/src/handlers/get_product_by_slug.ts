
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const results = await db.select()
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.category_id, categoriesTable.id))
      .where(eq(productsTable.slug, slug))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    const product = result.products;

    // Convert numeric fields back to numbers
    return {
      ...product,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null
    };
  } catch (error) {
    console.error('Product fetch by slug failed:', error);
    throw error;
  }
};
