import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class StaticMapDto {
  @ApiProperty({ example: -34.603722 })
  @Type(() => Number)
  @IsNumber()
  centerLat!: number;

  @ApiProperty({ example: -58.381592 })
  @Type(() => Number)
  @IsNumber()
  centerLng!: number;

  @ApiPropertyOptional({ example: 15, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  zoom?: number;

  @ApiPropertyOptional({ example: 640, minimum: 100, maximum: 640 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(640)
  width?: number;

  @ApiPropertyOptional({ example: 400, minimum: 100, maximum: 640 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(640)
  height?: number;
}
