import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PARKING_SPACE_STATUS } from '../../../common';

export class SearchParkingSpacesDto {
  @ApiPropertyOptional({ example: -34.603722 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: -58.381592 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ example: 5, description: 'Maximum distance in kilometers' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDistance?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '20:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ enum: PARKING_SPACE_STATUS, example: PARKING_SPACE_STATUS.AVAILABLE })
  @IsOptional()
  @IsEnum(PARKING_SPACE_STATUS)
  status?: string;

  @ApiPropertyOptional({ example: 50, default: 50, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
