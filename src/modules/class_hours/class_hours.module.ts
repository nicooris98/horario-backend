import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassHoursController } from './class_hours.controller';
import { ClassHoursService } from './class_hours.service';
import { ClassHour } from './entities/class_hour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassHour])],
  controllers: [ClassHoursController],
  providers: [ClassHoursService],
})
export class ClassHoursModule {}
