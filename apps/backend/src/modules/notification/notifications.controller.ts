import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, type AuthenticatedUser } from '../../common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for authenticated user' })
  findForUser(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findForUser(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create an internal notification' })
  @ApiResponse({ status: 201, description: 'Notification created' })
  create(@Body() dto: CreateNotificationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.create(dto, user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAsRead(id, user.sub);
  }
}
