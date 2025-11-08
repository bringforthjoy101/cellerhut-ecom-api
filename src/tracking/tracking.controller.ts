import { Controller, Get, Param, Headers } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  /**
   * Get tracking information for an order by tracking number
   * GET /tracking/:trackingNumber
   */
  @Get(':trackingNumber')
  async getTracking(
    @Param('trackingNumber') trackingNumber: string,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.trackingService.getOrderTracking(trackingNumber, token);
  }

  /**
   * Get tracking by order number
   * GET /tracking/order/:orderNumber
   */
  @Get('order/:orderNumber')
  async getTrackingByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.trackingService.getTrackingByOrderNumber(orderNumber, token);
  }
}
