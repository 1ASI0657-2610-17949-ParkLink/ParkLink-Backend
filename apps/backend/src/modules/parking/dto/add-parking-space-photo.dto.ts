import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class AddParkingSpacePhotoDto {
  @ApiPropertyOptional({
    description: 'Existing public photo URL to attach without generating a presigned upload URL',
    example: 'https://cdn.example.com/parking-space/photo.jpg',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;

  @ApiPropertyOptional({ example: 'front-view.jpg' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  @Matches(/^image\/(jpeg|png|webp|gif)$/)
  contentType?: string;
}
