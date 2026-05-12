import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ReverseGeocodeDto {
  @ApiProperty({ example: -34.603722 })
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: -58.381592 })
  @Type(() => Number)
  @IsNumber()
  lng!: number;
}
