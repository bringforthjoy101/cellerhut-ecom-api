import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

@Module({})
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: STRIPE_CLIENT,
          useFactory: (configService: ConfigService) => {
            const apiKey = configService.get<string>('STRIPE_API_KEY');
            if (!apiKey) {
              console.warn(
                'Warning: STRIPE_API_KEY not set. Stripe functionality will be disabled.',
              );
              return null;
            }
            return new Stripe(apiKey, {
              apiVersion: '2022-11-15',
            });
          },
          inject: [ConfigService],
        },
      ],
      exports: [STRIPE_CLIENT],
    };
  }
}
