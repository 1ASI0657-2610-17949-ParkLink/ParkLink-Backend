import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [DatabaseModule, HttpModule, JwtModule.register({})],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
