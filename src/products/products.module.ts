import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CellerHutProductsService } from './celler-hut-products.service';
import {
  ProductsController,
  PopularProductsController,
  ProductsStockController,
  DraftProductsController,
  BestSellingProductsController,
} from './products.controller';

@Module({
  controllers: [
    ProductsController,
    PopularProductsController,
    BestSellingProductsController,
    ProductsStockController,
    DraftProductsController,
  ],
  providers: [ProductsService, CellerHutProductsService],
})
export class ProductsModule {}
