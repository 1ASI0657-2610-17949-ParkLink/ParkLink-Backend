import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterOwnerDto {
  @ApiProperty({ example: 'Grace Hopper' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'grace.owner@parklink.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: '+5491198765432' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'private_owner' })
  @IsString()
  ownerType!: string;

  @ApiProperty({ example: 'CBU-0000000000000000000000' })
  @IsString()
  bankAccount!: string;
}