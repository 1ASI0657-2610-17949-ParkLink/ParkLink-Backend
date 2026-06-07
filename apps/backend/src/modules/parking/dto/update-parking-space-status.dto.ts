import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PARKING_SPACE_STATUS, type ParkingSpaceStatus } from '../../../common';

export class UpdateParkingSpaceStatusDto {
  @ApiProperty({ enum: PARKING_SPACE_STATUS, example: PARKING_SPACE_STATUS.AVAILABLE })
  @IsEnum(PARKING_SPACE_STATUS)
  status!: ParkingSpaceStatus;
}
