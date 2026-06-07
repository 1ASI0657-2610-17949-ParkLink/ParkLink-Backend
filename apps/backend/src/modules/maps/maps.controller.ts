import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SkipResponseWrap } from '../../common';
import { CalculateDirectionsDto } from './dto/calculate-directions.dto';
import { CalculateDistanceDto } from './dto/calculate-distance.dto';
import { GeocodeAddressDto } from './dto/geocode-address.dto';
import { ReverseGeocodeDto } from './dto/reverse-geocode.dto';
import { StaticMapDto } from './dto/static-map.dto';
import { MapsService } from './maps.service';

@ApiTags('Maps')
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('geocode')
  @ApiOperation({ summary: 'Geocode an address using Google Maps API' })
  @ApiResponse({ status: 200, description: 'Address geocoded' })
  geocode(@Query() query: GeocodeAddressDto) {
    return this.mapsService.geocode(query.address);
  }

  @Get('reverse-geocode')
  @ApiOperation({ summary: 'Reverse geocode coordinates using Google Maps API' })
  reverseGeocode(@Query() query: ReverseGeocodeDto) {
    return this.mapsService.reverseGeocode(query.lat, query.lng);
  }

  @Get('distance')
  @ApiOperation({ summary: 'Calculate distance between coordinates using Google Maps API' })
  calculateDistance(@Query() query: CalculateDistanceDto) {
    return this.mapsService.calculateDistance(
      query.originLat,
      query.originLng,
      query.destinationLat,
      query.destinationLng,
    );
  }

  @Get('directions')
  @ApiOperation({ summary: 'Calculate route directions between coordinates using Google Directions API' })
  calculateDirections(@Query() query: CalculateDirectionsDto) {
    return this.mapsService.calculateDirections(
      query.originLat,
      query.originLng,
      query.destinationLat,
      query.destinationLng,
      query.mode,
    );
  }

  @Get('static-map')
  @SkipResponseWrap()
  @ApiOperation({ summary: 'Render a static map image without exposing the Google Maps API key' })
  async staticMap(@Query() query: StaticMapDto, @Res() response: Response): Promise<void> {
    const result = await this.mapsService.getStaticMapImage(
      query.centerLat,
      query.centerLng,
      query.zoom,
      query.width,
      query.height,
    );

    response.setHeader('Content-Type', result.contentType);
    response.send(result.image);
  }
}
