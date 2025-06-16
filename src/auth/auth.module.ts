import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CellerHutAuthService } from './celler-hut-auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CellerHutAuthService],
  exports: [AuthService, CellerHutAuthService],
})
export class AuthModule {}
