
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput, type Category } from '../schema';
import { eq } from 'drizzle-orm';

export const createCategory = async (input: CreateCategoryInput): Promise<Category> => {
  try {
    // Validate parent category exists if parent_id is provided
    if (input.parent_id) {
      const parentCategory = await db.select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, input.parent_id))
        .execute();
      
      if (parentCategory.length === 0) {
        throw new Error('Parent category not found');
      }
    }

    // Insert category record
    const result = await db.insert(categoriesTable)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        parent_id: input.parent_id || null,
        image_url: input.image_url || null,
        sort_order: input.sort_order || 0,
        is_active: input.is_active !== undefined ? input.is_active : true
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Category creation failed:', error);
    throw error;
  }
};
