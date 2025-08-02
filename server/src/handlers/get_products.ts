
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product, type ProductFilters } from '../schema';
import { eq, gte, lte, like, desc, asc, and, SQL } from 'drizzle-orm';

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [];

    if (filters) {
      // Category filter
      if (filters.category_id !== undefined) {
        conditions.push(eq(productsTable.category_id, filters.category_id));
      }

      // Price range filters
      if (filters.min_price !== undefined) {
        conditions.push(gte(productsTable.price, filters.min_price.toString()));
      }

      if (filters.max_price !== undefined) {
        conditions.push(lte(productsTable.price, filters.max_price.toString()));
      }

      // Platform filter
      if (filters.platform) {
        conditions.push(eq(productsTable.platform, filters.platform));
      }

      // Region filter
      if (filters.region) {
        conditions.push(eq(productsTable.region, filters.region));
      }

      // Featured filter
      if (filters.featured !== undefined) {
        conditions.push(eq(productsTable.featured, filters.featured));
      }

      // Status filter
      if (filters.status) {
        conditions.push(eq(productsTable.status, filters.status));
      }

      // Search filter
      if (filters.search) {
        conditions.push(like(productsTable.name, `%${filters.search}%`));
      }
    }

    // Get pagination and sorting values
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    // Build and execute complete query in single expression
    const results = await (
      conditions.length > 0
        ? db.select().from(productsTable).where(conditions.length === 1 ? conditions[0] : and(...conditions))
        : db.select().from(productsTable)
    )
      .orderBy(
        filters?.sort_by
          ? (filters.sort_order === 'desc' ? desc(productsTable[filters.sort_by]) : asc(productsTable[filters.sort_by]))
          : desc(productsTable.created_at)
      )
      .limit(limit)
      .offset(offset)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
    }));
  } catch (error) {
    console.error('Product fetching failed:', error);
    throw error;
  }
}
