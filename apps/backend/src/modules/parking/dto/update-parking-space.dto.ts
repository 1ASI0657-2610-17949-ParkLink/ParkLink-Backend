import { PartialType } from '@nestjs/swagger';
import { CreateParkingSpaceDto } from './create-parking-space.dto';

export class UpdateParkingSpaceDto extends PartialType(CreateParkingSpaceDto) {}
