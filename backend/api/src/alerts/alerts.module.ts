import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Alert } from './entities/alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [TypeOrmModule],
  
})
export class AlertsModule {}
