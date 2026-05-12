import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { ParkingSpacesController } from './parking-spaces.controller';
import { ParkingSpacesService } from './parking-spaces.service';

@Module({
  imports: [DatabaseModule, HttpModule, JwtModule.register({})],
  controllers: [ParkingSpacesController],
  providers: [ParkingSpacesService],
  exports: [ParkingSpacesService],
})
export class ParkingModule {}
