import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Matches, Min } from 'class-validator';

export class CreateParkingSpaceDto {
  @ApiProperty({ example: 'Cochera Palermo Centro' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Av. Santa Fe 3200, Buenos Aires, Argentina' })
  @IsString()
  address!: string;

  @ApiProperty({ example: 'Entrada por portón negro' })
  @IsString()
  reference!: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  pricePerHour!: number;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  openingTime!: string;

  @ApiProperty({ example: '22:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  closingTime!: string;
}
