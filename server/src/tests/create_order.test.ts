
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable, orderItemsTable, usersTable, productsTable, categoriesTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { createOrder } from '../handlers/create_order';
import { eq } from 'drizzle-orm';

describe('createOrder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUser: { id: number };
  let testCategory: { id: number };
  let testProduct1: { id: number };
  let testProduct2: { id: number };

  beforeEach(async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'John',
        last_name: 'Doe'
      })
      .returning()
      .execute();
    testUser = userResult[0];

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Games',
        slug: 'games'
      })
      .returning()
      .execute();
    testCategory = categoryResult[0];

    // Create test products
    const product1Result = await db.insert(productsTable)
      .values({
        name: 'Test Game 1',
        slug: 'test-game-1',
        price: '29.99',
        category_id: testCategory.id,
        stock_quantity: 10,
        digital_key: 'GAME1-KEY-123'
      })
      .returning()
      .execute();
    testProduct1 = product1Result[0];

    const product2Result = await db.insert(productsTable)
      .values({
        name: 'Test Game 2',
        slug: 'test-game-2',
        price: '19.99',
        category_id: testCategory.id,
        stock_quantity: 5
      })
      .returning()
      .execute();
    testProduct2 = product2Result[0];
  });

  const createTestOrderInput = (): CreateOrderInput => ({
    user_id: testUser.id,
    items: [
      { product_id: testProduct1.id, quantity: 2 },
      { product_id: testProduct2.id, quantity: 1 }
    ],
    billing_email: 'billing@example.com',
    billing_first_name: 'Jane',
    billing_last_name: 'Smith',
    payment_method: 'credit_card',
    notes: 'Test order notes'
  });

  it('should create an order with correct details', async () => {
    const input = createTestOrderInput();
    const result = await createOrder(input);

    // Verify order fields
    expect(result.id).toBeDefined();
    expect(result.user_id).toEqual(testUser.id);
    expect(result.order_number).toMatch(/^ORDER-\d+-[a-z0-9]+$/);
    expect(result.status).toEqual('pending');
    expect(result.total_amount).toEqual(79.97); // (29.99 * 2) + (19.99 * 1)
    expect(result.currency).toEqual('USD');
    expect(result.billing_email).toEqual('billing@example.com');
    expect(result.billing_first_name).toEqual('Jane');
    expect(result.billing_last_name).toEqual('Smith');
    expect(result.payment_method).toEqual('credit_card');
    expect(result.payment_status).toEqual('pending');
    expect(result.notes).toEqual('Test order notes');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save order to database', async () => {
    const input = createTestOrderInput();
    const result = await createOrder(input);

    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, result.id))
      .execute();

    expect(orders).toHaveLength(1);
    expect(orders[0].user_id).toEqual(testUser.id);
    expect(parseFloat(orders[0].total_amount)).toEqual(79.97);
    expect(orders[0].billing_email).toEqual('billing@example.com');
  });

  it('should create order items correctly', async () => {
    const input = createTestOrderInput();
    const result = await createOrder(input);

    const orderItems = await db.select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, result.id))
      .execute();

    expect(orderItems).toHaveLength(2);

    // Find items by product_id
    const item1 = orderItems.find(item => item.product_id === testProduct1.id);
    const item2 = orderItems.find(item => item.product_id === testProduct2.id);

    expect(item1).toBeDefined();
    expect(item1!.quantity).toEqual(2);
    expect(parseFloat(item1!.unit_price)).toEqual(29.99);
    expect(parseFloat(item1!.total_price)).toEqual(59.98);
    expect(item1!.digital_key).toEqual('GAME1-KEY-123');

    expect(item2).toBeDefined();
    expect(item2!.quantity).toEqual(1);
    expect(parseFloat(item2!.unit_price)).toEqual(19.99);
    expect(parseFloat(item2!.total_price)).toEqual(19.99);
    expect(item2!.digital_key).toBeNull();
  });

  it('should handle optional fields correctly', async () => {
    const input: CreateOrderInput = {
      user_id: testUser.id,
      items: [{ product_id: testProduct1.id, quantity: 1 }],
      billing_email: 'billing@example.com',
      billing_first_name: 'Jane',
      billing_last_name: 'Smith'
    };

    const result = await createOrder(input);

    expect(result.payment_method).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.total_amount).toEqual(29.99);
  });

  it('should throw error when user does not exist', async () => {
    const input = createTestOrderInput();
    input.user_id = 99999; // Non-existent user

    await expect(createOrder(input)).rejects.toThrow(/user not found/i);
  });

  it('should throw error when product does not exist', async () => {
    const input = createTestOrderInput();
    input.items = [{ product_id: 99999, quantity: 1 }]; // Non-existent product

    await expect(createOrder(input)).rejects.toThrow(/products not found/i);
  });

  it('should calculate total amount correctly for single item', async () => {
    const input: CreateOrderInput = {
      user_id: testUser.id,
      items: [{ product_id: testProduct1.id, quantity: 3 }],
      billing_email: 'billing@example.com',
      billing_first_name: 'Jane',
      billing_last_name: 'Smith'
    };

    const result = await createOrder(input);
    expect(result.total_amount).toEqual(89.97); // 29.99 * 3
  });
});
