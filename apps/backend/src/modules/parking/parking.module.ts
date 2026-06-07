import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { MapsModule } from '../maps/maps.module';
import { ParkingSpacesController } from './parking-spaces.controller';
import { ParkingSpacesService } from './parking-spaces.service';

@Module({
  imports: [DatabaseModule, MapsModule, JwtModule.register({})],
  controllers: [ParkingSpacesController],
  providers: [ParkingSpacesService],
  exports: [ParkingSpacesService],
})
export class ParkingModule {}
