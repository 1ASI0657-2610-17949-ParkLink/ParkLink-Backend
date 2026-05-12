import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 'parking-space-id' })
  @IsString()
  parkingSpaceId!: string;

  @ApiProperty({ example: '2026-05-12T10:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  startTime!: Date;

  @ApiProperty({ example: '2026-05-12T12:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  endTime!: Date;
}
