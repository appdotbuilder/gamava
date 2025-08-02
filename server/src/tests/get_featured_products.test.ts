
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable } from '../db/schema';
import { getFeaturedProducts } from '../handlers/get_featured_products';

describe('getFeaturedProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return featured products only', async () => {
    // Create category first
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category', slug: 'test-category' })
      .returning()
      .execute();

    // Create featured and non-featured products
    await db.insert(productsTable)
      .values([
        {
          name: 'Featured Product 1',
          slug: 'featured-1',
          price: '29.99',
          category_id: category[0].id,
          featured: true
        },
        {
          name: 'Regular Product',
          slug: 'regular-1',
          price: '19.99',
          category_id: category[0].id,
          featured: false
        },
        {
          name: 'Featured Product 2',
          slug: 'featured-2',
          price: '39.99',
          category_id: category[0].id,
          featured: true
        }
      ])
      .execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(2);
    expect(result.every(product => product.featured)).toBe(true);
    expect(result.map(p => p.name)).toContain('Featured Product 1');
    expect(result.map(p => p.name)).toContain('Featured Product 2');
    expect(result.map(p => p.name)).not.toContain('Regular Product');
  });

  it('should convert numeric fields correctly', async () => {
    // Create category first
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category', slug: 'test-category' })
      .returning()
      .execute();

    await db.insert(productsTable)
      .values({
        name: 'Featured Product',
        slug: 'featured-product',
        price: '29.99',
        original_price: '39.99',
        category_id: category[0].id,
        featured: true
      })
      .execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(1);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toEqual(29.99);
    expect(typeof result[0].original_price).toBe('number');
    expect(result[0].original_price).toEqual(39.99);
  });

  it('should order by creation date descending', async () => {
    // Create category first
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category', slug: 'test-category' })
      .returning()
      .execute();

    // Create products with slight delay to ensure different timestamps
    await db.insert(productsTable)
      .values({
        name: 'First Featured',
        slug: 'first-featured',
        price: '10.00',
        category_id: category[0].id,
        featured: true
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(productsTable)
      .values({
        name: 'Second Featured',
        slug: 'second-featured',
        price: '20.00',
        category_id: category[0].id,
        featured: true
      })
      .execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(2);
    // Most recently created should be first
    expect(result[0].name).toBe('Second Featured');
    expect(result[1].name).toBe('First Featured');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should respect limit parameter', async () => {
    // Create category first
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category', slug: 'test-category' })
      .returning()
      .execute();

    // Create 5 featured products
    const products = Array.from({ length: 5 }, (_, i) => ({
      name: `Featured Product ${i + 1}`,
      slug: `featured-${i + 1}`,
      price: '10.00',
      category_id: category[0].id,
      featured: true
    }));

    await db.insert(productsTable)
      .values(products)
      .execute();

    const result = await getFeaturedProducts(3);

    expect(result).toHaveLength(3);
  });

  it('should use default limit when not specified', async () => {
    // Create category first
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category', slug: 'test-category' })
      .returning()
      .execute();

    // Create 15 featured products (more than default limit of 10)
    const products = Array.from({ length: 15 }, (_, i) => ({
      name: `Featured Product ${i + 1}`,
      slug: `featured-${i + 1}`,
      price: '10.00',
      category_id: category[0].id,
      featured: true
    }));

    await db.insert(productsTable)
      .values(products)
      .execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(10); // Default limit
  });

  it('should return empty array when no featured products exist', async () => {
    // Create category first
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category', slug: 'test-category' })
      .returning()
      .execute();

    // Create only non-featured products
    await db.insert(productsTable)
      .values({
        name: 'Regular Product',
        slug: 'regular-product',
        price: '10.00',
        category_id: category[0].id,
        featured: false
      })
      .execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(0);
  });
});
