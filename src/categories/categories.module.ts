import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CellerHutCategoriesService } from './celler-hut-categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CellerHutCategoriesService],
  exports: [CategoriesService, CellerHutCategoriesService],
})
export class CategoriesModule {}
