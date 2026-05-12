import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { ParkingSpacesModule } from './parking-spaces/parking-spaces.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/parking-service/.env', '.env'],
    }),
    ParkingSpacesModule,
    HealthModule,
  ],
})
export class AppModule {}
