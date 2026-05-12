import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class ExtendReservationDto {
  @ApiProperty({ example: '2026-05-12T13:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  newEndTime!: Date;
}
