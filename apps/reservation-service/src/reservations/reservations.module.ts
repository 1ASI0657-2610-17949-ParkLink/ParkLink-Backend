import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [DatabaseModule, HttpModule, JwtModule.register({})],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
