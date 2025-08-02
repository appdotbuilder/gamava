
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type CreateCategoryInput, type CreateProductInput } from '../schema';
import { getProductBySlug } from '../handlers/get_product_by_slug';

// Test data
const testCategory: CreateCategoryInput = {
  name: 'Gaming',
  slug: 'gaming',
  description: 'Gaming products',
  parent_id: null,
  image_url: null,
  sort_order: 1,
  is_active: true
};

const testProduct: CreateProductInput = {
  name: 'Test Game',
  slug: 'test-game',
  description: 'A great game for testing',
  short_description: 'Great game',
  price: 29.99,
  original_price: 39.99,
  category_id: 1, // Will be set after creating category
  sku: 'GAME001',
  stock_quantity: 50,
  digital_key: null,
  platform: 'PC',
  region: 'Global',
  status: 'active',
  featured: true,
  image_url: 'https://example.com/image.jpg',
  gallery_urls: ['https://example.com/gallery1.jpg'],
  meta_title: 'Test Game Meta',
  meta_description: 'Meta description for test game'
};

describe('getProductBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return product by slug', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        description: testCategory.description,
        parent_id: testCategory.parent_id,
        image_url: testCategory.image_url,
        sort_order: testCategory.sort_order || 0,
        is_active: testCategory.is_active || true
      })
      .returning()
      .execute();

    const category = categoryResult[0];

    // Create product
    await db.insert(productsTable)
      .values({
        ...testProduct,
        category_id: category.id,
        price: testProduct.price.toString(),
        original_price: testProduct.original_price ? testProduct.original_price.toString() : null
      })
      .execute();

    // Test the handler
    const result = await getProductBySlug('test-game');

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Test Game');
    expect(result!.slug).toEqual('test-game');
    expect(result!.price).toEqual(29.99);
    expect(typeof result!.price).toBe('number');
    expect(result!.original_price).toEqual(39.99);
    expect(typeof result!.original_price).toBe('number');
    expect(result!.category_id).toEqual(category.id);
    expect(result!.platform).toEqual('PC');
    expect(result!.featured).toBe(true);
    expect(result!.status).toEqual('active');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent slug', async () => {
    const result = await getProductBySlug('non-existent-game');
    expect(result).toBeNull();
  });

  it('should handle products with null original_price', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        description: testCategory.description,
        parent_id: testCategory.parent_id,
        image_url: testCategory.image_url,
        sort_order: testCategory.sort_order || 0,
        is_active: testCategory.is_active || true
      })
      .returning()
      .execute();

    const category = categoryResult[0];

    // Create product without original_price
    await db.insert(productsTable)
      .values({
        ...testProduct,
        category_id: category.id,
        price: testProduct.price.toString(),
        original_price: null
      })
      .execute();

    const result = await getProductBySlug('test-game');

    expect(result).not.toBeNull();
    expect(result!.price).toEqual(29.99);
    expect(result!.original_price).toBeNull();
  });

  it('should handle products with all nullable fields as null', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        description: testCategory.description,
        parent_id: testCategory.parent_id,
        image_url: testCategory.image_url,
        sort_order: testCategory.sort_order || 0,
        is_active: testCategory.is_active || true
      })
      .returning()
      .execute();

    const category = categoryResult[0];

    // Create minimal product
    await db.insert(productsTable)
      .values({
        name: 'Minimal Game',
        slug: 'minimal-game',
        price: '19.99',
        category_id: category.id,
        description: null,
        short_description: null,
        original_price: null,
        sku: null,
        digital_key: null,
        platform: null,
        region: null,
        image_url: null,
        gallery_urls: null,
        meta_title: null,
        meta_description: null
      })
      .execute();

    const result = await getProductBySlug('minimal-game');

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Minimal Game');
    expect(result!.price).toEqual(19.99);
    expect(result!.description).toBeNull();
    expect(result!.original_price).toBeNull();
    expect(result!.platform).toBeNull();
  });
});
