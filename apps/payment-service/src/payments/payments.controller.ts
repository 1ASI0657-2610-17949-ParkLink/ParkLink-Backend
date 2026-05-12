import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, type AuthenticatedUser } from '@parklink/common';
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
    @Headers('authorization') authorizationHeader: string | undefined,
  ) {
    return this.paymentsService.create(dto, user, authorizationHeader);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Get payment receipt' })
  receipt(@Param('id') id: string) {
    return this.paymentsService.receipt(id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  refund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @Headers('authorization') authorizationHeader: string | undefined,
  ) {
    return this.paymentsService.refund(id, dto, authorizationHeader);
  }
}
