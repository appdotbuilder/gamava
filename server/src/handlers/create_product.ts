
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type CreateProductInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const createProduct = async (input: CreateProductInput): Promise<Product> => {
  try {
    // Validate category exists
    const category = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, input.category_id))
      .execute();

    if (category.length === 0) {
      throw new Error(`Category with id ${input.category_id} does not exist`);
    }

    // Insert product record
    const result = await db.insert(productsTable)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        short_description: input.short_description || null,
        price: input.price.toString(), // Convert number to string for numeric column
        original_price: input.original_price ? input.original_price.toString() : null,
        category_id: input.category_id,
        sku: input.sku || null,
        stock_quantity: input.stock_quantity || 0,
        digital_key: input.digital_key || null,
        platform: input.platform || null,
        region: input.region || null,
        status: input.status || 'active',
        featured: input.featured || false,
        image_url: input.image_url || null,
        gallery_urls: input.gallery_urls || null,
        meta_title: input.meta_title || null,
        meta_description: input.meta_description || null,
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const product = result[0];
    return {
      ...product,
      price: parseFloat(product.price), // Convert string back to number
      original_price: product.original_price ? parseFloat(product.original_price) : null,
    };
  } catch (error) {
    console.error('Product creation failed:', error);
    throw error;
  }
};
