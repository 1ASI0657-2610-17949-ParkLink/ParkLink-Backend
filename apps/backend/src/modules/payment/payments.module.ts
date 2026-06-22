import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { AvailabilityCacheModule } from '../availability-cache/availability-cache.module';
import { AuditModule } from '../audit/audit.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [DatabaseModule, AvailabilityCacheModule, AuditModule, JwtModule.register({})],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
