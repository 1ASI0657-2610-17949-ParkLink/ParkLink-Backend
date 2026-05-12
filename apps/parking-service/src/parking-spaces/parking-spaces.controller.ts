import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, USER_ROLE, type AuthenticatedUser } from '@parklink/common';
import { CreateParkingSpaceDto } from './dto/create-parking-space.dto';
import { SearchParkingSpacesDto } from './dto/search-parking-spaces.dto';
import { UpdateParkingSpaceStatusDto } from './dto/update-parking-space-status.dto';
import { UpdateParkingSpaceDto } from './dto/update-parking-space.dto';
import { ParkingSpacesService } from './parking-spaces.service';

@ApiTags('Parking Spaces')
@Controller('parking-spaces')
export class ParkingSpacesController {
  constructor(private readonly parkingSpacesService: ParkingSpacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLE.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a parking space' })
  @ApiResponse({ status: 201, description: 'Parking space created' })
  create(@Body() dto: CreateParkingSpaceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.parkingSpacesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List parking spaces' })
  findAll() {
    return this.parkingSpacesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search available parking spaces' })
  search(@Query() query: SearchParkingSpacesDto) {
    return this.parkingSpacesService.search(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Parking space ID' })
  @ApiOperation({ summary: 'Get parking space by ID' })
  findById(@Param('id') id: string) {
    return this.parkingSpacesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update parking space' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateParkingSpaceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.parkingSpacesService.update(id, dto, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update parking space status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateParkingSpaceStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.parkingSpacesService.updateStatus(id, dto.status, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete parking space' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.parkingSpacesService.remove(id, user);
  }
}
