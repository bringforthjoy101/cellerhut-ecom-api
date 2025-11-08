import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
// PaymentModule removed - payment processing now handled by Main API
// import { PaymentModule } from 'src/payment/payment.module';
import {
  DownloadInvoiceController,
  OrderExportController,
  OrderFilesController,
  OrdersController,
  OrderStatusController,
} from './orders.controller';
import { OrdersService } from './orders.service';
import { CellerHutOrdersService } from './celler-hut-orders.service';

@Module({
  imports: [AuthModule], // Removed PaymentModule
  controllers: [
    OrdersController,
    OrderStatusController,
    OrderFilesController,
    OrderExportController,
    DownloadInvoiceController,
  ],
  providers: [OrdersService, CellerHutOrdersService],
  exports: [OrdersService, CellerHutOrdersService],
})
export class OrdersModule {}
