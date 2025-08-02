
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type Category } from '../schema';
import { asc } from 'drizzle-orm';

export async function getCategories(): Promise<Category[]> {
  try {
    const result = await db.select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.sort_order), asc(categoriesTable.name))
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
}
