
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

// Test category for foreign key requirement
const testCategory = {
  name: 'Test Category',
  slug: 'test-category',
  description: 'A category for testing',
  parent_id: null,
  image_url: null,
  sort_order: 0,
  is_active: true,
};

// Test input with all required fields
const testInput: CreateProductInput = {
  name: 'Test Product',
  slug: 'test-product',
  description: 'A product for testing',
  short_description: 'Short description',
  price: 19.99,
  original_price: 29.99,
  category_id: 1, // Will be set after category creation
  sku: 'TEST-001',
  stock_quantity: 100,
  digital_key: 'ABCD-1234-EFGH-5678',
  platform: 'Steam',
  region: 'Global',
  status: 'active',
  featured: true,
  image_url: 'https://example.com/image.jpg',
  gallery_urls: ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg'],
  meta_title: 'Test Product - Meta Title',
  meta_description: 'Meta description for test product',
};

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product with all fields', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    
    const inputWithCategoryId = {
      ...testInput,
      category_id: categoryResult[0].id,
    };

    const result = await createProduct(inputWithCategoryId);

    // Validate all fields
    expect(result.name).toEqual('Test Product');
    expect(result.slug).toEqual('test-product');
    expect(result.description).toEqual('A product for testing');
    expect(result.short_description).toEqual('Short description');
    expect(result.price).toEqual(19.99);
    expect(typeof result.price).toBe('number');
    expect(result.original_price).toEqual(29.99);
    expect(typeof result.original_price).toBe('number');
    expect(result.category_id).toEqual(categoryResult[0].id);
    expect(result.sku).toEqual('TEST-001');
    expect(result.stock_quantity).toEqual(100);
    expect(result.digital_key).toEqual('ABCD-1234-EFGH-5678');
    expect(result.platform).toEqual('Steam');
    expect(result.region).toEqual('Global');
    expect(result.status).toEqual('active');
    expect(result.featured).toBe(true);
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.gallery_urls).toEqual(['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg']);
    expect(result.meta_title).toEqual('Test Product - Meta Title');
    expect(result.meta_description).toEqual('Meta description for test product');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    
    const inputWithCategoryId = {
      ...testInput,
      category_id: categoryResult[0].id,
    };

    const result = await createProduct(inputWithCategoryId);

    // Query database to verify persistence
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    const savedProduct = products[0];
    expect(savedProduct.name).toEqual('Test Product');
    expect(savedProduct.slug).toEqual('test-product');
    expect(parseFloat(savedProduct.price)).toEqual(19.99);
    expect(parseFloat(savedProduct.original_price!)).toEqual(29.99);
    expect(savedProduct.category_id).toEqual(categoryResult[0].id);
    expect(savedProduct.created_at).toBeInstanceOf(Date);
  });

  it('should create product with minimal required fields', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    const minimalInput: CreateProductInput = {
      name: 'Minimal Product',
      slug: 'minimal-product',
      price: 9.99,
      category_id: categoryResult[0].id,
    };

    const result = await createProduct(minimalInput);

    expect(result.name).toEqual('Minimal Product');
    expect(result.slug).toEqual('minimal-product');
    expect(result.price).toEqual(9.99);
    expect(result.category_id).toEqual(categoryResult[0].id);
    expect(result.description).toBeNull();
    expect(result.original_price).toBeNull();
    expect(result.stock_quantity).toEqual(0);
    expect(result.status).toEqual('active');
    expect(result.featured).toBe(false);
  });

  it('should reject product with non-existent category', async () => {
    const inputWithInvalidCategory = {
      ...testInput,
      category_id: 999, // Non-existent category
    };

    await expect(createProduct(inputWithInvalidCategory))
      .rejects.toThrow(/Category with id 999 does not exist/i);
  });

  it('should reject duplicate slug', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    
    const inputWithCategoryId = {
      ...testInput,
      category_id: categoryResult[0].id,
    };

    // Create first product
    await createProduct(inputWithCategoryId);

    // Try to create second product with same slug
    const duplicateInput = {
      ...inputWithCategoryId,
      name: 'Different Name',
    };

    await expect(createProduct(duplicateInput))
      .rejects.toThrow();
  });
});
