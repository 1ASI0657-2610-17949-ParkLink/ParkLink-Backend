import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CalculateDistanceDto {
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
}
