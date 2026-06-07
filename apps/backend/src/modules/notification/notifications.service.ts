import { Injectable, NotFoundException } from '@nestjs/common';
import { type NotificationType } from '../../common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string): Promise<NotificationRecord[]> {
    return (await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })) as NotificationRecord[];
  }

  async create(dto: CreateNotificationDto, currentUserId: string): Promise<NotificationRecord> {
    return (await this.prisma.notification.create({
      data: {
        userId: dto.userId ?? currentUserId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
      },
    })) as NotificationRecord;
  }

  async markAsRead(id: string, userId: string): Promise<NotificationRecord> {
    const notification = (await this.prisma.notification.findUnique({ where: { id } })) as NotificationRecord | null;

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return (await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })) as NotificationRecord;
  }
}
