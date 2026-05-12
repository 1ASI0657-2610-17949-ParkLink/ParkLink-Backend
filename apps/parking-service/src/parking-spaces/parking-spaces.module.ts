import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { ParkingSpacesController } from './parking-spaces.controller';
import { ParkingSpacesService } from './parking-spaces.service';

@Module({
  imports: [DatabaseModule, HttpModule, JwtModule.register({})],
  controllers: [ParkingSpacesController],
  providers: [ParkingSpacesService],
})
export class ParkingSpacesModule {}
