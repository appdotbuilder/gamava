
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { createCategory } from '../handlers/create_category';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateCategoryInput = {
  name: 'Video Games',
  slug: 'video-games',
  description: 'Gaming products and accessories',
  parent_id: null,
  image_url: 'https://example.com/gaming.jpg',
  sort_order: 1,
  is_active: true
};

describe('createCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a category with all fields', async () => {
    const result = await createCategory(testInput);

    // Basic field validation
    expect(result.name).toEqual('Video Games');
    expect(result.slug).toEqual('video-games');
    expect(result.description).toEqual('Gaming products and accessories');
    expect(result.parent_id).toBeNull();
    expect(result.image_url).toEqual('https://example.com/gaming.jpg');
    expect(result.sort_order).toEqual(1);
    expect(result.is_active).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save category to database', async () => {
    const result = await createCategory(testInput);

    // Query using proper drizzle syntax
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Video Games');
    expect(categories[0].slug).toEqual('video-games');
    expect(categories[0].description).toEqual('Gaming products and accessories');
    expect(categories[0].sort_order).toEqual(1);
    expect(categories[0].is_active).toBe(true);
    expect(categories[0].created_at).toBeInstanceOf(Date);
  });

  it('should create a category with minimal fields', async () => {
    const minimalInput: CreateCategoryInput = {
      name: 'Electronics',
      slug: 'electronics'
    };

    const result = await createCategory(minimalInput);

    expect(result.name).toEqual('Electronics');
    expect(result.slug).toEqual('electronics');
    expect(result.description).toBeNull();
    expect(result.parent_id).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.sort_order).toEqual(0); // Default value
    expect(result.is_active).toBe(true); // Default value
  });

  it('should create a subcategory with valid parent', async () => {
    // First create parent category
    const parentCategory = await createCategory({
      name: 'Electronics',
      slug: 'electronics'
    });

    // Create subcategory
    const subcategoryInput: CreateCategoryInput = {
      name: 'Gaming Consoles',
      slug: 'gaming-consoles',
      parent_id: parentCategory.id
    };

    const result = await createCategory(subcategoryInput);

    expect(result.name).toEqual('Gaming Consoles');
    expect(result.slug).toEqual('gaming-consoles');
    expect(result.parent_id).toEqual(parentCategory.id);
  });

  it('should throw error when parent category does not exist', async () => {
    const invalidInput: CreateCategoryInput = {
      name: 'Gaming Consoles',
      slug: 'gaming-consoles',
      parent_id: 9999 // Non-existent parent
    };

    await expect(createCategory(invalidInput)).rejects.toThrow(/parent category not found/i);
  });

  it('should handle slug uniqueness constraint violation', async () => {
    // Create first category
    await createCategory(testInput);

    // Try to create another category with same slug
    const duplicateInput: CreateCategoryInput = {
      name: 'Different Name',
      slug: 'video-games' // Same slug
    };

    await expect(createCategory(duplicateInput)).rejects.toThrow();
  });

  it('should apply default values correctly', async () => {
    const inputWithDefaults: CreateCategoryInput = {
      name: 'Test Category',
      slug: 'test-category',
      is_active: false // Explicitly set to false
    };

    const result = await createCategory(inputWithDefaults);

    expect(result.sort_order).toEqual(0); // Default applied
    expect(result.is_active).toBe(false); // Explicit value preserved
    expect(result.description).toBeNull(); // Optional field default
  });
});
