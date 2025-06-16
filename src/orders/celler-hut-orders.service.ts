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
   */
  async create(createOrderDto: CreateOrderDto, token?: string): Promise<Order> {
    try {
      // Transform PickBazar order to Celler Hut format
      const cellerHutOrderData = transformOrderForCellerHut(createOrderDto);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await cellerHutAPI.post(
        '/ecommerce/orders',
        cellerHutOrderData,
        { headers },
      );

      // Transform response back to PickBazar format
      return transformCellerHutOrder(response.data);
    } catch (error) {
      console.error('[Celler Hut Orders] Create order failed:', error);
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

      return transformCellerHutOrder(response.data);
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

      const transformedData = Array.isArray(response.data.data)
        ? response.data.data.map(transformCellerHutOrder)
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

      const transformedData = Array.isArray(response.data.data)
        ? response.data.data.map(transformCellerHutOrder)
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
        wallet_amount: response.data.data.wallet_amount || 0,
        // wallet_currency: response.data.data.wallet_currency || 'ZAR',
        wallet_currency: 0,
        total_tax: response.data.data.total_tax || 0,
        shipping_charge: response.data.data.shipping_charge || 0,
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
}
