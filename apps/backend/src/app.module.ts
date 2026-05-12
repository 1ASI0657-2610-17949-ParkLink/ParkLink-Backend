import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ParkingModule } from './modules/parking/parking.module';
import { ReservationsModule } from './modules/reservation/reservations.module';
import { PaymentsModule } from './modules/payment/payments.module';
import { NotificationsModule } from './modules/notification/notifications.module';
import { MapsModule } from './modules/maps/maps.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    AuthModule,
    UsersModule,
    ParkingModule,
    ReservationsModule,
    PaymentsModule,
    NotificationsModule,
    MapsModule,
    HealthModule,
  ],
})
export class AppModule {}
