import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GoogleMapsAdapter } from './adapters/google-maps.adapter';
import { MAPS_PROVIDER } from './maps.provider';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

@Module({
  imports: [HttpModule],
  controllers: [MapsController],
  providers: [
    MapsService,
    GoogleMapsAdapter,
    {
      provide: MAPS_PROVIDER,
      useExisting: GoogleMapsAdapter,
    },
  ],
})
export class MapsModule {}
