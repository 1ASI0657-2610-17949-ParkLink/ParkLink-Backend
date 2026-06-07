import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, type AuthenticatedUser } from '../../common';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ExtendReservationDto } from './dto/extend-reservation.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('Reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a reservation' })
  @ApiResponse({ status: 201, description: 'Reservation created as PENDING_PAYMENT' })
  create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservationsService.create(dto, user);
  }

  @Get('my')
  @ApiOperation({ summary: 'List authenticated user reservations' })
  findMyReservations(@CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.findMyReservations(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID' })
  findById(@Param('id') id: string) {
    return this.reservationsService.findById(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a reservation' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelReservationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservationsService.cancel(id, dto, user);
  }

  @Patch(':id/extend')
  @ApiOperation({ summary: 'Extend a reservation' })
  extend(
    @Param('id') id: string,
    @Body() dto: ExtendReservationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservationsService.extend(id, dto, user);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm a reservation after payment approval' })
  confirm(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.confirm(id, user);
  }
}
