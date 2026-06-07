import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { NOTIFICATION_TYPE, type NotificationType } from '../../../common';

export class CreateNotificationDto {
  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'Reserva confirmada' })
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty({ example: 'Tu reserva fue confirmada correctamente.' })
  @IsString()
  @MinLength(2)
  message!: string;

  @ApiProperty({ enum: NOTIFICATION_TYPE, example: NOTIFICATION_TYPE.RESERVATION_CONFIRMED })
  @IsEnum(NOTIFICATION_TYPE)
  type!: NotificationType;
}
