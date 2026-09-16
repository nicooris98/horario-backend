import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassPeriod } from './entities/class_period.entity';
import { ClassPeriodsController } from './class_periods.controller';
import { ClassPeriodsService } from './class_periods.service';

@Module({ imports: [TypeOrmModule.forFeature([ClassPeriod])], controllers: [ClassPeriodsController], providers: [ClassPeriodsService] })
export class ClassPeriodsModule {}
