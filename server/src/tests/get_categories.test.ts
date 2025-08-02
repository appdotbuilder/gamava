
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { getCategories } from '../handlers/get_categories';

// Test category inputs
const testCategory1: CreateCategoryInput = {
  name: 'Electronics',
  slug: 'electronics',
  description: 'Electronic products and gadgets',
  sort_order: 2,
  is_active: true
};

const testCategory2: CreateCategoryInput = {
  name: 'Games',
  slug: 'games',
  description: 'Video games and gaming accessories',
  sort_order: 1,
  is_active: true
};

const testCategory3: CreateCategoryInput = {
  name: 'Books',
  slug: 'books',
  description: 'Books and literature',
  sort_order: 3,
  is_active: false
};

describe('getCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getCategories();
    expect(result).toEqual([]);
  });

  it('should return all categories', async () => {
    // Create test categories
    await db.insert(categoriesTable)
      .values([testCategory1, testCategory2, testCategory3])
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(3);
    expect(result.map(c => c.name)).toEqual(['Games', 'Electronics', 'Books']);
  });

  it('should order categories by sort_order then by name', async () => {
    // Create categories with same sort_order to test secondary ordering
    const sameOrderCategory1: CreateCategoryInput = {
      name: 'Zebra Category',
      slug: 'zebra',
      description: 'Last alphabetically',
      sort_order: 1,
      is_active: true
    };

    const sameOrderCategory2: CreateCategoryInput = {
      name: 'Alpha Category',
      slug: 'alpha',
      description: 'First alphabetically',
      sort_order: 1,
      is_active: true
    };

    await db.insert(categoriesTable)
      .values([sameOrderCategory1, sameOrderCategory2, testCategory1])
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(3);
    // Should be ordered by sort_order (1, 1, 2), then by name within same sort_order
    expect(result[0].name).toEqual('Alpha Category');
    expect(result[1].name).toEqual('Zebra Category');
    expect(result[2].name).toEqual('Electronics');
  });

  it('should include all category fields', async () => {
    const categoryWithAllFields: CreateCategoryInput = {
      name: 'Test Category',
      slug: 'test-category',
      description: 'A comprehensive test category',
      parent_id: null,
      image_url: 'https://example.com/image.jpg',
      sort_order: 5,
      is_active: true
    };

    await db.insert(categoriesTable)
      .values(categoryWithAllFields)
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(1);
    const category = result[0];

    expect(category.id).toBeDefined();
    expect(category.name).toEqual('Test Category');
    expect(category.slug).toEqual('test-category');
    expect(category.description).toEqual('A comprehensive test category');
    expect(category.parent_id).toBeNull();
    expect(category.image_url).toEqual('https://example.com/image.jpg');
    expect(category.sort_order).toEqual(5);
    expect(category.is_active).toBe(true);
    expect(category.created_at).toBeInstanceOf(Date);
    expect(category.updated_at).toBeInstanceOf(Date);
  });

  it('should include both active and inactive categories', async () => {
    await db.insert(categoriesTable)
      .values([testCategory2, testCategory3]) // Games (active) and Books (inactive)
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(2);
    expect(result.find(c => c.name === 'Games')?.is_active).toBe(true);
    expect(result.find(c => c.name === 'Books')?.is_active).toBe(false);
  });
});
