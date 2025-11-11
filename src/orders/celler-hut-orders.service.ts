import { Injectable } from '@nestjs/common';
import cellerHutAPI from '../common/celler-hut-client';
import {
  transformCellerHutOrder,
  transformPagination,
  transformOrderForCellerHut,
} from '../common/data-transformer';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  Order,
  OrderStatusType,
  PaymentStatusType,
} from './entities/order.entity';

@Injectable()
export class CellerHutOrdersService {
  /**
   * Create order in Celler Hut API
   * Main API now returns { order, payment } structure after Phase 7 integration
   */
  async create(createOrderDto: CreateOrderDto, token?: string): Promise<Order> {
    try {
      console.log('[Celler Hut Orders] Transforming order data for Celler Hut API...');
      // Transform PickBazar order to Celler Hut format
      const cellerHutOrderData = transformOrderForCellerHut(createOrderDto);
      console.log('[Celler Hut Orders] Transformed data:', JSON.stringify(cellerHutOrderData, null, 2));

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log('[Celler Hut Orders] Sending POST request to /ecommerce/orders...');
      const response = await cellerHutAPI.post(
        '/ecommerce/orders',
        cellerHutOrderData,
        { headers },
      );
      console.log('[Celler Hut Orders] Response received:', response.status);
      console.log('[Celler Hut Orders] Response data:', JSON.stringify(response.data, null, 2));

      // Main API now returns { order, payment } structure
      // Handle both old format (just order) and new format (order + payment)
      const orderData = response.data.order || response.data;
      const paymentData = response.data.payment || null;

      // Transform response back to PickBazar format
      const transformedOrder = transformCellerHutOrder(orderData);

      // Attach payment data if available (for frontend to handle redirects)
      if (paymentData) {
        console.log('[Celler Hut Orders] Payment data received:', JSON.stringify(paymentData, null, 2));
        (transformedOrder as any).payment = paymentData;
      }

      console.log('[Celler Hut Orders] Transformed order:', JSON.stringify(transformedOrder, null, 2));
      return transformedOrder;
    } catch (error) {
      console.error('[Celler Hut Orders] Create order failed:', error.message);
      if (error.response) {
        console.error('[Celler Hut Orders] API Response:', error.response.data);
        console.error('[Celler Hut Orders] API Status:', error.response.status);
      }
      throw new Error('Failed to create order in Celler Hut API');
    }
  }

  /**
   * Get orders from Celler Hut API with pagination and filtering
   */
  async getOrders(
    {
      limit,
      page,
      customer_id,
      tracking_number,
      search,
      shop_id,
    }: GetOrdersDto,
    token?: string,
  ): Promise<OrderPaginator> {
    try {
      const params: any = {
        page: page || 1,
        limit: limit || 15,
      };

      // Add filters
      if (customer_id) params.customer_id = customer_id;
      if (tracking_number) params.tracking_number = tracking_number;
      if (shop_id && shop_id !== 'undefined') params.shop_id = Number(shop_id);
      if (search) params.search = search;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await cellerHutAPI.get('/ecommerce/orders', {
        params,
        headers,
      });

      console.log('response.data', response);
      // Transform Celler Hut response to PickBazar format
      const transformedData = Array.isArray(response.data)
        ? response.data.map(transformCellerHutOrder)
        : [];

      // Transform pagination
      const pagination = transformPagination(response.data);

      return {
        data: transformedData,
        ...pagination,
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Get orders failed:', error);
      throw new Error('Failed to fetch orders from Celler Hut API');
    }
  }

  /**
   * Get order by ID or tracking number from Celler Hut API
   */
  async getOrderByIdOrTrackingNumber(
    id: string,
    token?: string,
  ): Promise<Order> {
    try {
      // Try to get by ID first
      let response;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        response = await cellerHutAPI.get(`/ecommerce/orders/${id}`, {
          headers,
        });
      } catch (error) {
        // If ID fails, try tracking number
        response = await cellerHutAPI.get(`/ecommerce/orders/tracking/${id}`, {
          headers,
        });
      }

      const orderData = response.data;

      // Transform order with tracking fields already included from Main API
      const transformedOrder = transformCellerHutOrder(orderData);

      // Build gps_tracking object from order data if tracking is enabled
      // No need for separate API call - tracking fields already in order response
      if (orderData.tracking_enabled && orderData.tookan_job_id) {
        console.log(`[Celler Hut Orders] Adding GPS tracking data for order ${orderData.tracking_number}`);
        transformedOrder.gps_tracking = {
          trackingEnabled: orderData.tracking_enabled,
          trackingUrl: orderData.tracking_url,
          deliveryService: orderData.delivery_service,
          orderId: orderData.id,
          orderNumber: orderData.tracking_number,
          orderStatus: orderData.order_status,
        };
        console.log('[Celler Hut Orders] GPS tracking data added successfully');
      }

      return transformedOrder;
    } catch (error) {
      console.error(
        '[Celler Hut Orders] Get order by ID/tracking failed:',
        error,
      );
      throw new Error(`Order with ID/tracking "${id}" not found`);
    }
  }

  /**
   * Update order in Celler Hut API
   */
  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    try {
      // Transform PickBazar order to Celler Hut format
      const cellerHutOrderData = transformOrderForCellerHut(updateOrderDto);

      const response = await cellerHutAPI.put(
        `/orders/${id}`,
        cellerHutOrderData,
      );

      // Transform response back to PickBazar format
      return transformCellerHutOrder(response.data);
    } catch (error) {
      console.error('[Celler Hut Orders] Update order failed:', error);
      throw new Error(`Failed to update order ${id} in Celler Hut API`);
    }
  }

  /**
   * Cancel order in Celler Hut API
   */
  async cancel(id: number): Promise<Order> {
    try {
      const response = await cellerHutAPI.post(`/orders/${id}/cancel`);
      return transformCellerHutOrder(response.data);
    } catch (error) {
      console.error('[Celler Hut Orders] Cancel order failed:', error);
      throw new Error(`Failed to cancel order ${id} in Celler Hut API`);
    }
  }

  /**
   * Get order status from Celler Hut API
   */
  async getOrderStatus(id: number): Promise<any> {
    try {
      const response = await cellerHutAPI.get(`/orders/${id}/status`);
      return {
        id: response.data.id,
        order_status: response.data.order_status || OrderStatusType.PENDING,
        payment_status:
          response.data.payment_status || PaymentStatusType.PENDING,
        updated_at: response.data.updated_at,
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Get order status failed:', error);
      throw new Error(`Failed to get status for order ${id}`);
    }
  }

  /**
   * Update order status in Celler Hut API
   */
  async updateOrderStatus(id: number, status: OrderStatusType): Promise<Order> {
    try {
      const response = await cellerHutAPI.put(`/orders/${id}/status`, {
        order_status: status,
      });

      return transformCellerHutOrder(response.data);
    } catch (error) {
      console.error('[Celler Hut Orders] Update order status failed:', error);
      throw new Error(`Failed to update status for order ${id}`);
    }
  }

  /**
   * Update payment status in Celler Hut API
   */
  async updatePaymentStatus(
    id: number,
    paymentStatus: PaymentStatusType,
  ): Promise<Order> {
    try {
      const response = await cellerHutAPI.put(`/orders/${id}/payment-status`, {
        payment_status: paymentStatus,
      });

      return transformCellerHutOrder(response.data);
    } catch (error) {
      console.error('[Celler Hut Orders] Update payment status failed:', error);
      throw new Error(`Failed to update payment status for order ${id}`);
    }
  }

  /**
   * Get orders by customer from Celler Hut API
   */
  async getOrdersByCustomer(
    customerId: number,
    options: any = {},
  ): Promise<OrderPaginator> {
    try {
      const params: any = {
        customer_id: customerId,
        page: options.page || 1,
        limit: options.limit || 15,
        ...options,
      };

      const response = await cellerHutAPI.get('/orders', { params });

      const transformedData = Array.isArray(response.data)
        ? response.data.map(transformCellerHutOrder)
        : [];

      const pagination = transformPagination(response.data);

      return {
        data: transformedData,
        ...pagination,
      };
    } catch (error) {
      console.error(
        '[Celler Hut Orders] Get orders by customer failed:',
        error,
      );
      throw new Error(`Failed to fetch orders for customer ${customerId}`);
    }
  }

  /**
   * Get orders by shop from Celler Hut API
   */
  async getOrdersByShop(
    shopId: number,
    options: any = {},
  ): Promise<OrderPaginator> {
    try {
      const params: any = {
        shop_id: shopId,
        page: options.page || 1,
        limit: options.limit || 15,
        ...options,
      };

      const response = await cellerHutAPI.get('/orders', { params });

      const transformedData = Array.isArray(response.data)
        ? response.data.map(transformCellerHutOrder)
        : [];

      const pagination = transformPagination(response.data);

      return {
        data: transformedData,
        ...pagination,
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Get orders by shop failed:', error);
      throw new Error(`Failed to fetch orders for shop ${shopId}`);
    }
  }

  /**
   * Process payment for order in Celler Hut API
   */
  async processPayment(orderId: number, paymentData: any): Promise<any> {
    try {
      const response = await cellerHutAPI.post(
        `/orders/${orderId}/payment`,
        paymentData,
      );
      return {
        success: response.data.success || true,
        payment_intent: response.data.payment_intent,
        transaction_id: response.data.transaction_id,
        message: response.data.message || 'Payment processed successfully',
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Process payment failed:', error);
      throw new Error(`Failed to process payment for order ${orderId}`);
    }
  }

  /**
   * Get order invoice from Celler Hut API
   */
  async getOrderInvoice(orderId: number): Promise<any> {
    try {
      const response = await cellerHutAPI.get(`/orders/${orderId}/invoice`);
      return {
        invoice_url: response.data.invoice_url,
        invoice_number: response.data.invoice_number,
        generated_at: response.data.generated_at,
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Get order invoice failed:', error);
      throw new Error(`Failed to get invoice for order ${orderId}`);
    }
  }

  /**
   * Get order tracking information from Celler Hut API
   */
  async getOrderTracking(trackingNumber: string): Promise<any> {
    try {
      const response = await cellerHutAPI.get(
        `/orders/tracking/${trackingNumber}`,
      );
      return {
        tracking_number: response.data.tracking_number,
        status: response.data.status,
        tracking_events: response.data.tracking_events || [],
        estimated_delivery: response.data.estimated_delivery,
        carrier: response.data.carrier,
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Get order tracking failed:', error);
      throw new Error(`Failed to get tracking for order ${trackingNumber}`);
    }
  }

  /**
   * Verify checkout data with Celler Hut API
   */
  async verifyCheckout(checkoutData: any, token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      //   console.log('checkoutData', checkoutData);
      const response = await cellerHutAPI.post(
        '/ecommerce/orders/verify-checkout',
        checkoutData,
        { headers },
      );
      console.log('response', response.data.data);
      return {
        unavailable_products: response.data.data.unavailable_products || [],
        total_tax: response.data.data.total_tax || 0,
        shipping_charge: response.data.data.shipping_charge || 0,
        shipping_zone: response.data.data.shipping_zone || '',
        estimated_delivery: response.data.data.estimated_delivery || '',
        available_coupons: response.data.data.available_coupons || [],
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Verify checkout failed:', error);
      throw new Error('Failed to verify checkout data');
    }
  }

  /**
   * Get order analytics from Celler Hut API
   */
  async getOrderAnalytics(shopId?: number): Promise<any> {
    try {
      const params: any = {};
      if (shopId) params.shop_id = shopId;

      const response = await cellerHutAPI.get('/orders/analytics', { params });
      return {
        total_orders: response.data.total_orders || 0,
        total_revenue: response.data.total_revenue || 0,
        pending_orders: response.data.pending_orders || 0,
        completed_orders: response.data.completed_orders || 0,
        cancelled_orders: response.data.cancelled_orders || 0,
        average_order_value: response.data.average_order_value || 0,
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Get order analytics failed:', error);
      return {
        total_orders: 0,
        total_revenue: 0,
        pending_orders: 0,
        completed_orders: 0,
        cancelled_orders: 0,
        average_order_value: 0,
      };
    }
  }

  /**
   * PAYMENT-FIRST FLOW: Validate checkout before payment initiation
   *
   * This is used when customer selects Peach payment.
   * Flow: Validate → Initiate Payment → Customer Pays → Create Order
   */
  async validateCheckoutForPayment(checkoutData: any, token?: string): Promise<any> {
    try {
      console.log('[Celler Hut Orders] Validating checkout for payment-first flow...');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await cellerHutAPI.post(
        '/ecommerce/checkout/validate',
        checkoutData,
        { headers },
      );

      console.log('[Celler Hut Orders] Checkout validation response:', response.data);

      return {
        sessionId: response.data.data.sessionId,
        validated: response.data.data.validated,
        message: response.data.message,
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Validate checkout for payment failed:', error.message);
      if (error.response) {
        console.error('[Celler Hut Orders] API Response:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to validate checkout');
      }
      throw new Error('Failed to validate checkout for payment');
    }
  }

  /**
   * PAYMENT-FIRST FLOW: Initiate payment WITHOUT creating order
   *
   * Used for Peach payments where we validate first, get payment, then create order.
   */
  async initiatePaymentFirst(paymentData: any, token?: string): Promise<any> {
    try {
      console.log('[Celler Hut Orders] Initiating payment-first flow...');
      console.log('[Celler Hut Orders] Payment data:', JSON.stringify(paymentData, null, 2));

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await cellerHutAPI.post(
        '/ecommerce/payments/initiate-payment-first',
        paymentData,
        { headers },
      );

      console.log('[Celler Hut Orders] Payment initiation response:', response);

      return {
        transactionId: response.data.transactionId,
        checkoutId: response.data.checkoutId,
        paymentUrl: response.data.paymentUrl,
        status: response.data.status,
        message: response.data.message,
      };
    } catch (error) {
      console.error('[Celler Hut Orders] Initiate payment-first failed:', error.message);
      if (error.response) {
        console.error('[Celler Hut Orders] API Response:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to initiate payment');
      }
      throw new Error('Failed to initiate payment');
    }
  }

  /**
   * PAYMENT-FIRST FLOW: Get checkout session data
   *
   * Retrieve validated checkout data from Redis session.
   */
  async getCheckoutSession(sessionId: string, token?: string): Promise<any> {
    try {
      console.log('[Celler Hut Orders] Getting checkout session:', sessionId);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await cellerHutAPI.get(
        `/ecommerce/checkout/session/${sessionId}`,
        { headers },
      );

      return response.data.data;
    } catch (error) {
      console.error('[Celler Hut Orders] Get checkout session failed:', error.message);
      throw new Error('Failed to get checkout session');
    }
  }

  /**
   * PAYMENT-FIRST FLOW: Verify payment status before creating order
   *
   * Verifies the payment with Peach Payments and retrieves the checkout session data
   * to create the order. Handles idempotency for already processed payments.
   */
  async verifyPaymentForOrder(data: { checkoutId: string }, token?: string): Promise<any> {
    try {
      console.log('[Celler Hut Orders] Verifying payment for order:', data.checkoutId);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await cellerHutAPI.post(
        '/ecommerce/payments/verify-for-order',
        data,
        { headers },
      );

      console.log('[Celler Hut Orders] Payment verification response:', response.data);

      return response.data;
    } catch (error) {
      console.error('[Celler Hut Orders] Verify payment for order failed:', error.message);
      throw new Error('Failed to verify payment for order');
    }
  }
}
