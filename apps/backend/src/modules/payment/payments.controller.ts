import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, type AuthenticatedUser } from '../../common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a mock payment' })
  @ApiResponse({ status: 201, description: 'Mock payment processed' })
  create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.paymentsService.create(dto, user, idempotencyKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.findById(id, user);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Get payment receipt' })
  receipt(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.receipt(id, user);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  refund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentsService.refund(id, dto, user);
  }
}
