import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import cellerHutAPI from '../common/celler-hut-client';

@Injectable()
export class TrackingService {
  /**
   * Get tracking information for an order using tracking number
   * Uses secure customer endpoint and transforms order data to tracking format
   */
  async getOrderTracking(trackingNumber: string, token?: string) {
    try {
      // Call secure Main API customer endpoint
      const response = await cellerHutAPI.get(
        `/ecommerce/orders/tracking/${trackingNumber}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );
      console.log(response);

      if (!response.data || response.status !== 200) {
        throw new HttpException(
          'Failed to get tracking info',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Response contains order data with tracking fields
      const orderData = response.data;

      // Transform order data to GPS tracking format
      return {
        orderId: orderData.id,
        orderNumber: orderData.tracking_number,
        orderStatus: orderData.order_status,
        trackingEnabled: orderData.tracking_enabled || false,
        trackingUrl: orderData.tracking_url,
        deliveryService: orderData.delivery_service,
        driver: orderData.driver_name
          ? {
              id: orderData.driver_id,
              name: orderData.driver_name,
              phone: orderData.driver_phone,
              photo: orderData.driver_photo,
              vehicleNumber: orderData.driver_vehicle_number,
              location:
                orderData.delivery_latitude && orderData.delivery_longitude
                  ? {
                      lat: parseFloat(orderData.delivery_latitude),
                      lng: parseFloat(orderData.delivery_longitude),
                    }
                  : null,
            }
          : null,
        delivery: {
          estimatedTime: orderData.estimated_delivery_time,
          actualTime: orderData.actual_delivery_time,
          location:
            orderData.delivery_latitude && orderData.delivery_longitude
              ? {
                  lat: parseFloat(orderData.delivery_latitude),
                  lng: parseFloat(orderData.delivery_longitude),
                }
              : null,
          proofOfDelivery: {
            signature: orderData.delivery_signature_url,
            photo: orderData.delivery_photo_url,
          },
        },
        timeline: [], // Timeline would need to be fetched from delivery history endpoint
      };
    } catch (error) {
      console.error('Error getting tracking info:', error);
      throw new HttpException(
        error.message || 'Failed to get tracking information',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get tracking by order number
   * Now directly calls getOrderTracking since it uses tracking numbers
   */
  async getTrackingByOrderNumber(orderNumber: string, token?: string) {
    try {
      // getOrderTracking now uses tracking numbers, so just pass it through
      return this.getOrderTracking(orderNumber, token);
    } catch (error) {
      console.error('Error getting tracking by order number:', error);
      throw new HttpException(
        error.message || 'Failed to get tracking information',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
