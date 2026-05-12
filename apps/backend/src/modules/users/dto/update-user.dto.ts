import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ada Byron' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({ example: '+5491111111111' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'DEF-456' })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiPropertyOptional({ example: 'company_owner' })
  @IsOptional()
  @IsString()
  ownerType?: string;

  @ApiPropertyOptional({ example: 'CBU-1111111111111111111111' })
  @IsOptional()
  @IsString()
  bankAccount?: string;
}