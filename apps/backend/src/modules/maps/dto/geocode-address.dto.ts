import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GeocodeAddressDto {
  @ApiProperty({ example: 'Av. Santa Fe 3200, Buenos Aires, Argentina' })
  @IsString()
  @MinLength(3)
  address!: string;
}
