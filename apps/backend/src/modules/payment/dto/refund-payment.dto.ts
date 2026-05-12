import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({ example: 'User requested refund before reservation start' })
  @IsString()
  @MinLength(3)
  reason!: string;
}
