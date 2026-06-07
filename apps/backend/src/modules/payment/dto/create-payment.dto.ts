import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PAYMENT_STATUS, type PaymentStatus } from '../../../common';

export class CreatePaymentDto {
  @ApiProperty({ example: 'reservation-id' })
  @IsString()
  reservationId!: string;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'mock-card' })
  @IsString()
  paymentMethod!: string;

  @ApiPropertyOptional({ enum: [PAYMENT_STATUS.APPROVED, PAYMENT_STATUS.REJECTED] })
  @IsOptional()
  @IsEnum({ APPROVED: PAYMENT_STATUS.APPROVED, REJECTED: PAYMENT_STATUS.REJECTED })
  forceResult?: PaymentStatus;
}
