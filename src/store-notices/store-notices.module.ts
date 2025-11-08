import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { StoreNoticesController } from './store-notices.controller';
import { StoreNoticesService } from './store-notices.service';

@Module({
  imports: [UsersModule],
  controllers: [StoreNoticesController],
  providers: [StoreNoticesService],
})
export class StoreNoticesModule {}
