import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { AvailabilityCacheModule } from '../availability-cache/availability-cache.module';
import { AuditModule } from '../audit/audit.module';
import { MapsModule } from '../maps/maps.module';
import { ParkingSpacesController } from './parking-spaces.controller';
import { ParkingSpacesService } from './parking-spaces.service';

@Module({
  imports: [DatabaseModule, MapsModule, AvailabilityCacheModule, AuditModule, JwtModule.register({})],
  controllers: [ParkingSpacesController],
  providers: [ParkingSpacesService],
  exports: [ParkingSpacesService],
})
export class ParkingModule {}
