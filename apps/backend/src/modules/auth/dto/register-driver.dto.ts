import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDriverDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'ada.driver@parklink.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: '+5491112345678' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'ABC-123' })
  @IsString()
  plateNumber!: string;
}