import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TRAVEL_MODE, type TravelMode } from '../maps.provider';

export class CalculateDirectionsDto {
  @ApiProperty({ example: -34.603722 })
  @Type(() => Number)
  @IsNumber()
  originLat!: number;

  @ApiProperty({ example: -58.381592 })
  @Type(() => Number)
  @IsNumber()
  originLng!: number;

  @ApiProperty({ example: -34.615803 })
  @Type(() => Number)
  @IsNumber()
  destinationLat!: number;

  @ApiProperty({ example: -58.433298 })
  @Type(() => Number)
  @IsNumber()
  destinationLng!: number;

  @ApiPropertyOptional({ enum: TRAVEL_MODE, example: TRAVEL_MODE.DRIVING })
  @IsOptional()
  @IsEnum(TRAVEL_MODE)
  mode?: TravelMode;
}
