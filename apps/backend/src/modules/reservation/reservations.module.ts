import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { AvailabilityCacheModule } from '../availability-cache/availability-cache.module';
import { AuditModule } from '../audit/audit.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [DatabaseModule, AvailabilityCacheModule, AuditModule, JwtModule.register({})],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
