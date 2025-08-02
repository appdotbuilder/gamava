
import { db } from '../db';
import { ordersTable, orderItemsTable, productsTable, usersTable } from '../db/schema';
import { type CreateOrderInput, type Order } from '../schema';
import { eq, inArray } from 'drizzle-orm';

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  try {
    // Verify user exists
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (users.length === 0) {
      throw new Error('User not found');
    }

    // Verify all products exist and get their details
    const productIds = input.items.map(item => item.product_id);
    const products = await db.select()
      .from(productsTable)
      .where(inArray(productsTable.id, productIds))
      .execute();

    if (products.length !== productIds.length) {
      throw new Error('One or more products not found');
    }

    // Create product lookup map for price calculation
    const productMap = new Map(products.map(p => [p.id, p]));

    // Calculate total amount
    let totalAmount = 0;
    const orderItemsData = input.items.map(item => {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product with id ${item.product_id} not found`);
      }
      
      const unitPrice = parseFloat(product.price);
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice.toString(),
        total_price: totalPrice.toString(),
        digital_key: product.digital_key
      };
    });

    // Generate unique order number
    const orderNumber = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: input.user_id,
        order_number: orderNumber,
        status: 'pending',
        total_amount: totalAmount.toString(),
        currency: 'USD',
        billing_email: input.billing_email,
        billing_first_name: input.billing_first_name,
        billing_last_name: input.billing_last_name,
        payment_method: input.payment_method || null,
        payment_status: 'pending',
        notes: input.notes || null
      })
      .returning()
      .execute();

    const order = orderResult[0];

    // Create order items
    const orderItemsWithOrderId = orderItemsData.map(item => ({
      ...item,
      order_id: order.id
    }));

    await db.insert(orderItemsTable)
      .values(orderItemsWithOrderId)
      .execute();

    // Return order with converted numeric fields
    return {
      ...order,
      total_amount: parseFloat(order.total_amount)
    };
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};
